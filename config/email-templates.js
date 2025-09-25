export const emailTemplates = {
  signup: {
    subject: 'Saborly - Email Verification Code',
    text: `
Dear {{firstName}} {{lastName}},

Thank you for joining Saborly, your destination for delicious food like pizzas, burgers, and more! Your email verification code is:

{{code}}
This code expires in 10 minutes.

Best,
The Saborly Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saborly - Email Verification</title>
  <style>
    body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6f61, #ff9f43); padding: 30px; text-align: center; }
    .header img { max-width: 150px; }
    .content { padding: 40px 30px; text-align: center; }
    .content h1 { font-size: 28px; color: #333; margin: 0 0 20px; }
    .content p { font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px; }
    .code { font-size: 32px; color: #ff6f61; font-weight: bold; letter-spacing: 5px; background-color: #fff5f0; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px 0; }
    .cta { display: inline-block; padding: 12px 24px; background-color: #ff9f43; color: #fff; text-decoration: none; font-weight: 600; border-radius: 25px; margin-top: 20px; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777; }
    .footer a { color: #ff6f61; text-decoration: none; }
    @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://saborly.es/assets/images/logo-black.png" alt="Saborly Logo">
    </div>
    <div class="content">
      <h1>Welcome to Saborly!</h1>
      <p>Dear {{firstName}} {{lastName}},</p>
      <p>Thank you for joining Saborly, your go-to place for mouth-watering pizzas, burgers, and more! Your email verification code is:</p>
      <div class="code">{{code}}</div>
      <p>This code expires in 10 minutes.</p>
    </div>
    <div class="footer">
      <p>Best regards, The Saborly Team</p>
      <p><a href="https://saborly.es">saborly.es</a> | Follow us on <a href="https://x.com/saborly">X</a></p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },
  // ADD THIS NEW RESEND TEMPLATE
  resend: {
    subject: 'Saborly - New Verification Code',
    text: `
Dear {{firstName}} {{lastName}},

You requested a new verification code for your Saborly account. Your new verification code is:

{{code}}
This code expires in 10 minutes.

If you didn't request this, please ignore this email.

Best,
The Saborly Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saborly - New Verification Code</title>
  <style>
    body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6f61, #ff9f43); padding: 30px; text-align: center; }
    .header img { max-width: 150px; }
    .content { padding: 40px 30px; text-align: center; }
    .content h1 { font-size: 28px; color: #333; margin: 0 0 20px; }
    .content p { font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px; }
    .code { font-size: 32px; color: #ff6f61; font-weight: bold; letter-spacing: 5px; background-color: #fff5f0; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px 0; }
    .cta { display: inline-block; padding: 12px 24px; background-color: #ff9f43; color: #fff; text-decoration: none; font-weight: 600; border-radius: 25px; margin-top: 20px; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777; }
    .footer a { color: #ff6f61; text-decoration: none; }
    @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://saborly.es/assets/images/logo-black.png" alt="Saborly Logo">
    </div>
    <div class="content">
      <h1>New Verification Code</h1>
      <p>Dear {{firstName}} {{lastName}},</p>
      <p>You requested a new verification code for your Saborly account. Your new code is:</p>
      <div class="code">{{code}}</div>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Best regards, The Saborly Team</p>
      <p><a href="https://saborly.es">saborly.es</a> | Follow us on <a href="https://x.com/saborly">X</a></p>
    </div>
  </div>
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

Use this code to reset your password at saborly.es. This code expires in 10 minutes. If you didn't request this, please ignore this email.

Best,
The Saborly Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saborly - Password Reset</title>
  <style>
    body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6f61, #ff9f43); padding: 30px; text-align: center; }
    .header img { max-width: 150px; }
    .content { padding: 40px 30px; text-align: center; }
    .content h1 { font-size: 28px; color: #333; margin: 0 0 20px; }
    .content p { font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px; }
    .code { font-size: 32px; color: #ff6f61; font-weight: bold; letter-spacing: 5px; background-color: #fff5f0; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px 0; }
    .cta { display: inline-block; padding: 12px 24px; background-color: #ff9f43; color: #fff; text-decoration: none; font-weight: 600; border-radius: 25px; margin-top: 20px; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777; }
    .footer a { color: #ff6f61; text-decoration: none; }
    @media (max-width: 600px) { .content { padding: 20px; } .header { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://saborly.es/assets/images/logo-black.png" alt="Saborly Logo">
    </div>
    <div class="content">
      <h1>Reset Your Saborly Password</h1>
      <p>Dear {{firstName}} {{lastName}},</p>
      <p>We received a request to reset your Saborly password. Your reset code is:</p>
      <div class="code">{{code}}</div>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Best regards, The Saborly Team</p>
      <p><a href="https://saborly.es">saborly.es</a> | Follow us on <a href="https://x.com/saborly">X</a></p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },
};