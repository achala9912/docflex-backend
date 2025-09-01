import { PrescriptionTemplateProps } from "./PrescriptionTemplate";

export function generatePrescriptionHTML(data: PrescriptionTemplateProps): string {
  const vital = data.vitalSigns && data.vitalSigns.length > 0 ? data.vitalSigns[0] : {};
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prescription - ${data.prescriptionNo}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            color: #212121;
            background-color: #ffffff;
            line-height: 1.5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header-center {
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 24px;
            gap: 24px;
        }
        .logo-container {
            flex-shrink: 0;
        }
        .logo {
            max-width: 120px;
            height: auto;
        }
        .center-details {
            text-align: left;
        }
        .center-name {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 4px;
        }
        .center-info {
            font-size: 14px;
            color: #4b5563;
        }
        .prescription-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e7eb;
            padding: 16px 0;
            margin-bottom: 24px;
        }
        .prescription-info {
            font-size: 14px;
            color: #374151;
        }
        .info-label {
            font-weight: bold;
            color: #1e40af;
        }
        .grid-2-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }
        .section {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            border-left: 4px solid #3b82f6;
            padding-left: 12px;
            margin-bottom: 16px;
        }
        .info-grid {
            display: grid;
            gap: 8px;
        }
        .info-row {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 8px 12px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .info-icon {
            color: #2563eb;
            font-weight: bold;
        }
        .info-text {
            font-size: 14px;
            color: #374151;
        }
        .info-label-sm {
            font-weight: 500;
        }
        .vitals-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .vital-card {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .vital-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        .vital-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }
        .detail-section {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .medication-section {
            margin: 24px 0;
        }
        .rx-symbol {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            margin-right: 12px;
        }
        .medication-grid {
            display: grid;
            gap: 16px;
        }
        .medication-card {
            border: 1px solid #93c5fd;
            background-color: #dbeafe;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .med-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .med-icon {
            width: 20px;
            height: 20px;
            color: #2563eb;
            font-weight: bold;
        }
        .med-name {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            text-transform: uppercase;
        }
        .med-detail {
            font-size: 14px;
            color: #374151;
            margin-bottom: 6px;
        }
        .detail-label {
            font-weight: 600;
        }
        .signature-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
            margin-top: 32px;
            text-align: center;
        }
        .signature-image {
            max-width: 120px;
            height: auto;
            margin-bottom: 8px;
        }
        .doctor-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }
        .doctor-specialty {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .doctor-slmc {
            color: #6b7280;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
            color: #6b7280;
            font-size: 14px;
        }
        .footer-bold {
            font-weight: 600;
            color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header-center">
            ${data.centerId.logo ? `
            <div class="logo-container">
                <img src="${data.centerId.logo}" alt="Center Logo" class="logo">
            </div>
            ` : ''}
            <div class="center-details">
                <h1 class="center-name">${data.centerId.centerName || ''}</h1>
                <p class="center-info">${data.centerId.address || ''}, ${data.centerId.town || ''}</p>
                <p class="center-info">${data.centerId.email || ''} | ${data.centerId.contactNo || ''}</p>
            </div>
        </div>

        <!-- Prescription Info -->
        <div class="prescription-header">
            <div class="prescription-info">
                <span class="info-label">Prescription No:</span> ${data.prescriptionNo || ''}
            </div>
            <div class="prescription-info">
                <span class="info-label">Prescribed At:</span> ${formatDate(data.createdAt)}
            </div>
        </div>

        <!-- Patient Details & Vitals -->
        <div class="grid-2-col">
            <!-- Patient Details -->
            <div class="section">
                <h2 class="section-title">Patient Details</h2>
                <div class="info-grid">
                    <div class="info-row">
                        <span class="info-icon">👤</span>
                        <p class="info-text"><span class="info-label-sm">Name:</span> ${data.patientId.title || ''} ${data.patientId.patientName}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">🎂</span>
                        <p class="info-text"><span class="info-label-sm">Age:</span> ${data.patientId.age}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">📞</span>
                        <p class="info-text"><span class="info-label-sm">Contact:</span> ${data.patientId.contactNo}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">✉️</span>
                        <p class="info-text"><span class="info-label-sm">Email:</span> ${data.patientId.email}</p>
                    </div>
                </div>
            </div>

            <!-- Vital Signs -->
            <div class="section" style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);">
                <h2 class="section-title">Vital Signs</h2>
                <div class="vitals-grid">
                    <div class="vital-card">
                        <p class="vital-label">Weight</p>
                        <p class="vital-value">${vital.weight || 'N/A'}kg</p>
                    </div>
                    <div class="vital-card">
                        <p class="vital-label">Height</p>
                        <p class="vital-value">${vital.height || 'N/A'}cm</p>
                    </div>
                    <div class="vital-card">
                        <p class="vital-label">BMI</p>
                        <p class="vital-value">${vital.bmi || 'N/A'}</p>
                    </div>
                    <div class="vital-card">
                        <p class="vital-label">Temperature</p>
                        <p class="vital-value">${vital.temperature || 'N/A'}°C</p>
                    </div>
                    <div class="vital-card" style="grid-column: span 2;">
                        <p class="vital-label">Pulse Rate</p>
                        <p class="vital-value">${vital.pulseRate || 'N/A'}mm</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Clinical Details -->
        <div class="details-grid">
            <div class="detail-section">
                <h2 class="section-title">Reason for Visit</h2>
                <p class="info-text">${data.reasonForVisit}</p>
            </div>
            <div class="detail-section">
                <h2 class="section-title">Symptoms</h2>
                <p class="info-text">${data.symptoms && data.symptoms.length > 0 ? data.symptoms.join(', ') : 'None'}</p>
            </div>
            <div class="detail-section">
                <h2 class="section-title">Clinical Details</h2>
                <p class="info-text">${data.clinicalDetails}</p>
            </div>
            <div class="detail-section">
                <h2 class="section-title">Lab Tests</h2>
                <p class="info-text">${data.labTests && data.labTests.length > 0 ? data.labTests.join(', ') : 'Not specified'}</p>
            </div>
            <div class="detail-section">
                <h2 class="section-title">Advice</h2>
                <p class="info-text">${data.advice}</p>
            </div>
            ${data.remark ? `
            <div class="detail-section">
                <h2 class="section-title">Remarks</h2>
                <p class="info-text">${data.remark}</p>
            </div>
            ` : ''}
        </div>

        <!-- Medications -->
        <div class="medication-section">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <span class="rx-symbol">℞</span>
            </div>
            
            <div class="medication-grid">
                ${data.medications && data.medications.length > 0 ? data.medications.map((med, index) => `
                <div class="medication-card">
                    <div class="med-header">
                        <span class="med-icon">💊</span>
                        <h3 class="med-name">${med.productName} (${med.genericName})</h3>
                    </div>
                    <p class="med-detail"><span class="detail-label">Route:</span> ${med.route}</p>
                    <p class="med-detail"><span class="detail-label">Dose:</span> ${med.dose || 'N/A'} ${med.doseUnit || ''}</p>
                    <p class="med-detail"><span class="detail-label">Frequency:</span> ${med.frequency}</p>
                    <p class="med-detail"><span class="detail-label">Duration:</span> For ${med.duration}</p>
                    ${med.note ? `<p class="med-detail"><span class="detail-label">Note:</span> ${med.note}</p>` : ''}
                </div>
                `).join('') : '<p class="info-text">No medications prescribed</p>'}
            </div>
        </div>

        <!-- Doctor Signature -->
        <div class="signature-section">
            ${data.prescriberDetails.digitalSignature ? `
            <img src="${data.prescriberDetails.digitalSignature}" alt="Doctor Signature" class="signature-image">
            ` : ''}
            <p class="doctor-name">${data.prescriberDetails.title || ''} ${data.prescriberDetails.name}</p>
            <p class="doctor-specialty">${data.prescriberDetails.specialization}</p>
            <p class="doctor-slmc">SLMC No: ${data.prescriberDetails.slmcNo}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            Powered by <span class="footer-bold">Docflex Pro</span>
        </div>
    </div>
</body>
</html>
  `;
}