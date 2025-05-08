import nodemailer from 'nodemailer';
import { ContactSubmission } from '@shared/schema';

// Адрес отправителя и получателя уведомлений
const FROM_EMAIL = 'noreply@art-line.kz';
const ADMIN_EMAIL = 'kholodovz@gmail.com';

// Создаем транспорт для отправки почты
// Используем общедоступный сервис ethereal.email для тестирования
// В реальном проекте здесь будут реальные учетные данные SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email', // сгенерированное имя пользователя
    pass: process.env.EMAIL_PASS || 'ethereal.password', // сгенерированный пароль
  },
});

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
 * Создает тестовые учетные данные SMTP, если они не настроены
 */
async function createTestAccount() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    try {
      // Генерируем тестовую учетную запись Ethereal для разработки
      const testAccount = await nodemailer.createTestAccount();
      
      console.log('Тестовый аккаунт Ethereal Email создан:');
      console.log('- Email:', testAccount.user);
      console.log('- Пароль:', testAccount.pass);
      console.log('- SMTP URL:', `https://ethereal.email/login`);
      console.log('Используйте эти данные для просмотра отправленных писем');
      
      // Обновляем транспорт с новыми данными
      transporter.options.auth = {
        user: testAccount.user,
        pass: testAccount.pass
      };
      
      return true;
    } catch (error) {
      console.error('Ошибка создания тестового аккаунта:', error);
      return false;
    }
  }
  return true;
}

/**
 * Отправляет уведомление администратору о новой заявке
 */
export async function sendAdminNotification(submission: ContactSubmission): Promise<boolean> {
  try {
    await createTestAccount();
    
    // Отправка email администратору
    const info = await transporter.sendMail({
      from: `"Art Line" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: 'Новая заявка с сайта Art Line',
      html: formatSubmissionContent(submission),
    });
    
    console.log(`Email notification sent for submission ID: ${submission.id}`);
    // Показываем URL превью для тестовых сообщений Ethereal
    if (info && typeof info === 'object' && 'messageId' in info) {
      const previewURL = nodemailer.getTestMessageUrl(info);
      if (previewURL) {
        console.log('Превью письма:', previewURL);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Nodemailer error:', error);
    return false;
  }
}

/**
 * Отправляет подтверждение пользователю, отправившему форму
 */
export async function sendUserConfirmation(submission: ContactSubmission): Promise<boolean> {
  // Если email пользователя не указан, просто выходим
  if (!submission.email) {
    return false;
  }

  try {
    await createTestAccount();
    
    // Отправка email подтверждения пользователю
    const info = await transporter.sendMail({
      from: `"Art Line" <${FROM_EMAIL}>`,
      to: submission.email,
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
    
    console.log(`User confirmation sent to ${submission.email}`);
    console.log('Превью: %s', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('Nodemailer error sending user confirmation:', error);
    return false;
  }
}