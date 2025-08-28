import PDFDocument from "pdfkit";
import { PrescriptionData } from "../types/prescriptionTypes";

export const generatePrescriptionPDF = (
  prescriptionData: PrescriptionData
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add header - Medical Center Information
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text(prescriptionData.centerId.centerName, { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(prescriptionData.centerId.address, { align: "center" });

      if (prescriptionData.centerId.town) {
        doc.text(prescriptionData.centerId.town, { align: "center" });
      }

      doc.moveDown(0.5);
      doc.text(`📧 ${prescriptionData.centerId.email}`, { align: "center" });
      doc.text(`📞 ${prescriptionData.centerId.contactNo}`, {
        align: "center",
      });

      // Add a horizontal line
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown();

      // Prescription Details
      doc.fontSize(12).fillColor("#000000");
      doc.text(`Prescription #: ${prescriptionData.prescriptionNo}`, {
        continued: true,
      });
      doc.text(
        `Date: ${new Date(prescriptionData.createdAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}`,
        { align: "right" }
      );

      // Doctor information
      doc.moveDown();
      doc.text(`Dr. ${prescriptionData.prescriberDetails.name}`, {
        align: "right",
      });
      doc
        .fontSize(10)
        .text(prescriptionData.prescriberDetails.specialization, {
          align: "right",
        });
      doc.text(`SLMC: ${prescriptionData.prescriberDetails.slmcNo}`, {
        align: "right",
      });

      // Add another horizontal line
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown();

      // Patient Details section
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("PATIENT DETAILS");
      doc
        .moveTo(50, doc.y + 5)
        .lineTo(150, doc.y + 5)
        .strokeColor("#1e40af")
        .stroke();
      doc.moveDown();

      doc.fontSize(12).font("Helvetica").fillColor("#000000");
      doc.text(
        `Name: ${prescriptionData.patientId.title} ${prescriptionData.patientId.patientName}`
      );
      doc.text(`Age: ${prescriptionData.patientId.age}`);
      doc.text(`Contact No: ${prescriptionData.patientId.contactNo}`);
      doc.text(`Email: ${prescriptionData.patientId.email}`);

      // Reason for Visit section
      doc.moveDown();
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("REASON FOR VISIT");
      doc
        .moveTo(50, doc.y + 5)
        .lineTo(180, doc.y + 5)
        .strokeColor("#1e40af")
        .stroke();
      doc.moveDown();

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#000000")
        .text(prescriptionData.reasonForVisit);

      // Vital Signs section
      doc.moveDown();
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("VITAL SIGNS");
      doc
        .moveTo(50, doc.y + 5)
        .lineTo(130, doc.y + 5)
        .strokeColor("#1e40af")
        .stroke();
      doc.moveDown();

      if (prescriptionData.vitalSigns) {
        doc.text(`Weight: ${prescriptionData.vitalSigns.weight}`);
        doc.text(`Height: ${prescriptionData.vitalSigns.height}`);
        doc.text(`BMI: ${prescriptionData.vitalSigns.bmi}`);
        doc.text(`Pulse Rate: ${prescriptionData.vitalSigns.pulseRate}`);
      } else {
        doc.text("No vital signs recorded");
      }

      // Clinical Details section
      doc.moveDown();
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("CLINICAL DETAILS IN BRIEF");
      doc
        .moveTo(50, doc.y + 5)
        .lineTo(250, doc.y + 5)
        .strokeColor("#1e40af")
        .stroke();
      doc.moveDown();

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#000000")
        .text(
          prescriptionData.clinicalDetails || "No clinical details provided"
        );

      // Advice section
      doc.moveDown();
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("ADVICE");
      doc
        .moveTo(50, doc.y + 5)
        .lineTo(90, doc.y + 5)
        .strokeColor("#1e40af")
        .stroke();
      doc.moveDown();

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#000000")
        .text(prescriptionData.advice || "No specific advice provided");

      // Medications section
      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af").text("Rx");
      doc
        .moveTo(50, doc.y + 5)
        .lineTo(70, doc.y + 5)
        .strokeColor("#1e40af")
        .stroke();
      doc.moveDown();

      if (
        prescriptionData.medications &&
        prescriptionData.medications.length > 0
      ) {
        prescriptionData.medications.forEach((medication, index) => {
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`${medication.productName} (${medication.genericName})`);
          doc
            .fontSize(12)
            .font("Helvetica")
            .text(
              `${medication.dose}, ${medication.frequency} for ${medication.duration}`
            );

          if (medication.note) {
            doc.fontSize(10).text(`Note: ${medication.note}`);
          }

          if (index < prescriptionData.medications.length - 1) {
            doc.moveDown(0.5);
          }
        });
      } else {
        doc.text("No medications prescribed");
      }

      // Footer with signature area
      doc.moveDown(3);
      doc.moveTo(400, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown(0.5);
      doc.fontSize(12).text("Signature", { align: "right" });
      doc
        .fontSize(12)
        .text(`Dr. ${prescriptionData.prescriberDetails.name}`, {
          align: "right",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
