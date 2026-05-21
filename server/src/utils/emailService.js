const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

const sendMentionEmail = async (toEmail, mentionerName, taskId, taskTitle) => {
  const mailOptions = {
    from: `"SyncNode Notifications" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You were mentioned in SyncNode`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #001E2B;">Collaboration Alert</h2>
        <p>Hi,</p>
        <p><strong>${mentionerName}</strong> mentioned you in the task: <strong>${taskTitle}</strong>.</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.CLIENT_URL}/workspace/task/${taskId}" 
             style="background: #00ED64; color: #001E2B; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Discussion
          </a>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Mention email sent to ${toEmail}`);
  } catch (error) {
    console.error("Email error:", error);
  }
};

module.exports = { sendMentionEmail };