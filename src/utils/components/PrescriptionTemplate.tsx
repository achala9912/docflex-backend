import React from "react";

export interface PrescriptionTemplateProps {
  centerId: {
    centerName?: string;
    contactNo?: string;
    address?: string;
    town?: string;
    logo?: string;
    email?: string;
  };
  prescriptionNo?: string;
  createdAt: string;
  patientId: {
    patientName: string;
    age: string;
    contactNo: string;
    email: string;
    gender?: string;
    dob?: string;
    title?: string;
  };
  reasonForVisit: string;
  symptoms: string[];
  labTests: string[];
  vitalSigns: {
    weight?: string;
    height?: string;
    bmi?: string;
    pulseRate?: string;
    temperature?: string;
  }[];
  clinicalDetails: string;
  advice: string;
  remark?: string;
  medications: {
    productName: string;
    dose: string;
    frequency: string;
    doseUnit: string;
    duration: string;
    note?: string;
    route: string;
    genericName: string;
  }[];
  prescriberDetails: {
    name: string;
    specialization: string;
    slmcNo: string;
    title?: string;
    digitalSignature?: string;
  };
}

const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({
  centerId,
  prescriptionNo,
  createdAt,
  patientId,
  reasonForVisit,
  symptoms = [],
  labTests = [],
  vitalSigns = [],
  clinicalDetails,
  advice,
  remark,
  medications = [],
  prescriberDetails,
}) => {
  // Safely access the first vital sign or use empty object
  const vital = vitalSigns && vitalSigns.length > 0 ? vitalSigns[0] : {};

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#212121",
        maxWidth: 800,
        margin: "0 auto",
        padding: 20,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <img
          src={centerId.logo}
          alt="Logo"
          style={{ maxWidth: 120, display: "block", margin: "0 auto" }}
        />
        <h1 style={{ margin: 0, color: "#1565c0" }}>{centerId.centerName}</h1>
        <p style={{ margin: 0 }}>
          {centerId.address} {centerId.town || ""}
        </p>
        <p style={{ margin: 0 }}>
          {centerId.contactNo} | {centerId.email}
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Prescription No:</strong> {prescriptionNo}
        <br />
        <strong>Date:</strong> {new Date(createdAt).toLocaleString()}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Patient:</strong> {patientId.title} {patientId.patientName}
        <br />
        <strong>Age:</strong> {patientId.age}
        <br />
        <strong>Contact:</strong> {patientId.contactNo}
        <br />
        <strong>Email:</strong> {patientId.email}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Reason for Visit:</strong> {reasonForVisit}
        <br />
        <strong>Symptoms:</strong> {symptoms.join(", ") || "None"}
        <br />
        <strong>Clinical Details:</strong> {clinicalDetails}
        <br />
        <strong>Lab Tests:</strong> {labTests.join(", ") || "None"}
        <br />
        <strong>Advice:</strong> {advice}
        <br />
        <strong>Remark:</strong> {remark || "None"}
      </div>

      {vitalSigns && vitalSigns.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <strong>Vitals:</strong> Weight: {vital.weight || "-"}kg, Height:{" "}
          {vital.height || "-"}cm, BMI: {vital.bmi || "-"}, Pulse:{" "}
          {vital.pulseRate || "-"}, Temp: {vital.temperature || "-"}°C
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <strong>Medications:</strong>
        {medications && medications.length > 0 ? (
          <ul>
            {medications.map((med, index) => (
              <li key={index}>
                {med.productName} ({med.genericName}) — {med.route}, {med.dose}{" "}
                {med.doseUnit}, {med.frequency}, Duration: {med.duration}
                {med.note && `, Note: ${med.note}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No medications prescribed</p>
        )}
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        {prescriberDetails.digitalSignature && (
          <img
            src={prescriberDetails.digitalSignature}
            alt="Signature"
            style={{ maxWidth: 120, display: "block", margin: "0 auto" }}
          />
        )}
        <p style={{ margin: 0 }}>
          <strong>
            {prescriberDetails.title} {prescriberDetails.name}
          </strong>
        </p>
        <p style={{ margin: 0 }}>
          {prescriberDetails.specialization} | SLMC: {prescriberDetails.slmcNo}
        </p>
      </div>
    </div>
  );
};

export default PrescriptionTemplate;
