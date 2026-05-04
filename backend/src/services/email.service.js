const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

let transporter;

function getTransporter() {
  if (!transporter && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// ── Email templates ───────────────────────────────────────────────────────────

const templates = {
  welcome: (name) => ({
    subject: 'Welcome to Pastoralist Knowledge Hub',
    html: `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <div style="background: #2D5616; padding: 1.5rem; border-radius: 0.75rem 0.75rem 0 0; text-align: center;">
          <h1 style="color: white; font-family: Georgia, serif; margin: 0;">Pastoralist Knowledge Hub</h1>
        </div>
        <div style="background: #F7F3ED; padding: 2rem; border-radius: 0 0 0.75rem 0.75rem;">
          <h2 style="color: #1A1008;">Welcome, ${name}!</h2>
          <p style="color: #523D1C; line-height: 1.6;">
            Thank you for joining the Pastoralist Indigenous Knowledge Hub. 
            Your account has been created and you can now explore and contribute to our growing repository.
          </p>
          <a href="${process.env.FRONTEND_URL}" 
             style="display: inline-block; background: #3A700D; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; margin-top: 1rem;">
            Explore the Hub
          </a>
        </div>
      </div>
    `,
  }),

  reviewDecision: (name, title, decision, notes) => ({
    subject: `Your knowledge record has been ${decision.toLowerCase()}`,
    html: `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <div style="background: ${decision === 'APPROVED' ? '#2D5616' : decision === 'REJECTED' ? '#C44420' : '#8B6F35'}; padding: 1.5rem; border-radius: 0.75rem 0.75rem 0 0; text-align: center;">
          <h1 style="color: white; font-family: Georgia, serif; margin: 0;">Knowledge Review</h1>
        </div>
        <div style="background: #F7F3ED; padding: 2rem; border-radius: 0 0 0.75rem 0.75rem;">
          <h2 style="color: #1A1008;">Hello ${name},</h2>
          <p style="color: #523D1C; line-height: 1.6;">
            Your knowledge record <strong>"${title}"</strong> has been <strong>${decision.toLowerCase()}</strong>.
          </p>
          ${notes ? `<div style="background: white; padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #3A700D; margin: 1rem 0;">
            <p style="color: #523D1C; margin: 0;">${notes}</p>
          </div>` : ''}
          <a href="${process.env.FRONTEND_URL}/knowledge" 
             style="display: inline-block; background: #3A700D; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; margin-top: 1rem;">
            View Your Records
          </a>
        </div>
      </div>
    `,
  }),

  newContribution: (elderName, contributorName, title) => ({
    subject: `New knowledge record pending your review`,
    html: `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <div style="background: #2D5616; padding: 1.5rem; border-radius: 0.75rem 0.75rem 0 0; text-align: center;">
          <h1 style="color: white; font-family: Georgia, serif; margin: 0;">New Submission</h1>
        </div>
        <div style="background: #F7F3ED; padding: 2rem; border-radius: 0 0 0.75rem 0.75rem;">
          <h2 style="color: #1A1008;">Hello ${elderName},</h2>
          <p style="color: #523D1C; line-height: 1.6;">
            <strong>${contributorName}</strong> has submitted a new knowledge record 
            <strong>"${title}"</strong> that requires your review.
          </p>
          <a href="${process.env.FRONTEND_URL}/admin" 
             style="display: inline-block; background: #3A700D; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; margin-top: 1rem;">
            Review Now
          </a>
        </div>
      </div>
    `,
  }),
};

// ── Send functions ────────────────────────────────────────────────────────────

async function sendEmail(to, { subject, html }) {
  const t = getTransporter();
  if (!t) {
    logger.warn(`Email not configured — skipping: ${subject} to ${to}`);
    return;
  }
  try {
    await t.sendMail({
      from: `"PIK Hub" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${subject} to ${to}`);
  } catch (err) {
    logger.error(`Email failed: ${err.message}`);
  }
}

exports.sendWelcome = (email, name) =>
  sendEmail(email, templates.welcome(name));

exports.sendReviewDecision = (email, name, title, decision, notes) =>
  sendEmail(email, templates.reviewDecision(name, title, decision, notes));

exports.sendNewContributionAlert = (email, elderName, contributorName, title) =>
  sendEmail(email, templates.newContribution(elderName, contributorName, title));
