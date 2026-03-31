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

export async function sendWhatsNewEmail(userEmail: string, userName: string): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 What\'s New email skipped (no email configured) for:', userEmail);
    return false;
  }

  try {
    const emailContent = `
Hi ${userName || 'there'},

We hope Storm POS is helping your business run smoother every day! We've been hard at work adding new features and fixing issues based on your feedback. Here's what's new:

📄 NEW: Invoices & Quotes Generator

You can now create professional invoices and quotes directly from Storm POS! Features include:
• Automatic document numbering (INV-001, QUO-001)
• Add your company logo and business details
• Line items with products from your inventory
• Flexible discounts (percentage or fixed amount)
• Optional 15% VAT toggle
• Professional PDF export with your branding
• Status tracking (Draft → Sent → Paid)
• Available in both English and Afrikaans

Find it right next to the Customers tab in your dashboard.

🔧 Bug Fixes & Improvements

• Product Editing Fixed: We resolved an issue where editing a product could cause it to disappear. Your products now save correctly every time.
• Improved PDF Layouts: Invoice PDFs are now more compact - only creating multiple pages when truly needed.

💡 Coming Soon

We're always working on making Storm better for you. Stay tuned for more updates!

Thank you for choosing Storm POS. If you have any questions or feedback, just reply to this email - we'd love to hear from you.

Keep thriving,
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
    .section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .section-title { color: #2563eb; margin: 0 0 10px 0; font-size: 18px; }
    .feature { margin: 8px 0; padding-left: 5px; }
    .bugfix { background: #f0fdf4; border-left-color: #22c55e; }
    .bugfix .section-title { color: #22c55e; }
    .coming-soon { background: #fefce8; border-left-color: #eab308; }
    .coming-soon .section-title { color: #b45309; }
    .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 10px 10px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Still enjoying Storm? 🚀</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Here's what's new!</p>
    </div>
    <div class="content">
      <p>Hi ${userName || 'there'},</p>
      
      <p>We hope Storm POS is helping your business run smoother every day! We've been hard at work adding new features and fixing issues based on your feedback. Here's what's new:</p>
      
      <div class="section">
        <h3 class="section-title">📄 NEW: Invoices & Quotes Generator</h3>
        <p>You can now create professional invoices and quotes directly from Storm POS!</p>
        <div class="feature">✅ Automatic document numbering (INV-001, QUO-001)</div>
        <div class="feature">✅ Add your company logo and business details</div>
        <div class="feature">✅ Line items with products from your inventory</div>
        <div class="feature">✅ Flexible discounts (percentage or fixed amount)</div>
        <div class="feature">✅ Optional 15% VAT toggle</div>
        <div class="feature">✅ Professional PDF export with your branding</div>
        <div class="feature">✅ Status tracking (Draft → Sent → Paid)</div>
        <div class="feature">✅ Available in both English and Afrikaans</div>
        <p style="margin-top: 15px;"><strong>Find it right next to the Customers tab in your dashboard.</strong></p>
      </div>
      
      <div class="section bugfix">
        <h3 class="section-title">🔧 Bug Fixes & Improvements</h3>
        <div class="feature"><strong>Product Editing Fixed:</strong> We resolved an issue where editing a product could cause it to disappear. Your products now save correctly every time.</div>
        <div class="feature"><strong>Improved PDF Layouts:</strong> Invoice PDFs are now more compact - only creating multiple pages when truly needed.</div>
      </div>
      
      <div class="section coming-soon">
        <h3 class="section-title">💡 Coming Soon</h3>
        <p style="margin: 0;">We're always working on making Storm better for you. Stay tuned for more updates!</p>
      </div>
      
      <center>
        <a href="https://stormsoftware.co.za/pos/login" class="cta-button">Log In to Storm POS →</a>
      </center>
      
      <p>Thank you for choosing Storm POS. If you have any questions or feedback, just reply to this email - we'd love to hear from you.</p>
      
      <p style="margin-top: 30px;">
        Keep thriving,<br>
        <strong>The Storm Team</strong><br>
        🌐 <a href="https://stormsoftware.co.za" style="color: #2563eb;">stormsoftware.co.za</a>
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">Powered by STORM Software</p>
      <p style="margin: 5px 0 0 0;">This email was sent to ${userEmail} because you're a Storm POS customer.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: '"Storm POS" <softwarebystorm@gmail.com>',
      to: userEmail,
      subject: "🚀 Still enjoying Storm? Here's what's new!",
      text: emailContent,
      html: htmlContent,
    });

    console.log(`✅ What's New email sent successfully to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send What\'s New email:', error.message);
    console.log(`📧 What's New email failed for: ${userEmail}`);
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
  } catch (error: any) {
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

export async function sendUpsellSwitchEmail(
  userEmail: string,
  userName: string,
  savingAmount: number,
  language: string
): Promise<boolean> {
  const transporter = createTransporter();

  const isAf = language === 'af';
  const subject = isAf
    ? `Storm POS: Bespaar R${savingAmount.toFixed(2)} hierdie maand deur na plat plan te skakel`
    : `Storm POS: Switch to flat plan and save R${savingAmount.toFixed(2)} this month`;

  const bodyText = isAf ? `
Hallo ${userName},

Goeie nuus! Op grond van jou verkoopsvolume hierdie maand sou jy R${savingAmount.toFixed(2)} bespaar het as jy op die plat R1.00-per-verkoop-plan was.

Skakel nou na die plat plan deur in te teken en na Gebruik & Fakturering te gaan.

Groete,
Die Storm-span
  `.trim() : `
Hi ${userName},

Good news! Based on your sales volume this month, you would have saved R${savingAmount.toFixed(2)} if you were on the flat R1.00 per sale plan.

Switch to the flat plan now by logging in and navigating to Usage & Billing.

Best,
The Storm Team
  `.trim();

  const htmlBody = isAf ? `
    <p>Hallo <strong>${userName}</strong>,</p>
    <p>Op grond van jou verkoopsvolume hierdie maand sou jy <strong style="color:hsl(217,90%,40%)">R${savingAmount.toFixed(2)}</strong> bespaar het as jy op die <strong>plat R1.00-per-verkoop-plan</strong> was.</p>
    <p>Skakel nou na die plat plan deur in te teken en na <strong>Gebruik &amp; Fakturering</strong> te gaan.</p>
  ` : `
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Based on your sales volume this month, you would have saved <strong style="color:hsl(217,90%,40%)">R${savingAmount.toFixed(2)}</strong> if you were on the <strong>flat R1.00 per sale plan</strong>.</p>
    <p>Switch to the flat plan now by logging in and going to <strong>Usage &amp; Billing</strong>.</p>
  `;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, hsl(217,90%,40%) 0%, hsl(217,90%,52%) 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .saving { font-size: 2rem; font-weight: bold; color: hsl(217,90%,40%); text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: hsl(217,90%,40%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 10px 10px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Storm POS</h1>
      <p style="margin:8px 0 0;opacity:0.85;">${isAf ? 'Bespaar meer hierdie maand' : 'Save more this month'}</p>
    </div>
    <div class="content">
      ${htmlBody}
      <div class="saving">R${savingAmount.toFixed(2)}</div>
      <p style="text-align:center;">
        <a href="https://stormsoftware.co.za/pos/login" class="cta-button">${isAf ? 'Teken in &amp; Skakel Nou' : 'Log In &amp; Switch Now'}</a>
      </p>
    </div>
    <div class="footer">stormsoftware.co.za</div>
  </div>
</body>
</html>
  `.trim();

  if (!transporter) {
    console.log(`📧 Upsell email (no transporter): ${userEmail} | save R${savingAmount.toFixed(2)}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject,
      text: bodyText,
      html: htmlContent,
    });
    console.log(`✅ Upsell switch email sent to ${userEmail} (save R${savingAmount.toFixed(2)})`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send upsell email:', error.message);
    return false;
  }
}

export async function sendPricingInterestEmail(email: string): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Pricing Intelligence interest (no email configured):', {
      email,
      date: new Date().toISOString()
    });
    return true;
  }

  try {
    const emailContent = `
🔔 New Pricing Intelligence Interest!

Someone is interested in your upcoming Pricing Intelligence software.

Contact Details:
• Email: ${email}
• Date: ${new Date().toLocaleString('en-ZA')}

---
This person wants to be notified when Pricing Intelligence launches.
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .content { padding: 30px; }
    .email-box { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .email-address { font-size: 20px; font-weight: bold; color: #fbbf24; }
    .label { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Lead!</h1>
    </div>
    <div class="content">
      <p style="color: #e2e8f0; margin-bottom: 20px;">Someone is interested in <strong style="color: #fbbf24;">Pricing Intelligence</strong>:</p>
      <div class="email-box">
        <div class="label">Email Address</div>
        <div class="email-address">${email}</div>
      </div>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
        📅 ${new Date().toLocaleString('en-ZA')}<br>
        This person wants to be notified when the product launches.
      </p>
    </div>
    <div class="footer">
      Storm Lead Notification System
    </div>
  </div>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `🔔 Pricing Intelligence Interest: ${email}`,
      text: emailContent,
      html: htmlContent,
    });

    console.log(`✅ Pricing interest notification sent for: ${email}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send pricing interest email:', error.message);
    console.log(`📧 Pricing interest from: ${email}`);
    return false;
  }
}