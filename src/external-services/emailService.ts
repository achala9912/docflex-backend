import nodemailer, { SentMessageInfo, Transporter } from "nodemailer";
import { PrescriptionData } from "../types/prescriptionTypes";

const createTransporter = (): Transporter => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error("Email credentials not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

export const sendPrescriptionEmail = async (
  patientEmail: string,
  prescriptionData: PrescriptionData,
  pdfBuffer: Buffer
): Promise<SentMessageInfo> => {
  try {
    // Validate recipient email
    if (!patientEmail || !patientEmail.includes("@")) {
      throw new Error("Invalid patient email address");
    }

    const transporter = createTransporter();

    const fromAddress =
      process.env.EMAIL_FROM ||
      `${prescriptionData.centerId.centerName} <${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from: fromAddress,
      to: patientEmail,
      subject: `Your Prescription #${prescriptionData.prescriptionNo}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { padding: 20px; background-color: #ffffff; }
                .footer { background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
                .prescription-details { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${prescriptionData.centerId.centerName}</h1>
                <p>${prescriptionData.centerId.address}</p>
            </div>
            <div class="content">
                <h2>Your Prescription</h2>
                <p>Dear ${prescriptionData.patientId.title} ${
        prescriptionData.patientId.patientName
      },</p>
                <p>Please find your prescription attached to this email.</p>
                
                <div class="prescription-details">
                    <p><strong>Prescription #:</strong> ${
                      prescriptionData.prescriptionNo
                    }</p>
                    <p><strong>Date:</strong> ${new Date(
                      prescriptionData.createdAt
                    ).toLocaleDateString()}</p>
                    <p><strong>Doctor:</strong> Dr. ${
                      prescriptionData.prescriberDetails.name
                    }</p>
                </div>
                
                <p>If you have any questions, please contact our office.</p>
            </div>
            <div class="footer">
                <p>${prescriptionData.centerId.centerName}</p>
                <p>${prescriptionData.centerId.contactNo} | ${
        prescriptionData.centerId.email
      }</p>
            </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `prescription-${prescriptionData.prescriptionNo}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${patientEmail}`);
    return result;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(
      `Failed to send email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
