const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "HostPro <noreply@hostpro.fr>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    // Dev mode: log to console instead of sending
    console.log(`[EMAIL - dev mode] To: ${to} | Subject: ${subject}`);
    return { ok: true, id: "dev-" + Date.now() };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[email] Resend error:", err);
      return { ok: false, error: "Email service error" };
    }

    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (e) {
    console.error("[email] Network error:", e);
    return { ok: false, error: "Network error" };
  }
}

// ── Templates ────────────────────────────────────────────────────────────────

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px; margin: 0 auto; background: #fff;
`;
const btnStyle = `
  display: inline-block; background: #1d4ed8; color: #fff;
  padding: 12px 24px; border-radius: 8px; text-decoration: none;
  font-weight: 600; font-size: 15px;
`;

export function sendWelcomeEmail(to: string, name: string): Promise<SendResult> {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#1d4ed8;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Bienvenue sur HostPro</h1>
      </div>
      <div style="padding:32px;">
        <p>Bonjour ${name},</p>
        <p>Votre compte HostPro est prêt. Gérez vos propriétés, réservations et conformité depuis un seul endroit.</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${APP_URL}/dashboard" style="${btnStyle}">Accéder au tableau de bord</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">En cas de problème, contactez-nous à support@hostpro.fr</p>
      </div>
    </div>`;
  return sendEmail(to, "Bienvenue sur HostPro ", html);
}

export function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<SendResult> {
  const link = `${APP_URL}/reset-password?token=${token}`;
  const html = `
    <div style="${baseStyle}">
      <div style="background:#1d4ed8;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Réinitialisation du mot de passe</h1>
      </div>
      <div style="padding:32px;">
        <p>Vous avez demandé à réinitialiser votre mot de passe HostPro.</p>
        <p>Ce lien est valable <strong>15 minutes</strong>.</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${link}" style="${btnStyle}">Réinitialiser mon mot de passe</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
        <p style="color:#6b7280;font-size:12px;word-break:break-all;">Lien : ${link}</p>
      </div>
    </div>`;
  return sendEmail(to, "Réinitialisation de votre mot de passe HostPro", html);
}

export function sendTeamInviteEmail(
  to: string,
  inviterName: string,
  tempPassword: string,
  tenantName: string
): Promise<SendResult> {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#1d4ed8;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Invitation HostPro</h1>
      </div>
      <div style="padding:32px;">
        <p>${inviterName} vous invite à rejoindre l'espace <strong>${tenantName}</strong> sur HostPro.</p>
        <p>Vos identifiants temporaires :</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:4px 0;"><strong>Email :</strong> ${to}</p>
          <p style="margin:4px 0;"><strong>Mot de passe temporaire :</strong> <code>${tempPassword}</code></p>
        </div>
        <p style="text-align:center;margin:32px 0;">
          <a href="${APP_URL}/login" style="${btnStyle}">Accéder à HostPro</a>
        </p>
        <p style="color:#dc2626;font-size:13px;">⚠️ Changez votre mot de passe dès votre première connexion.</p>
      </div>
    </div>`;
  return sendEmail(to, `Invitation à rejoindre ${tenantName} sur HostPro`, html);
}

export function sendBookingConfirmationEmail(
  to: string,
  guestName: string,
  data: {
    reference: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalAmount: number;
  }
): Promise<SendResult> {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#1d4ed8;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Confirmation de réservation</h1>
        <p style="color:#bfdbfe;margin:8px 0 0;">Référence : ${data.reference}</p>
      </div>
      <div style="padding:32px;">
        <p>Bonjour ${guestName},</p>
        <p>Votre réservation est confirmée. Voici le récapitulatif :</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;color:#6b7280;">Propriété</td>
            <td style="padding:10px 0;font-weight:600;">${data.propertyName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;color:#6b7280;">Arrivée</td>
            <td style="padding:10px 0;">${data.checkIn}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;color:#6b7280;">Départ</td>
            <td style="padding:10px 0;">${data.checkOut}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;color:#6b7280;">Nuits</td>
            <td style="padding:10px 0;">${data.nights}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-weight:600;">Total</td>
            <td style="padding:10px 0;font-weight:700;font-size:18px;">${data.totalAmount.toFixed(2)} €</td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:13px;">Pour toute question, contactez-nous à contact@hostpro.fr</p>
      </div>
    </div>`;
  return sendEmail(to, `Confirmation de réservation — ${data.reference}`, html);
}
