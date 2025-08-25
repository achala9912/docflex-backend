export const passwordResetTemplate = (otp: string, userName: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0087a9ff;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
        }
        .otp-container {
            background-color: #ffffff;
            border: 1px dashed #4f46e5;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>DocFlex Pro</h2>
    </div>
    <div class="content">
        <h3>Hello ${userName},</h3>
        <p>We received a request to reset your password. Please use the following OTP (One-Time Password) to proceed:</p>
        
        <div class="otp-container">
            ${otp}
        </div>
        
        <p>This code will expire in 5 minutes. If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        
        <p>For security reasons, do not share this OTP with anyone.</p>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} DocFlex Pro. All rights reserved.</p>
            <p>If you're having trouble with the OTP, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;

export const temporaryPasswordTemplate = (
  tempPassword: string,
  name: string,
  userName: string
) => {
  return {
    text: `Hello ${name},

Your account has been created.

User Name: ${userName}
Temporary Password: ${tempPassword}

Please log in and reset your password after first login.

Do not share these credentials with anyone. For assistance, contact support.
`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Temporary Password</title>
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background-color: #0087a9ff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { padding: 20px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
  .credentials { background-color: #ffffff; border: 1px dashed #4f46e5; padding: 15px; margin: 20px 0; font-size: 18px; color: #4f46e5; }
  .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h2>DocFlex Pro</h2>
  </div>
  <div class="content">
    <h3>Hello ${name},</h3>
    <p>Your account has been created. Please use the following credentials to log in and reset your password immediately:</p>
    
    <div class="credentials">
      <p><strong>User Name:</strong> ${userName}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
    </div>

    <p>Do not share these credentials with anyone. For assistance, contact support.</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} DocFlex Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
  };
};

export const appointmentConfirmationTemplate = (
  patientName: string,
  centerName: string,
  centerAddress: string,
  centerContactNo: string,
  appointmentId: string,
  tokenNo: number,
  date: string,
  sessionName: string
) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Confirmation</title>
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9fafb;
  }
  .header {
    background-color: #0087a9ff;
    color: white;
    padding: 20px;
    text-align: center;
    border-radius: 8px 8px 0 0;
  }
  .content {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 0 0 8px 8px;
    border: 1px solid #e5e7eb;
  }
  .details {
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 15px;
    margin: 20px 0;
  }
  .details p {
    margin: 6px 0;
    font-size: 15px;
  }
  .footer {
    margin-top: 20px;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="header">
    <h2>DocFlex Pro</h2>
  </div>
  <div class="content">
    <h3>Hello ${patientName || "Patient"},</h3>
    <p>Your appointment has been <strong>successfully booked</strong>. Below are your details:</p>
    
    <div class="details">
      <p><strong>Appointment ID:</strong> ${appointmentId}</p>
      <p><strong>Token No:</strong> ${tokenNo}</p>
      <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
      <p><strong>Session:</strong> ${sessionName}</p>
    </div>

    <h4>Medical Center Details:</h4>
    <p><strong>${centerName}</strong></p>
    <p>${centerAddress}</p>
     <p>${centerContactNo}</p>

    <p>Please arrive at least 10 minutes before your scheduled time.  
    If you are unable to attend, kindly contact the center to reschedule or cancel.</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} DocFlex Pro. All rights reserved.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const appointmentCancellationTemplate = (
  patientName: string,
  centerName: string,
  centerAddress: string,
  centerContactNo: string,
  appointmentId: string,
  tokenNo: number,
  date: string,
  sessionName: string
) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Cancellation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .header {
            background-color: #dc3545;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #ffffff;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
        }
        .details {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .details p {
            margin: 6px 0;
            font-size: 15px;
        }
        .warning {
            background-color: #fffaf0;
            border: 1px solid #feebcb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #c05621;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .cancelled-text {
            color: #dc3545;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>DocFlex Pro</h2>
    </div>
    <div class="content">
        <h3>Hello ${patientName || "Patient"},</h3>
        
        <div class="cancelled-text">
            ❌ Your appointment has been cancelled
        </div>
        
        <p>Below are the details of the cancelled appointment:</p>
        
        <div class="details">
            <p><strong>Appointment ID:</strong> ${appointmentId}</p>
            <p><strong>Token No:</strong> ${tokenNo}</p>
            <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
            <p><strong>Session:</strong> ${sessionName}</p>
        </div>

        <h4>Medical Center Details:</h4>
        <p><strong>${centerName}</strong></p>
        <p>${centerAddress}</p>
        <p>${centerContactNo}</p>

        <div class="warning">
            <p><strong>⚠️ Important:</strong></p>
            <p>This appointment has been cancelled. If you need to reschedule or have any questions, please contact the medical center directly.</p>
        </div>

        <p>We apologize for any inconvenience this may have caused. Thank you for understanding.</p>

        <div class="footer">
            <p>© ${new Date().getFullYear()} DocFlex Pro. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
