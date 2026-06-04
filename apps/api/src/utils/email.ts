// Minimal email sender via Resend (https://resend.com) using fetch — no SDK.
// Gracefully degrades: when RESEND_API_KEY is unset, returns { sent: false }
// so the caller can fall back to showing the invite link for manual sending.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Ma Ville Agenda <onboarding@resend.dev>';

interface SendResult {
  sent: boolean;
  error?: string;
}

export const isEmailConfigured = () => !!RESEND_API_KEY;

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<SendResult> => {
  if (!RESEND_API_KEY) {
    return { sent: false, error: 'EMAIL_NOT_CONFIGURED' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { sent: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : 'send failed' };
  }
};

export const inviteEmailHtml = (inviteUrl: string, role: string): string => {
  const roleLabel = role === 'SUPER_ADMIN' ? 'Super Admin' : 'Modérateur';
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #212121;">
      <h1 style="color: #2d93c4;">Ma Ville Agenda</h1>
      <p>Vous avez été invité·e à rejoindre le backoffice de <strong>Ma Ville Agenda</strong> en tant que <strong>${roleLabel}</strong>.</p>
      <p>Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et activer votre compte :</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" style="background: #2d93c4; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Activer mon compte</a>
      </p>
      <p style="font-size: 13px; color: #757575;">Ou copiez ce lien : <br/>${inviteUrl}</p>
      <p style="font-size: 13px; color: #757575;">Ce lien expire dans 7 jours.</p>
    </div>
  `;
};
