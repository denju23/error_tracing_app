import nodemailer from "nodemailer";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendEmail = (receiver, subject, templateFile, templateData) => {
  console.log(templateData,'templateData')
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: process.env.USEREMAIL,
      pass: process.env.PASSWORD,
    },
    secure: true,
  });

  // Render the EJS template
  ejs.renderFile(
    `templates/${templateFile}`,
    templateData,
    (err, renderedContent) => {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: "email_username",
          to: receiver,
          subject: subject,
          html:renderedContent, // Use the rendered EJS content as HTML
         
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
        });
      }
    }
  );
};
