import nodemailer from 'nodemailer';
import type { ContactSubmission } from '@shared/schema';

// Configure Gmail SMTP transporter
const createTransporter = () => {
  console.log('🔍 Checking Gmail credentials...');
  console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);
  console.log('GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD);
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('❌ Missing Gmail credentials');
    return null;
  }

  console.log('✅ Creating Gmail transporter');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Welcome email skipped (no email configured) for:', userEmail);
    return false;
  }

  try {
    const emailContent = `
Hi ${userName},

Welcome to Storm. We're thrilled to have you on board! 

You've just taken the first step toward managing your business smarter, faster, and easier. For the next 7 days, you'll have full access to all Storm POS features, absolutely free. No credit card needed, and you can cancel anytime before the trial ends.

Here's what you can do with Storm POS:
✅ Record cash, card, or EFT sales effortlessly
✅ Track products, stock, and profits in real time
✅ View detailed reports to make smarter business decisions
✅ Manage customers & invoices like a pro
✅ Access your POS anytime, anywhere, always

We designed Storm POS to be lightning-fast, and easy to use, so you can spend less time managing and more time growing your business.

Get started now: Log in to your POS at https://stormsoftware.co.za/pos/login

If you ever need help or want a walkthrough, our team's ready to guide you.

Welcome to the future of sales,
The Storm Team
🌐 stormsoftware.co.za
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .features { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature { margin: 10px 0; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Welcome to Storm POS! 🌟</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p><strong>Welcome to Storm. We're thrilled to have you on board!</strong></p>
      
      <p>You've just taken the first step toward managing your business smarter, faster, and easier. For the next <strong>7 days</strong>, you'll have full access to all Storm POS features, absolutely free. No credit card needed, and you can cancel anytime before the trial ends.</p>
      
      <div class="features">
        <p><strong>Here's what you can do with Storm POS:</strong></p>
        <div class="feature">✅ Record cash, card, or EFT sales effortlessly</div>
        <div class="feature">✅ Track products, stock, and profits in real time</div>
        <div class="feature">✅ View detailed reports to make smarter business decisions</div>
        <div class="feature">✅ Manage customers & invoices like a pro</div>
        <div class="feature">✅ Access your POS anytime, anywhere, always</div>
      </div>
      
      <p>We designed Storm POS to be lightning-fast and easy to use, so you can spend less time managing and more time growing your business.</p>
      
      <center>
        <a href="https://stormsoftware.co.za/pos/login" class="cta-button">Get Started Now →</a>
      </center>
      
      <p>If you ever need help or want a walkthrough, our team's ready to guide you.</p>
      
      <p style="margin-top: 30px;">
        Welcome to the future of sales,<br>
        <strong>The Storm Team</strong><br>
        🌐 <a href="https://stormsoftware.co.za" style="color: #2563eb;">stormsoftware.co.za</a>
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0; font-size: 12px;">This email was sent to ${userEmail} because you signed up for Storm POS.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: '"Storm POS" <softwarebystorm@gmail.com>',
      to: userEmail,
      subject: '🌟 Welcome to Storm POS - Your 7-Day Free Trial Starts Now!',
      text: emailContent,
      html: htmlContent,
    });

    console.log(`✅ Welcome email sent successfully to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send welcome email:', error.message);
    console.log(`📧 Welcome email failed for: ${userEmail} (${userName})`);
    return false;
  }
}

export async function sendContactSubmissionEmail(submission: ContactSubmission): Promise<boolean> {
  const transporter = createTransporter();
  
  // If no Gmail credentials, just log the submission
  if (!transporter) {
    console.log('📧 Contact form submission (no email configured):', {
      id: submission.id,
      from: submission.email,
      business: submission.businessName,
      name: submission.fullName,
      type: submission.businessType,
      goals: submission.websiteGoals,
      timeline: submission.timeline,
      date: submission.createdAt
    });
    return true;
  }

  try {
    const emailContent = `
New Website Contact Form Submission

Contact Details:
• Name: ${submission.fullName}
• Business: ${submission.businessName}
• Email: ${submission.email}
• Submission ID: ${submission.id}
• Date: ${new Date(submission.createdAt).toLocaleString('en-ZA')}

Business Information:
• What they do: ${submission.businessType}

Website Requirements:
• Goals: ${submission.websiteGoals}

Timeline: ${submission.timeline || 'Not specified'}

---
Reply directly to ${submission.email} to follow up.
Storm Contact System
    `.trim();

    const htmlContent = emailContent.replace(/\n/g, '<br>').replace(/•/g, '&bull;');

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to self
      subject: `New Website Inquiry: ${submission.businessName} - ${submission.fullName}`,
      text: emailContent,
      html: `<div style="font-family: Arial, sans-serif; color: #333;">${htmlContent}</div>`,
    });

    console.log('✅ Contact submission email sent successfully via Gmail');
    return true;
  } catch (error) {
    console.error('❌ Gmail authentication failed. Please check:');
    console.error('1. 2-factor authentication is enabled on softwarebystorm@gmail.com');
    console.error('2. App password is correctly generated and copied');
    console.error('3. Go to Google Account > Security > App passwords');
    console.error('Error details:', error.message);
    
    // Log submission details for manual follow-up
    console.log('📧 Contact submission details for manual follow-up:');
    console.log(`📞 ${submission.fullName} from ${submission.businessName}`);
    console.log(`📧 Email: ${submission.email}`);
    console.log(`🏢 Business: ${submission.businessType}`);
    console.log(`🎯 Goals: ${submission.websiteGoals}`);
    console.log(`⏰ Timeline: ${submission.timeline || 'Not specified'}`);
    console.log(`🆔 ID: ${submission.id} | 📅 Date: ${submission.createdAt}`);
    
    return false;
  }
}