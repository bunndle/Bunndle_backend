const userThankYouTemplate = ({ name }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Thank You</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        background: #ffffff;
        margin: auto;
        padding: 25px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      h2 {
        color: #007bff;
      }
      p {
        color: #444;
        line-height: 1.6;
      }
      .footer {
        margin-top: 25px;
        font-size: 14px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Thank You for Choosing Us!</h2>

      <p>Hi <strong>${name}</strong>,</p>

      <p>
        Thank you for reaching out to us.  
        We’ve received your request and one of our team members will
        contact you shortly.
      </p>

      <p>
        We appreciate your interest and look forward to assisting you.
      </p>

      <div class="footer">
        <p>Best regards,</p>
        <p><strong>Bundel Team</strong></p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export default userThankYouTemplate;