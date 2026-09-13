import nodemailer from "nodemailer";

export function recoveryEmailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;
  if (!host || !user || !pass || !from || !appUrl || ![465, 587].includes(port)) return null;
  let url: URL;
  try { url = new URL(appUrl); } catch { return null; }
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return null;
  return { host, port, user, pass, from, origin: url.origin };
}

export function recoveryTransport(config: NonNullable<ReturnType<typeof recoveryEmailConfig>>) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: true,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

export async function sendRecoveryEmail(email: string, code: string, config: NonNullable<ReturnType<typeof recoveryEmailConfig>>) {
  const result = await recoveryTransport(config).sendMail({
    from: config.from,
    to: email,
    subject: "Reset your Shortlist password",
    text: `Your Shortlist password reset code is:\n\n${code}\n\nEnter it on the password reset page. It expires in 5 minutes. Never share this code. If you did not request this, you can ignore this email.`,
  });
  if (!result.accepted.length) throw new Error("Recovery email delivery failed");
}
