import puppeteer from "puppeteer";
import { PrescriptionTemplateProps } from "./components/PrescriptionTemplate";
import { generatePrescriptionHTML } from "./components/htmlPrescriptionTemplate";

export async function generatePrescriptionPDF(
  data: PrescriptionTemplateProps
): Promise<Buffer> {
  try {
    const htmlContent = generatePrescriptionHTML(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const pdfUint8Array = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
      });
      
      const pdfBuffer = Buffer.from(pdfUint8Array);
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
