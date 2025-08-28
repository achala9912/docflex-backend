import PDFDocument from "pdfkit";
import { PrescriptionData, Medication } from "../types/prescriptionTypes";

export const generatePrescriptionPDF = (
  prescriptionData: PrescriptionData
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 20,
        size: "A4",
        bufferPages: true,
      });

      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors
      const colors = {
        primary: '#1565c0',
        secondary: '#42a5f5',
        accent: '#0277bd',
        success: '#388e3c',
        warning: '#f57c00',
        neutral: '#616161',
        light: '#f5f5f5',
        white: '#ffffff',
        border: '#e0e0e0',
        text: '#212121'
      };

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Helper function for cards
      const drawCard = (x: number, y: number, width: number, height: number, fillColor: string = colors.white) => {
        doc.save();
        doc.roundedRect(x, y, width, height, 4)
           .fillColor(fillColor)
           .strokeColor(colors.border)
           .lineWidth(0.5)
           .fillAndStroke();
        doc.restore();
      };

      let currentY = 0;

      // HEADER - Compact
      doc.rect(0, 0, pageWidth, 80).fill(colors.primary);
      
      // Medical cross
      doc.save();
      doc.translate(25, 20);
      doc.rect(6, 2, 3, 18).fill(colors.white);
      doc.rect(2, 8, 11, 3).fill(colors.white);
      doc.restore();

      // Clinic info - single line
      doc.fontSize(18)
         .font("Helvetica-Bold")
         .fillColor(colors.white)
         .text(prescriptionData.centerId.centerName, 45, 25);

      doc.fontSize(9)
         .font("Helvetica")
         .fillColor('#bbdefb')
         .text(`${prescriptionData.centerId.address}, ${prescriptionData.centerId.town || ''}`, 45, 45);

      doc.fontSize(8)
         .text(`Email: ${prescriptionData.centerId.email} | Phone: ${prescriptionData.centerId.contactNo}`, 45, 60);

      currentY = 90;

      // PRESCRIPTION HEADER - Single line
      drawCard(margin, currentY, contentWidth, 35, colors.light);
      
      doc.fontSize(16)
         .font("Helvetica-Bold")
         .fillColor(colors.primary)
         .text("PRESCRIPTION", margin + 10, currentY + 8);

      doc.fontSize(9)
         .font("Helvetica")
         .fillColor(colors.text)
         .text(`#${prescriptionData.prescriptionNo}`, margin + 130, currentY + 12);

      doc.text(
        new Date(prescriptionData.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short", 
          year: "numeric"
        }),
        pageWidth - 100,
        currentY + 12
      );

      currentY += 45;

      // DOCTOR & PATIENT INFO - Side by side
      // Doctor info (left)
      drawCard(margin, currentY, contentWidth / 2 - 5, 55, colors.white);
      doc.fontSize(10)
         .font("Helvetica-Bold")
         .fillColor(colors.primary)
         .text("DOCTOR", margin + 8, currentY + 8);

      doc.fontSize(11)
         .font("Helvetica-Bold")
         .fillColor(colors.text)
         .text(`Dr. ${prescriptionData.prescriberDetails.name}`, margin + 8, currentY + 22);

      doc.fontSize(8)
         .font("Helvetica")
         .fillColor(colors.neutral)
         .text(prescriptionData.prescriberDetails.specialization, margin + 8, currentY + 36);

      doc.fontSize(7)
         .text(`SLMC: ${prescriptionData.prescriberDetails.slmcNo}`, margin + 8, currentY + 48);

      // Patient info (right)
      const patientX = margin + contentWidth / 2 + 5;
      drawCard(patientX, currentY, contentWidth / 2 - 5, 55, colors.white);
      
      doc.fontSize(10)
         .font("Helvetica-Bold")
         .fillColor(colors.primary)
         .text("PATIENT", patientX + 8, currentY + 8);

      doc.fontSize(9)
         .font("Helvetica-Bold")
         .fillColor(colors.text)
         .text(`${prescriptionData.patientId.title} ${prescriptionData.patientId.patientName}`, patientX + 8, currentY + 22);

      doc.fontSize(8)
         .font("Helvetica")
         .fillColor(colors.neutral)
         .text(`Age: ${prescriptionData.patientId.age} | ${prescriptionData.patientId.contactNo}`, patientX + 8, currentY + 36);

      doc.fontSize(7)
         .text(prescriptionData.patientId.email, patientX + 8, currentY + 48);

      currentY += 65;

      // CLINICAL INFO - Compact rows
      // Reason for visit
      drawCard(margin, currentY, contentWidth, 28, '#fff3e0');
      doc.fontSize(9)
         .font("Helvetica-Bold")
         .fillColor('#e65100')
         .text("REASON:", margin + 8, currentY + 6);
      
      doc.fontSize(9)
         .font("Helvetica")
         .fillColor('#bf360c')
         .text(prescriptionData.reasonForVisit, margin + 60, currentY + 6);

      // Symptoms (if available)
      if (prescriptionData.symptoms) {
        doc.fontSize(9)
           .font("Helvetica-Bold")
           .fillColor('#d32f2f')
           .text("SYMPTOMS:", margin + 8, currentY + 18);
        
        doc.fontSize(9)
           .font("Helvetica")
           .fillColor('#c62828')
           .text(prescriptionData.symptoms, margin + 75, currentY + 18);
      }

      currentY += 38;

      // Clinical findings
      drawCard(margin, currentY, contentWidth, 25, '#e8f5e8');
      doc.fontSize(9)
         .font("Helvetica-Bold")
         .fillColor('#2e7d32')
         .text("FINDINGS:", margin + 8, currentY + 8);
      
      doc.fontSize(9)
         .font("Helvetica")
         .fillColor('#1b5e20')
         .text(
           prescriptionData.clinicalDetails || "No significant findings",
           margin + 65,
           currentY + 8,
           { width: contentWidth - 75 }
         );

      currentY += 35;

      // VITAL SIGNS - Horizontal layout
      drawCard(margin, currentY, contentWidth, 30, colors.light);
      doc.fontSize(9)
         .font("Helvetica-Bold")
         .fillColor(colors.primary)
         .text("VITALS:", margin + 8, currentY + 8);

      if (prescriptionData.vitalSigns && 
          Array.isArray(prescriptionData.vitalSigns) && 
          prescriptionData.vitalSigns.length > 0) {
        
        const vitalSigns = prescriptionData.vitalSigns[0];
        let vitalText = "";
        
        if (vitalSigns.weight && vitalSigns.weight !== "undefined") {
          const weight = vitalSigns.weight.replace(/[^0-9.]/g, '');
          vitalText += `Weight: ${weight}kg  `;
        }
        
        if (vitalSigns.height && vitalSigns.height !== "undefined") {
          const height = vitalSigns.height.replace(/[^0-9.]/g, '');
          vitalText += `Height: ${height}cm  `;
        }
        
        if (vitalSigns.bmi && vitalSigns.bmi !== "undefined") {
          vitalText += `BMI: ${vitalSigns.bmi}  `;
        }
        
        if (vitalSigns.pulseRate && vitalSigns.pulseRate !== "undefined") {
          const bp = vitalSigns.pulseRate.replace(/MM/g, '');
          vitalText += `BP: ${bp}mmHg`;
        }

        doc.fontSize(8)
           .font("Helvetica")
           .fillColor(colors.success)
           .text(vitalText || "Not recorded", margin + 55, currentY + 8);
      } else {
        doc.fontSize(8)
           .fillColor(colors.neutral)
           .text("Not recorded", margin + 55, currentY + 8);
      }

      currentY += 40;

      // MEDICATIONS - Compact but clear
      doc.fontSize(12)
         .font("Helvetica-Bold")
         .fillColor(colors.primary)
         .text("MEDICATIONS", margin, currentY, { align: "center", width: contentWidth });

      doc.moveTo(margin, currentY + 18)
         .lineTo(pageWidth - margin, currentY + 18)
         .strokeColor(colors.primary)
         .lineWidth(1.5)
         .stroke();

      currentY += 30;

      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        prescriptionData.medications.forEach((medication: Medication, index: number) => {
          // Compact medication card
          drawCard(margin, currentY, contentWidth, 45, colors.white);

          // Number circle
          doc.save();
          doc.circle(margin + 15, currentY + 15, 8)
             .fillColor(colors.secondary)
             .fill();
          
          doc.fontSize(9)
             .font("Helvetica-Bold")
             .fillColor(colors.white)
             .text(`${index + 1}`, margin + 12, currentY + 12);
          doc.restore();

          // Medicine name
          doc.fontSize(11)
             .font("Helvetica-Bold")
             .fillColor(colors.text)
             .text(medication.productName, margin + 30, currentY + 8);

          doc.fontSize(8)
             .font("Helvetica")
             .fillColor(colors.neutral)
             .text(`${medication.genericName}`, margin + 30, currentY + 22);

          // Dosage info - horizontal
          doc.fontSize(8)
             .font("Helvetica")
             .fillColor(colors.text)
             .text(`${medication.dose} | ${medication.frequency} | ${medication.duration}`, margin + 30, currentY + 34);

          // Note if available
          if (medication.note) {
            doc.fontSize(7)
               .font("Helvetica-Bold")
               .fillColor(colors.warning)
               .text(`${medication.note}`, margin + 350, currentY + 15, {
                 width: 150
               });
          }

          currentY += 55;
        });
      } else {
        drawCard(margin, currentY, contentWidth, 25, '#ffebee');
        doc.fontSize(9)
           .fillColor('#d32f2f')
           .text("No medications prescribed", margin + 8, currentY + 8);
        currentY += 35;
      }

      // ADVICE - Compact
      drawCard(margin, currentY, contentWidth, 35, '#e8f5e8');
      doc.fontSize(9)
         .font("Helvetica-Bold")
         .fillColor(colors.success)
         .text("ADVICE:", margin + 8, currentY + 8);

      doc.fontSize(8)
         .font("Helvetica")
         .fillColor('#2e7d32')
         .text(
           prescriptionData.advice || "Take as prescribed. Follow up if needed.",
           margin + 55,
           currentY + 8,
           { width: contentWidth - 65 }
         );

      // FOOTER - Bottom of page
      const footerY = pageHeight - 60;
      
      // Signature area
      doc.moveTo(margin, footerY)
         .lineTo(pageWidth - margin, footerY)
         .strokeColor(colors.border)
         .stroke();

      doc.fontSize(8)
         .font("Helvetica")
         .fillColor(colors.neutral)
         .text("Digital prescription - Valid 30 days", margin, footerY + 10);

      doc.fontSize(9)
         .font("Helvetica-Bold")
         .fillColor(colors.text)
         .text(`Dr. ${prescriptionData.prescriberDetails.name}`, pageWidth - 180, footerY + 10);

      doc.fontSize(7)
         .font("Helvetica")
         .fillColor(colors.neutral)
         .text(`${prescriptionData.prescriberDetails.specialization} | SLMC: ${prescriptionData.prescriberDetails.slmcNo}`, pageWidth - 180, footerY + 25);

      // Generation info
      doc.fontSize(6)
         .fillColor('#9e9e9e')
         .text(
           `Generated: ${new Date().toLocaleString('en-GB')}`,
           margin,
           pageHeight - 15
         );

      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      reject(error);
    }
  });
};