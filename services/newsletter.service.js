import transporter from '../config/email.config.js';

export class NewsletterService {
  
  // Send welcome email to new subscriber
  static async sendWelcomeEmail(subscriber, firstName = '', lastName = '') {
    try {
      const unsubscribeLink = `https://saborly.es/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
      
      const htmlContent = this.generateWelcomeHTML(subscriber, firstName, lastName, unsubscribeLink);
      const textContent = this.generateWelcomeText(subscriber, firstName, lastName, unsubscribeLink);

      const mailOptions = {
        from: '"Saborly Restaurant" <noreply@saborly.es>',
        to: subscriber.email,
        subject: '🎉 Welcome to Saborly Newsletter!',
        text: textContent,
        html: htmlContent
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to: ${subscriber.email}`);
      return result;
      
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Send campaign email with custom content
  static async sendCampaignEmail(subscriber, subject, content) {
    try {
      const unsubscribeLink = `https://saborly.es/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
      
      const htmlContent = this.generateNewsletterHTML(subscriber, content, unsubscribeLink);
      const textContent = this.generateNewsletterText(subscriber, content, unsubscribeLink);

      const mailOptions = {
        from: '"Saborly Restaurant" <newsletter@saborly.es>',
        to: subscriber.email,
        subject: subject,
        text: textContent,
        html: htmlContent,
        headers: {
          'List-Unsubscribe': `<${unsubscribeLink}>`,
          'Precedence': 'bulk'
        }
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`Campaign email sent to: ${subscriber.email}`);
      return result;
      
    } catch (error) {
      console.error(`Error sending campaign email to ${subscriber.email}:`, error);
      throw error;
    }
  }

  // Send batch campaign emails
  static async sendBulkCampaign(subscribers, subject, content, campaignId = null) {
    const results = {
      total: subscribers.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      
      try {
        await this.sendCampaignEmail(subscriber, subject, content);
        results.successful++;
        
        // Add small delay to avoid rate limits
        if (i < subscribers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message
        });
      }
    }

    console.log(`Bulk campaign completed: ${results.successful}/${results.total} successful`);
    return results;
  }

  // Generate HTML newsletter template
  static generateNewsletterHTML(subscriber, content, unsubscribeLink) {
    const subscriberName = subscriber.firstName || 'Food Lover';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saborly Newsletter</title>
    <style>
        body { 
            font-family: 'Poppins', Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f9f9f9; 
            line-height: 1.6;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #ff6f61, #ff9f43); 
            padding: 30px; 
            text-align: center; 
        }
        .header img { 
            max-width: 150px; 
            height: auto; 
        }
        .content { 
            padding: 30px; 
        }
        .footer { 
            background-color: #f4f4f4; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
            color: #777; 
        }
        .unsubscribe { 
            font-size: 12px; 
            color: #999; 
            margin-top: 20px; 
        }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .header { padding: 20px; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://saborly.es/assets/images/logo-black.png" alt="Saborly Logo">
            <h1 style="color: white; margin: 10px 0 0 0;">Saborly Newsletter</h1>
        </div>
        <div class="content">
            <p>Hello ${subscriberName},</p>
            <div>${content}</div>
            <br>
            <p>Best regards,<br>The Saborly Team</p>
        </div>
        <div class="footer">
            <p><a href="https://saborly.es" style="color: #ff6f61;">Visit our website</a></p>
            <div class="unsubscribe">
                <a href="${unsubscribeLink}" style="color: #999;">Unsubscribe from these emails</a>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate text version
  static generateNewsletterText(subscriber, content, unsubscribeLink) {
    const textContent = content.replace(/<[^>]*>/g, '');
    return `
Hello ${subscriber.firstName || 'Food Lover'},

${textContent}

Best regards,
The Saborly Team

Unsubscribe: ${unsubscribeLink}
    `.trim();
  }

  // Generate welcome email HTML
  static generateWelcomeHTML(subscriber, firstName, lastName, unsubscribeLink) {
    const name = firstName || 'Food Lover';
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6f61; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Saborly!</h1>
        </div>
        <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for subscribing to our newsletter!</p>
            <p><a href="${unsubscribeLink}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate welcome email text
  static generateWelcomeText(subscriber, firstName, lastName, unsubscribeLink) {
    return `
Hello ${firstName || 'Food Lover'},

Thank you for subscribing to Saborly newsletter!

Unsubscribe: ${unsubscribeLink}
    `.trim();
  }
}

export default NewsletterService;