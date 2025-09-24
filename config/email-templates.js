
// email-templates.js
export const emailTemplates = {
  signup: {
    subject: 'Saborly - Email Verification Code',
    text: `
Dear {{firstName}} {{lastName}},

Thank you for signing up with Saborly! Your email verification code is:

{{code}}

Please use this code to verify your account. This code expires in 10 minutes.

Best,
The Saborly Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Saborly - Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 5px; overflow: hidden;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <h2 style="color: #333;">Saborly</h2>
              <p>Dear {{firstName}} {{lastName}},</p>
              <p>Thank you for signing up with Saborly! Your email verification code is:</p>
              <h3 style="color: #28a745; font-size: 24px;">{{code}}</h3>
              <p>Please use this code to verify your account. This code expires in 10 minutes.</p>
              <p style="color: #666;">Best,<br>The Saborly Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  },
  forgotPassword: {
    subject: 'Saborly - Password Reset Code',
    text: `
Dear {{firstName}} {{lastName}},

We received a request to reset your Saborly password. Your reset code is:

{{code}}

Please use this code to reset your password. This code expires in 10 minutes.

If you didn’t request this, please ignore this email.

Best,
The Saborly Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Saborly - Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 5px; overflow: hidden;">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <h2 style="color: #333;">Saborly</h2>
              <p>Dear {{firstName}} {{lastName}},</p>
              <p>We received a request to reset your Saborly password. Your reset code is:</p>
              <h3 style="color: #dc3545; font-size: 24px;">{{code}}</h3>
              <p>Please use this code to reset your password. This code expires in 10 minutes.</p>
              <p style="color: #666;">If you didn’t request this, please ignore this email.</p>
              <p style="color: #666;">Best,<br>The Saborly Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  },
};
