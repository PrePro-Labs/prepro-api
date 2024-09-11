const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../secrets.env") });

/**
 *
 * @param {string} to Who the email is being sent to.
 * @param {string} cc Who to include in the CC of the email.
 * @param {string} subject The subject line of the email.
 * @param {string} body The main content of the email.
 * @param {string} bcc Who to include in the BCC of the email.
 * @param {string} [attachmentPath] Optional path to an attachment.
 * @returns
 */
function sendEmail(to, cc, bcc, subject, body, attachmentPath) {
  return new Promise(async function (resolve, reject) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "johngaynordev@gmail.com",
        pass: process.env.GOOGLE_SMTP_PASSWORD,
      },
    });
    var mailOptions = {
      from: "johngaynordev@gmail.com",
      to: to,
      cc: cc,
      bcc: bcc,
      subject: process.env.ENVIRONMENT === "dev" ? "TEST: " + subject : subject,
      text:
        process.env.ENVIRONMENT === "dev"
          ? `Test.. To: ${to}
  Test.. cc: ${cc}
  Test.. bcc: ${bcc}
  ${body}`
          : body,
      attachments: attachmentPath
        ? [
            {
              filename: path.basename(attachmentPath),
              path: attachmentPath,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        resolve("Success");
      }
    });
  });
}

module.exports = { sendEmail };
