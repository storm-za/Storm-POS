import { MailService } from '@sendgrid/mail';
import type { ContactSubmission } from '@shared/schema';

const mailService = new MailService();

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendContactSubmissionEmail(submission: ContactSubmission): Promise<boolean> {
  // If no SendGrid API key, just log the submission
  if (!process.env.SENDGRID_API_KEY) {
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

    await mailService.send({
      to: 'stormmailcompany@gmail.com',
      from: 'stormmailcompany@gmail.com', // Must be verified in SendGrid
      subject: `New Website Inquiry: ${submission.businessName} - ${submission.fullName}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });

    console.log('✅ Contact submission email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send contact submission email:', error);
    return false;
  }
}