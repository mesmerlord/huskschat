import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import db from "@/components/core/db";
import { EMAIL_SUBJECTS, sendEmail } from "@/components/core/mailer";
import LoginEmail from "@/components/emails/LoginEmail";
import GoogleProvider from "next-auth/providers/google";
import WelcomeEmail from "@/components/emails/WelcomeEmail";

const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    googleProvider,
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest({ identifier: email, url }) {
        sendEmail({
          to: email,
          subject: EMAIL_SUBJECTS.LOGIN,
          component: <LoginEmail url={url} />,
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.userId = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verifyRequest=1",
  },
  secret: process.env.SECRET,
  events: {
    createUser: ({ user }) => {
      if (user.email) {
        sendEmail({
          to: user.email,
          subject: "Welcome to HusksChat! 🎉",
          component: <WelcomeEmail url={`${process.env.NEXTAUTH_URL}/`} />,
        });
      }
    },
  },
};

export default NextAuth(authOptions);
