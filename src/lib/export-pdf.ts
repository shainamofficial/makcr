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

export async function exportElementAsPdf(
  element: HTMLElement,
  filename = "resume.pdf"
) {
  // Pre-fetch cross-origin images and convert to base64 data URLs
  await inlineImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // Letter size in mm
  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const margin = 10; // mm
  const usableWidth = pageWidth - 2 * margin;
  const usableHeight = pageHeight - 2 * margin;

  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF("p", "mm", "letter");

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

  pdf.save(filename);
}
