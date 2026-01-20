import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not configured - emails will be skipped');
    return null;
  }
  
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log('[Email] Resend client initialized');
  }
  return resendClient;
}

function getFromAddress(): string {
  // In production, use support@mineraltax.ch (requires Resend domain verification)
  // In development, use Resend's test address which works without domain verification
  if (process.env.NODE_ENV === 'production') {
    return 'MineralTax <support@mineraltax.ch>';
  }
  return 'MineralTax <onboarding@resend.dev>';
}

interface WelcomeEmailData {
  to: string;
  customerName: string;
  dashboardUrl: string;
}

function generateWelcomeEmailHtml(customerName: string, dashboardUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue chez MineralTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #003366 0%, #0055a4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Bienvenue chez MineralTax
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Votre accès est prêt !
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${customerName}</strong>,
              </p>
              
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                Merci de votre confiance ! Votre accès à MineralTax est maintenant <strong style="color: #059669;">actif</strong> pour les 12 prochains mois.
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Voici vos 3 étapes pour réussir votre déclaration :</strong>
              </p>
              
              <!-- Steps -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; margin-bottom: 10px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 32px; height: 32px; background-color: #059669; color: white; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold;">1</div>
                        </td>
                        <td style="padding-left: 15px; color: #374151;">
                          <strong>Enregistrez vos machines</strong><br>
                          <span style="color: #6b7280; font-size: 14px;">Permis de circulation requis</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #eff6ff; border-radius: 8px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 32px; height: 32px; background-color: #2563eb; color: white; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold;">2</div>
                        </td>
                        <td style="padding-left: 15px; color: #374151;">
                          <strong>Scannez vos tickets</strong><br>
                          <span style="color: #6b7280; font-size: 14px;">Notre IA extrait les données automatiquement</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #fef3c7; border-radius: 8px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 32px; height: 32px; background-color: #d97706; color: white; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold;">3</div>
                        </td>
                        <td style="padding-left: 15px; color: #374151;">
                          <strong>Exportez votre CSV</strong><br>
                          <span style="color: #6b7280; font-size: 14px;">Compatible avec le portail Taxas de l'OFDF</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #003366 0%, #0055a4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(0, 51, 102, 0.3);">
                      Accéder à mon Tableau de Bord
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Help Section -->
              <div style="padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #d97706;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>En cas de blocage sur le portail Agate ?</strong><br>
                  Répondez simplement à cet email, notre équipe vous aidera à résoudre vos difficultés d'accès au portail fédéral.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                MineralTax Swiss - Remboursement simplifié de la taxe sur les huiles minérales
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} MineralTax. Tous droits réservés.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const client = getResendClient();
  
  if (!client) {
    console.log('[Email] Skipping welcome email - Resend not configured');
    return false;
  }
  
  try {
    const html = generateWelcomeEmailHtml(data.customerName, data.dashboardUrl);
    
    const result = await client.emails.send({
      from: getFromAddress(),
      to: data.to,
      subject: 'Bienvenue chez MineralTax - Votre acces est pret',
      html: html,
    });
    
    console.log(`[Email] Welcome email sent successfully to ${data.to}`, result);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return false;
  }
}

interface RenewalReminderEmailData {
  to: string;
  customerName: string;
  expirationDate: string;
  renewalUrl: string;
  daysRemaining: number;
}

function generateRenewalReminderEmailHtml(customerName: string, expirationDate: string, renewalUrl: string, daysRemaining: number): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel de renouvellement MineralTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Rappel de renouvellement
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Votre licence expire dans ${daysRemaining} jours
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${customerName}</strong>,
              </p>
              
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                Votre licence MineralTax arrive à expiration le <strong style="color: #d97706;">${expirationDate}</strong>.
              </p>
              
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                Pour continuer à utiliser notre service et garantir l'export de vos rapports OFDF, nous vous invitons à renouveler votre abonnement.
              </p>
              
              <!-- Benefits reminder -->
              <div style="padding: 20px; background-color: #f0fdf4; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #059669;">
                <p style="margin: 0 0 10px; color: #374151; font-weight: 600;">
                  Avec MineralTax, vous continuez de profiter de :
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  <li>Scan automatique de vos tickets</li>
                  <li>Export CSV compatible Taxas</li>
                  <li>Calcul automatique des remboursements</li>
                  <li>Support prioritaire</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${renewalUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);">
                      Renouveler maintenant - 250 CHF/an
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Des questions ? Contactez-nous a support@mineraltax.ch
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                MineralTax Swiss - Remboursement simplifie de la taxe sur les huiles minerales
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} MineralTax. Tous droits reserves.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendRenewalReminderEmail(data: RenewalReminderEmailData): Promise<boolean> {
  const client = getResendClient();
  
  if (!client) {
    console.log('[Email] Skipping renewal reminder email - Resend not configured');
    return false;
  }
  
  try {
    const html = generateRenewalReminderEmailHtml(data.customerName, data.expirationDate, data.renewalUrl, data.daysRemaining);
    
    const result = await client.emails.send({
      from: getFromAddress(),
      to: data.to,
      subject: `Rappel: Votre licence expire dans ${data.daysRemaining} jours`,
      html: html,
    });
    
    console.log(`[Email] Renewal reminder sent successfully to ${data.to}`, result);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send renewal reminder:', error);
    return false;
  }
}

function generateVerificationEmailHtml(firstName: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifiez votre email - MineralTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #003366 0%, #0055a4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Verifiez votre email
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Une derniere etape pour activer votre compte
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${firstName || 'cher client'}</strong>,
              </p>
              
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                Merci de vous etre inscrit sur MineralTax. Pour activer votre compte et acceder a toutes les fonctionnalites, veuillez verifier votre adresse email.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">
                      Verifier mon email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas cree de compte sur MineralTax, vous pouvez ignorer cet email.
              </p>
              
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                <span style="color: #6b7280; word-break: break-all;">${verificationUrl}</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                MineralTax Swiss - Remboursement simplifie de la taxe sur les huiles minerales
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} MineralTax. Tous droits reserves.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendVerificationEmail(to: string, firstName: string, verificationUrl: string): Promise<boolean> {
  const client = getResendClient();
  
  if (!client) {
    console.log('[Email] Skipping verification email - Resend not configured');
    return false;
  }
  
  try {
    const html = generateVerificationEmailHtml(firstName, verificationUrl);
    
    console.log(`[Email] Attempting to send verification email to ${to}`);
    const fromAddress = getFromAddress();
    console.log(`[Email] Using from address: ${fromAddress}`);
    
    const result = await client.emails.send({
      from: fromAddress,
      to: to,
      subject: 'Verifiez votre email - MineralTax',
      html: html,
    });
    
    console.log(`[Email] Verification email sent successfully to ${to}`, JSON.stringify(result));
    return true;
  } catch (error) {
    console.error('[Email] Failed to send verification email:', error);
    return false;
  }
}

function generatePasswordResetEmailHtml(firstName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reinitialisation du mot de passe - MineralTax</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Reinitialisation du mot de passe
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Vous avez demande un nouveau mot de passe
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${firstName || 'cher client'}</strong>,
              </p>
              
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                Nous avons recu une demande de reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #003366 0%, #0055a4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(0, 51, 102, 0.3);">
                      Reinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute securite.
              </p>
              
              <div style="padding: 15px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>Conseil de securite :</strong> Ne partagez jamais ce lien avec personne. MineralTax ne vous demandera jamais votre mot de passe par email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                MineralTax Swiss - Remboursement simplifie de la taxe sur les huiles minerales
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} MineralTax. Tous droits reserves.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendPasswordResetEmail(to: string, firstName: string, resetUrl: string): Promise<boolean> {
  const client = getResendClient();
  
  if (!client) {
    console.log('[Email] Skipping password reset email - Resend not configured');
    return false;
  }
  
  try {
    const html = generatePasswordResetEmailHtml(firstName, resetUrl);
    
    const result = await client.emails.send({
      from: getFromAddress(),
      to: to,
      subject: 'Reinitialisation de votre mot de passe - MineralTax',
      html: html,
    });
    
    console.log(`[Email] Password reset email sent successfully to ${to}`, result);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    return false;
  }
}
