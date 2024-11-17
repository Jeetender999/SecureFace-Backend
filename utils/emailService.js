const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: '999jeetender@gmail.com', // Replace with your email
    pass: 'takf boex urnc tvta', // Replace with your email password or app password
  },
});

// Function to send email notification
const sendEmailNotification = async (visitorDetails) => {
  const { name, age, gender, currentEmotion, detectedAt } = visitorDetails;

  const mailOptions = {
    from: '999jeetender@gmail.com', // Sender's email
    to: 'jeetender10118@gmail.com', // Replace with the owner's email
    subject: '🚨 Stranger Detected Alert',
    html: `
      <h1>🚨 Stranger Detected Alert</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Age:</strong> ${age}</p>
      <p><strong>Gender:</strong> ${gender}</p>
      <p><strong>Current Emotion:</strong> ${currentEmotion}</p>
      <p><strong>Detected At:</strong> ${detectedAt}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Stranger alert email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmailNotification;
