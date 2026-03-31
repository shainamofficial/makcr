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
  // Pre-fetch cross-origin images and convert to base64 data URLs
  await inlineImages(element);

  const containerRect = element.getBoundingClientRect();

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 size in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15; // mm
  const usableWidth = pageWidth - 2 * margin;
  const usableHeight = pageHeight - 2 * margin;

  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF("p", "mm", "a4");

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= usableHeight;

  while (heightLeft > 0) {
    position = margin - (imgHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= usableHeight;
  }

  // Overlay clickable link rectangles from [data-pdf-url] elements
  const scaleX = imgWidth / containerRect.width;
  const scaleY = imgHeight / containerRect.height;
  const pdfLinks = collectPdfLinks(element, containerRect, scaleX, scaleY);

  for (const link of pdfLinks) {
    const linkYInImage = link.y; // y position within the full image (mm)
    const linkX = margin + link.x;

    // Determine which page(s) this link falls on
    let remaining = linkYInImage;
    let pageIndex = 0;
    while (remaining > usableHeight) {
      remaining -= usableHeight;
      pageIndex++;
    }

    // Only add if the link is within rendered pages
    const totalPages = pdf.getNumberOfPages();
    if (pageIndex < totalPages) {
      pdf.setPage(pageIndex + 1);
      const linkYOnPage = margin + remaining;
      pdf.link(linkX, linkYOnPage, link.w, link.h, { url: link.url });
    }
  }

  pdf.save(filename);
}
