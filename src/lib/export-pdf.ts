import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function inlineImages(element: HTMLElement): Promise<void> {
  const imgs = element.querySelectorAll("img");
  for (const img of imgs) {
    if (img.src && !img.src.startsWith("data:")) {
      try {
        const resp = await fetch(img.src);
        const blob = await resp.blob();
        const dataUrl = await blobToDataUrl(blob);
        img.src = dataUrl;
      } catch {
        // leave original src if fetch fails
      }
    }
  }
}

interface PdfLinkRect {
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function collectPdfLinks(
  element: HTMLElement,
  containerRect: DOMRect,
  scaleX: number,
  scaleY: number
): PdfLinkRect[] {
  const links: PdfLinkRect[] = [];
  const els = element.querySelectorAll<HTMLElement>("[data-pdf-url]");
  for (const el of els) {
    const url = el.getAttribute("data-pdf-url");
    if (!url) continue;
    const rect = el.getBoundingClientRect();
    links.push({
      url,
      x: (rect.left - containerRect.left) * scaleX,
      y: (rect.top - containerRect.top) * scaleY,
      w: rect.width * scaleX,
      h: rect.height * scaleY,
    });
  }
  return links;
}

export async function exportElementAsPdf(
  element: HTMLElement,
  filename = "resume.pdf"
) {
  await inlineImages(element);

  const containerRect = element.getBoundingClientRect();

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  // A4 size in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const usableWidth = pageWidth - 2 * margin;
  const usableHeight = pageHeight - 2 * margin;

  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF("p", "mm", "a4");

  // Canvas pixels per PDF page (usable area)
  const pxPerPage = (usableHeight / imgHeight) * canvas.height;

  let pageIndex = 0;
  let srcY = 0;

  while (srcY < canvas.height) {
    const sliceHeight = Math.min(pxPerPage, canvas.height - srcY);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const ctx = pageCanvas.getContext("2d")!;
    ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    const pageImg = pageCanvas.toDataURL("image/png");
    const sliceHeightMm = (sliceHeight * imgWidth) / canvas.width;

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(pageImg, "PNG", margin, margin, imgWidth, sliceHeightMm);

    srcY += pxPerPage;
    pageIndex++;
  }

  // Overlay clickable link rectangles
  const scaleX = imgWidth / containerRect.width;
  const scaleY = imgHeight / containerRect.height;
  const pdfLinks = collectPdfLinks(element, containerRect, scaleX, scaleY);

  for (const link of pdfLinks) {
    const linkYInImage = link.y; // mm within the full image
    const linkX = margin + link.x;

    // Determine which page this link falls on
    const usableHeightPx = pxPerPage;
    const linkYPx = (linkYInImage / imgHeight) * canvas.height;
    const pageIdx = Math.floor(linkYPx / usableHeightPx);
    const remainderPx = linkYPx - pageIdx * usableHeightPx;
    const linkYOnPage = margin + (remainderPx / usableHeightPx) * usableHeight;

    const totalPages = pdf.getNumberOfPages();
    if (pageIdx < totalPages) {
      pdf.setPage(pageIdx + 1);
      pdf.link(linkX, linkYOnPage, link.w, link.h, { url: link.url });
    }
  }

  pdf.save(filename);
}
