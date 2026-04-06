const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Service to handle email notifications via Resend
 */
export const sendEmail = async ({ to, subject, html }: EmailData) => {
  if (!RESEND_API_KEY) {
    console.warn("MailService: VITE_RESEND_API_KEY no configurada.");
    return null;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Go-Check <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('MailService Error Response:', data);
        throw new Error(data.message || 'Error al enviar email');
    }
    
    console.log('Email enviado correctamente:', data);
    return data;
  } catch (error) {
    console.error('Error detallado en MailService:', error);
    return null;
  }
};

/**
 * Sends a welcome email to a new user
 */
export const sendWelcomeEmail = async (userEmail: string, firstName: string, destination: string) => {
  const subject = `¡Bienvenido a Go-Check, ${firstName}! 🚀`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0052FF;">¡Tu camino a Europa comienza aquí!</h2>
      <p>Hola <strong>${firstName}</strong>,</p>
      <p>Estamos emocionados de acompañarte en tu proceso de visado para <strong>${destination === 'es' ? 'España' : destination}</strong>.</p>
      <p>Ya puedes empezar a gestionar tu agenda y subir tus documentos en la plataforma.</p>
      <div style="margin: 30px 0;">
        <a href="https://go-check.com" style="background: #0dfc05; color: #000; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ir a mi Dashboard</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #666;">Has recibido este correo porque te registraste en Go-Check.</p>
    </div>
  `;
  
  return sendEmail({ to: userEmail, subject, html });
};

/**
 * Notification for document progress
 */
export const sendProgressEmail = async (userEmail: string, firstName: string, docTitle: string, percentage: number) => {
  const subject = `¡Sigue así, ${firstName}! Tu expediente está al ${percentage}% 📈`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0052FF;">¡Nuevo avance en tu proceso!</h2>
      <p>Hola <strong>${firstName}</strong>,</p>
      <p>Has actualizado correctamente el documento: <strong>${docTitle}</strong>.</p>
      <p>Tu probabilidad de aprobación ahora es del <strong>${percentage}%</strong>. Estás cada vez más cerca de completar tu solicitud.</p>
      <div style="margin: 30px 0; background: #f0f4ff; padding: 15px; border-radius: 10px; text-align: center;">
        <span style="font-size: 24px; font-weight: bold; color: #0052FF;">${percentage}% Completado</span>
      </div>
      <div style="margin: 30px 0;">
        <a href="https://go-check.com" style="background: #0dfc05; color: #000; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ver mi progreso</a>
      </div>
    </div>
  `;
  
  return sendEmail({ to: userEmail, subject, html });
};
