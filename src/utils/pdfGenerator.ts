
import puppeteer from "puppeteer";
import { PrescriptionTemplateProps } from "./components/PrescriptionTemplate";
import { generatePrescriptionHTML } from "./components/htmlPrescriptionTemplate";
import { convertImageToDataURL } from "./imageUtils";

export async function generatePrescriptionPDF(
  data: PrescriptionTemplateProps
): Promise<Buffer> {
  try {
 
    let logoDataURL = "";
    if (data.centerId.logo) {
      logoDataURL = await convertImageToDataURL(data.centerId.logo);
    }

    // Convert digital signature to data URL if it exists
    let signatureDataURL = "";
    if (data.prescriberDetails.digitalSignature) {
      signatureDataURL = await convertImageToDataURL(
        data.prescriberDetails.digitalSignature
      );
    }

    // Create a modified data object with data URLs
    const dataWithDataURLs = {
      ...data,
      centerId: {
        ...data.centerId,
        logo: logoDataURL,
      },
      prescriberDetails: {
        ...data.prescriberDetails,
        digitalSignature: signatureDataURL,
      },
    };

    const htmlContent = generatePrescriptionHTML(dataWithDataURLs);

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

      return Buffer.from(pdfUint8Array);
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
