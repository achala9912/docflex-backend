import PDFDocument from "pdfkit";
import { PrescriptionData, Medication } from "../types/prescriptionTypes";

export const generatePrescriptionPDF = (
  prescriptionData: PrescriptionData
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        bufferPages: true,
      });

      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add background color for header
      doc.rect(0, 0, doc.page.width, 120).fill("#1e3a8a");

      // Clinic/Medical Center Information - Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(prescriptionData.centerId.centerName, 50, 30, {
          align: "center",
        });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#e0f2fe")
        .text(prescriptionData.centerId.address, 50, 60, { align: "center" });

      if (prescriptionData.centerId.town) {
        doc.text(prescriptionData.centerId.town, { align: "center" });
      }

      doc.moveDown(0.3);
      doc.text(
        `📧 ${prescriptionData.centerId.email} | 📞 ${prescriptionData.centerId.contactNo}`,
        { align: "center" }
      );

      // Prescription Details Box
      const boxY = 130;
      doc
        .rect(40, boxY, doc.page.width - 80, 80)
        .fill("#f8fafc")
        .stroke("#e2e8f0");

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("MEDICAL PRESCRIPTION", 50, boxY + 15, { align: "center" });

      doc.fontSize(10).fillColor("#4b5563");
      doc.text(
        `Prescription #: ${prescriptionData.prescriptionNo}`,
        60,
        boxY + 45
      );
      doc.text(
        `Date: ${new Date(prescriptionData.createdAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}`,
        doc.page.width - 200,
        boxY + 45
      );

      // Doctor information
      doc.fontSize(11).fillColor("#1e40af");
      doc.text(
        `Dr. ${prescriptionData.prescriberDetails.name}`,
        doc.page.width - 200,
        boxY + 65
      );
      doc.fontSize(9).fillColor("#64748b");
      doc.text(
        prescriptionData.prescriberDetails.specialization,
        doc.page.width - 200,
        boxY + 80
      );
      doc.text(
        `SLMC: ${prescriptionData.prescriberDetails.slmcNo}`,
        doc.page.width - 200,
        boxY + 95
      );

      // Patient Information Section
      const patientY = boxY + 110;
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text("PATIENT INFORMATION", 50, patientY);

      doc
        .moveTo(50, patientY + 20)
        .lineTo(200, patientY + 20)
        .strokeColor("#1e3a8a")
        .stroke();

      // Patient details in two columns
      doc.fontSize(11).fillColor("#374151");
      doc.text(
        `Name: ${prescriptionData.patientId.title} ${prescriptionData.patientId.patientName}`,
        60,
        patientY + 35
      );
      doc.text(`Age: ${prescriptionData.patientId.age}`, 60, patientY + 55);
      doc.text(
        `Contact: ${prescriptionData.patientId.contactNo}`,
        300,
        patientY + 35
      );
      doc.text(
        `Email: ${prescriptionData.patientId.email}`,
        300,
        patientY + 55
      );

      // Medical Information Section
      const medicalY = patientY + 85;

      // Reason for Visit
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text("REASON FOR VISIT", 50, medicalY);
      doc
        .rect(50, medicalY + 20, doc.page.width - 100, 30)
        .fill("#f1f5f9")
        .stroke("#e2e8f0");
      doc
        .fontSize(11)
        .fillColor("#374151")
        .text(prescriptionData.reasonForVisit, 60, medicalY + 28);

      // Symptoms (if available)
      if (prescriptionData.symptoms) {
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .fillColor("#1e3a8a")
          .text("SYMPTOMS", 50, medicalY + 60);
        doc
          .rect(50, medicalY + 80, doc.page.width - 100, 30)
          .fill("#f1f5f9")
          .stroke("#e2e8f0");
        doc
          .fontSize(11)
          .fillColor("#374151")
          .text(prescriptionData.symptoms, 60, medicalY + 88);
      }

      // Clinical Details
      const clinicalY = medicalY + (prescriptionData.symptoms ? 120 : 60);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text("CLINICAL FINDINGS", 50, clinicalY);
      doc
        .rect(50, clinicalY + 20, doc.page.width - 100, 40)
        .fill("#f1f5f9")
        .stroke("#e2e8f0");
      doc
        .fontSize(11)
        .fillColor("#374151")
        .text(
          prescriptionData.clinicalDetails ||
            "No significant clinical findings",
          60,
          clinicalY + 28,
          {
            width: doc.page.width - 120,
            align: "left",
          }
        );

      // Vital Signs Section - In a table format
      const vitalSignsY = clinicalY + 80;
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text("VITAL SIGNS", 50, vitalSignsY);

      // Check if vitalSigns exists and is an array with at least one element
      if (
        prescriptionData.vitalSigns &&
        Array.isArray(prescriptionData.vitalSigns) &&
        prescriptionData.vitalSigns.length > 0
      ) {
        const vitalSigns = prescriptionData.vitalSigns[0];

        // Create a table for vital signs
        const tableTop = vitalSignsY + 20;
        const col1 = 60;
        const col2 = 200;
        const col3 = 340;
        const col4 = 450;
        const rowHeight = 25;

        // Table headers
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#1e40af");
        doc.text("Parameter", col1, tableTop);
        doc.text("Value", col2, tableTop);
        doc.text("Parameter", col3, tableTop);
        doc.text("Value", col4, tableTop);

        doc
          .moveTo(50, tableTop + 15)
          .lineTo(doc.page.width - 50, tableTop + 15)
          .strokeColor("#cbd5e1")
          .stroke();

        // Table rows
        doc.fontSize(10).font("Helvetica").fillColor("#374151");
        let row = 1;

        if (vitalSigns.weight && vitalSigns.weight !== "undefined") {
          doc.text("Weight", col1, tableTop + row * rowHeight);
          doc.text(vitalSigns.weight, col2, tableTop + row * rowHeight);
          row++;
        }

        if (vitalSigns.height && vitalSigns.height !== "undefined") {
          doc.text("Height", col1, tableTop + row * rowHeight);
          doc.text(vitalSigns.height, col2, tableTop + row * rowHeight);
          row++;
        }

        if (vitalSigns.bmi && vitalSigns.bmi !== "undefined") {
          doc.text("BMI", col3, tableTop + row * rowHeight);
          doc.text(vitalSigns.bmi, col4, tableTop + row * rowHeight);
          row++;
        }

        if (vitalSigns.pulseRate && vitalSigns.pulseRate !== "undefined") {
          doc.text("Pulse Rate", col3, tableTop + row * rowHeight);
          doc.text(vitalSigns.pulseRate, col4, tableTop + row * rowHeight);
        }
      } else {
        doc
          .fontSize(10)
          .fillColor("#64748b")
          .text("No vital signs recorded", 60, vitalSignsY + 25);
      }

      // Medications Section - Most important part for pharmacists
      const medsY = vitalSignsY + 100;
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text("PRESCRIPTION MEDICATIONS", 50, medsY, { align: "center" });

      doc
        .moveTo(50, medsY + 20)
        .lineTo(doc.page.width - 50, medsY + 20)
        .strokeColor("#1e3a8a")
        .lineWidth(2)
        .stroke();

      if (
        prescriptionData.medications &&
        prescriptionData.medications.length > 0
      ) {
        let currentY = medsY + 40;

        prescriptionData.medications.forEach(
          (medication: Medication, index: number) => {
            // Medication card
            doc
              .rect(50, currentY, doc.page.width - 100, 80)
              .fill(index % 2 === 0 ? "#f0f9ff" : "#f8fafc")
              .stroke("#e0f2fe");

            // Medication name and generic name
            doc.fontSize(12).font("Helvetica-Bold").fillColor("#0369a1");
            doc.text(`${medication.productName}`, 60, currentY + 15);
            doc.fontSize(10).font("Helvetica").fillColor("#64748b");
            doc.text(`(${medication.genericName})`, 60, currentY + 35);

            // Dosage instructions
            doc.fontSize(11).fillColor("#374151");
            doc.text(`Dose: ${medication.dose}`, 250, currentY + 15);
            doc.text(`Frequency: ${medication.frequency}`, 250, currentY + 35);
            doc.text(`Duration: ${medication.duration}`, 250, currentY + 55);

            // Notes if available
            if (medication.note) {
              doc.fontSize(9).fillColor("#f59e0b");
              doc.text(`Note: ${medication.note}`, 400, currentY + 15, {
                width: 120,
                align: "left",
              });
            }

            currentY += 90;
          }
        );
      } else {
        doc
          .fontSize(11)
          .fillColor("#64748b")
          .text("No medications prescribed", 60, medsY + 40);
      }

      // Advice Section
      const adviceY = doc.y + 30;
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text("MEDICAL ADVICE & INSTRUCTIONS", 50, adviceY);

      doc
        .rect(50, adviceY + 20, doc.page.width - 100, 50)
        .fill("#f0fdf4")
        .stroke("#bbf7d0");

      doc
        .fontSize(11)
        .fillColor("#15803d")
        .text(
          prescriptionData.advice ||
            "Follow up as needed. Contact clinic if symptoms persist or worsen.",
          60,
          adviceY + 30,
          {
            width: doc.page.width - 120,
            align: "left",
          }
        );

      // Footer with signature
      const footerY = doc.page.height - 100;
      doc
        .moveTo(50, footerY)
        .lineTo(doc.page.width - 50, footerY)
        .strokeColor("#cbd5e1")
        .stroke();

      doc
        .fontSize(10)
        .fillColor("#64748b")
        .text(
          "This is an electronically generated prescription. No physical signature is required.",
          50,
          footerY + 10,
          { align: "center" }
        );

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#1e3a8a")
        .text(
          `Dr. ${prescriptionData.prescriberDetails.name}`,
          doc.page.width - 200,
          footerY + 30
        );

      doc
        .fontSize(9)
        .fillColor("#64748b")
        .text(
          prescriptionData.prescriberDetails.specialization,
          doc.page.width - 200,
          footerY + 50
        );
      doc.text(
        `SLMC: ${prescriptionData.prescriberDetails.slmcNo}`,
        doc.page.width - 200,
        footerY + 65
      );

      // Page numbering
      const bottom = doc.page.height - 50;
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text("Page 1 of 1", doc.page.width / 2, bottom, { align: "center" });

      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      reject(error);
    }
  });
};
