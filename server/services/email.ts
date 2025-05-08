import { MailService } from '@sendgrid/mail';
import { ContactSubmission } from '@shared/schema';

// Проверяем наличие API ключа SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not set. Email notifications will not be sent.");
}

const mailService = new MailService();

// Устанавливаем API ключ если он доступен
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Адрес отправителя и получателя уведомлений
const FROM_EMAIL = 'noreply@art-line.kz';
const ADMIN_EMAIL = 'info@art-line.kz';

/**
 * Форматирует данные заявки для удобного просмотра в email
 */
function formatSubmissionContent(submission: ContactSubmission): string {
  return `
    <h2>Новая заявка с сайта</h2>
    <p><strong>Имя:</strong> ${submission.name}</p>
    <p><strong>Телефон:</strong> ${submission.phone}</p>
    ${submission.email ? `<p><strong>Email:</strong> ${submission.email}</p>` : ''}
    ${submission.service ? `<p><strong>Услуга:</strong> ${submission.service}</p>` : ''}
    ${submission.message ? `<p><strong>Сообщение:</strong> ${submission.message}</p>` : ''}
    <p><strong>Дата:</strong> ${new Date(submission.createdAt).toLocaleString('ru-RU')}</p>
  `;
}

/**
 * Отправляет уведомление администратору о новой заявке
 */
export async function sendAdminNotification(submission: ContactSubmission): Promise<boolean> {
  // Если API ключ не настроен, просто записываем в лог и возвращаем false
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email notification skipped: SendGrid API key not configured');
    return false;
  }

  try {
    await mailService.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject: 'Новая заявка с сайта Art Line',
      html: formatSubmissionContent(submission),
    });
    console.log(`Email notification sent for submission ID: ${submission.id}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Отправляет подтверждение пользователю, отправившему форму
 */
export async function sendUserConfirmation(submission: ContactSubmission): Promise<boolean> {
  // Если API ключ не настроен или нет email пользователя, просто возвращаем false
  if (!process.env.SENDGRID_API_KEY || !submission.email) {
    return false;
  }

  try {
    await mailService.send({
      to: submission.email,
      from: FROM_EMAIL,
      subject: 'Ваша заявка в Art Line получена',
      html: `
        <h2>Спасибо за обращение в Art Line!</h2>
        <p>Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
        <p>Данные вашей заявки:</p>
        <p><strong>Имя:</strong> ${submission.name}</p>
        <p><strong>Телефон:</strong> ${submission.phone}</p>
        ${submission.service ? `<p><strong>Услуга:</strong> ${submission.service}</p>` : ''}
        ${submission.message ? `<p><strong>Сообщение:</strong> ${submission.message}</p>` : ''}
        <hr>
        <p>С уважением,<br>Команда Art Line</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error sending user confirmation:', error);
    return false;
  }
}