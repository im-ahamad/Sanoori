import "server-only";

import { Resend } from "resend";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your environment variables."
    );
  }
  return new Resend(apiKey);
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const resend = getResendClient();

    const from = options.from ?? process.env.EMAIL_FROM;
    if (!from) {
      throw new Error("EMAIL_FROM is not set. Add it to your environment variables.");
    }

    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("Failed to send email:", message);
    return { success: false, error: message };
  }
}

export async function sendAdminNotificationEmail(
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? "sanoori.trading@gmail.com";
  return sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}