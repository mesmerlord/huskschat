import { render } from "mjml-react";
import nodemailer from "nodemailer";
import { ReactElement } from "react";
const mailjetTransport = require("nodemailer-mailjet-transport");

const transporter = nodemailer.createTransport(
  mailjetTransport({
    auth: {
      apiKey: process.env.MAILJET_API_KEY,
      apiSecret: process.env.MAILJET_SECRET_KEY,
    },
  })
);
export const EMAIL_SUBJECTS = {
  LOGIN: "Your Husks Login Link",
};

export const sendEmail = async ({
  to,
  subject,
  component,
}: {
  to: string;
  subject: string;
  component: ReactElement;
}) => {
  const { html } = render(component);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
