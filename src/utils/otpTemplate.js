const otpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f4f6f8;padding:20px;">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:8px;padding:30px;">
    <h2 style="color:#111827;">🔐 Password Reset</h2>
    <p>Your OTP is:</p>
    <div style="font-size:28px;font-weight:bold;letter-spacing:6px;margin:20px 0;">
      ${otp}
    </div>
    <p style="color:#6b7280;">OTP valid for 5 minutes.</p>
  </div>
</body>
</html>
`;


export default otpTemplate