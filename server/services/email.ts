import nodemailer from 'nodemailer';
import { ContactSubmission } from '@shared/schema';

// Адрес отправителя и получателя уведомлений
const FROM_EMAIL = 'noreply@art-line.kz';
const ADMIN_EMAIL = 'kholodovz@gmail.com';

// Транспорт для отправки почты (будет инициализирован позже)
let transporter: nodemailer.Transporter;

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
 * Инициализирует транспорт для отправки почты.
 * Если EMAIL_USER и EMAIL_PASS не настроены, создает тестовый аккаунт Ethereal.
 */
async function initializeTransport() {
  // Если транспорт уже инициализирован, возвращаем true
  if (transporter) {
    return true;
  }
  
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Используем настроенные учетные данные SMTP
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      console.log('SMTP транспорт настроен с реальными учетными данными');
    } else {
      // Генерируем тестовую учетную запись Ethereal для разработки
      const testAccount = await nodemailer.createTestAccount();
      
      console.log('Тестовый аккаунт Ethereal Email создан:');
      console.log('- Email:', testAccount.user);
      console.log('- Пароль:', testAccount.pass);
      console.log('- SMTP URL:', `https://ethereal.email/login`);
      console.log('Используйте эти данные для просмотра отправленных писем');
      
      // Создаем транспорт с тестовыми данными
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка инициализации транспорта:', error);
    return false;
  }
}

/**
 * Отправляет уведомление администратору о новой заявке
 */
export async function sendAdminNotification(submission: ContactSubmission): Promise<boolean> {
  try {
    // Инициализируем транспорт перед отправкой
    if (!(await initializeTransport())) {
      console.error('Не удалось инициализировать транспорт для отправки email');
      return false;
    }
    
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
    // Инициализируем транспорт перед отправкой
    if (!(await initializeTransport())) {
      console.error('Не удалось инициализировать транспорт для отправки email');
      return false;
    }
    
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
    
    // Показываем URL превью для тестовых сообщений Ethereal
    if (info && typeof info === 'object' && 'messageId' in info) {
      const previewURL = nodemailer.getTestMessageUrl(info);
      if (previewURL) {
        console.log('Превью письма:', previewURL);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Nodemailer error sending user confirmation:', error);
    return false;
  }
}