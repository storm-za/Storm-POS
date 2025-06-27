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
    console.error('1. 2-factor authentication is enabled on stormmailcompany@gmail.com');
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