import nodemailer from 'nodemailer';

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

export async function sendMail(to: string, subject: string, html: string) {
  await transport().sendMail({
    from: process.env.EMAIL_FROM ?? 'Atelier Abaya <[email protected]>',
    to,
    subject,
    html,
  });
}

const STATUS_COPY: Record<string, string> = {
  RECEIVED: 'We have received your order and it is queued for tailoring.',
  IN_TAILORING: 'Good news — your abaya is now being tailored by hand.',
  SHIPPED: 'Your order has shipped and is on its way to you.',
  CANCELLED: 'Your order has been cancelled.',
  AWAITING_PAYMENT: 'Your order has been created and is awaiting payment.',
};

export async function sendStatusEmail(to: string, reference: string, status: string) {
  const body = STATUS_COPY[status] ?? `Your order status is now ${status}.`;
  await sendMail(
    to,
    `Order ${reference} — ${status.replace('_', ' ').toLowerCase()}`,
    `<div style="font-family:Inter,Arial,sans-serif;color:#2B2926">
       <h2 style="font-family:Georgia,serif">Atelier Abaya</h2>
       <p>Order <strong>${reference}</strong></p>
       <p>${body}</p>
     </div>`,
  );
}
