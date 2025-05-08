import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const CHAT_MODEL = "gpt-4o";

// Инициализация клиента OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Языки, поддерживаемые системой
export type Language = 'ru' | 'kz' | 'en';
export type ContentField = 'title' | 'description' | 'content' | 'items';

/**
 * Переводит текст на указанный язык с использованием OpenAI API
 * 
 * @param text исходный текст для перевода
 * @param targetLang целевой язык перевода ('ru', 'kz', 'en')
 * @param sourceLang исходный язык текста (по умолчанию 'ru')
 * @returns переведенный текст
 */
export async function translateText(
  text: string, 
  targetLang: Language, 
  sourceLang: Language = 'ru'
): Promise<string> {
  // Если исходный и целевой языки совпадают, возвращаем текст без изменений
  if (targetLang === sourceLang) {
    return text;
  }

  // Карта полных названий языков
  const languageNames = {
    ru: 'русский',
    kz: 'казахский',
    en: 'английский'
  };

  try {
    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `Вы профессиональный переводчик. Ваша задача - перевести текст с ${languageNames[sourceLang]} языка на ${languageNames[targetLang]} язык, 
            сохраняя стиль, смысл и форматирование. Если текст содержит HTML/Markdown разметку или JSON, сохраните ее структуру.
            Верните только перевод без дополнительных пояснений.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1, // Низкая температура для более точных переводов
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Ошибка при переводе текста:", error);
    return text; // В случае ошибки возвращаем исходный текст
  }
}

/**
 * Автоматически переводит контент для всех поддерживаемых языков
 * 
 * @param contentObj Объект контента с полями для перевода
 * @param fields Массив полей, которые нужно перевести
 * @param sourceLang Исходный язык контента
 * @returns Объект с переводами для всех языков
 */
export async function translateContent(
  contentObj: Record<string, any>,
  fields: ContentField[],
  sourceLang: Language = 'ru'
): Promise<Record<Language, Record<string, any>>> {
  // Все поддерживаемые языки
  const targetLanguages: Language[] = ['ru', 'kz', 'en'];
  const result: Record<Language, Record<string, any>> = {} as any;

  // Получаем переводы для каждого языка
  for (const lang of targetLanguages) {
    // Если это язык исходного контента, то просто копируем без перевода
    if (lang === sourceLang) {
      result[lang] = { ...contentObj };
      continue;
    }

    // Создаем глубокую копию исходного объекта
    const translatedObj = JSON.parse(JSON.stringify(contentObj));
    
    // Для каждого указанного поля выполняем перевод
    for (const field of fields) {
      // Проверяем наличие поля в объекте
      if (field in contentObj) {
        translatedObj[field] = await translateField(contentObj[field], lang, sourceLang);
      }
    }

    result[lang] = translatedObj;
  }

  return result;
}

/**
 * Вспомогательная функция для рекурсивного перевода полей различных типов
 * 
 * @param fieldValue Значение поля для перевода
 * @param targetLang Целевой язык перевода
 * @param sourceLang Исходный язык контента
 * @returns Переведенное значение того же типа
 */
async function translateField(
  fieldValue: any, 
  targetLang: Language, 
  sourceLang: Language
): Promise<any> {
  // Пустые значения не переводим
  if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
    return fieldValue;
  }

  // Перевод строковых значений
  if (typeof fieldValue === 'string') {
    return await translateText(fieldValue, targetLang, sourceLang);
  }

  // Перевод массивов: переводим каждый элемент массива
  if (Array.isArray(fieldValue)) {
    const translatedArray = [];
    
    for (const item of fieldValue) {
      if (typeof item === 'object' && item !== null) {
        // Для объектов в массиве выполняем рекурсивный перевод
        translatedArray.push(await translateObject(item, targetLang, sourceLang));
      } else if (typeof item === 'string') {
        // Для строк выполняем прямой перевод
        translatedArray.push(await translateText(item, targetLang, sourceLang));
      } else {
        // Остальные типы (числа, булевы значения и т.д.) оставляем как есть
        translatedArray.push(item);
      }
    }
    
    return translatedArray;
  }

  // Перевод объектов: рекурсивно переводим все строковые поля
  if (typeof fieldValue === 'object') {
    return await translateObject(fieldValue, targetLang, sourceLang);
  }

  // Для всех остальных типов (числа, булевы значения и т.д.) возвращаем исходное значение
  return fieldValue;
}

/**
 * Переводит все строковые поля в объекте
 * 
 * @param obj Объект для перевода
 * @param targetLang Целевой язык перевода
 * @param sourceLang Исходный язык контента
 * @returns Новый объект с переведенными строковыми полями
 */
async function translateObject(
  obj: Record<string, any>,
  targetLang: Language,
  sourceLang: Language
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  
  // Обходим все поля объекта
  for (const [key, value] of Object.entries(obj)) {
    // Пропускаем служебные поля и идентификаторы
    if (key === 'id' || key === 'key' || key === 'date' || key === 'createdAt' || key === 'updatedAt') {
      result[key] = value;
      continue;
    }
    
    // Рекурсивно переводим каждое поле
    result[key] = await translateField(value, targetLang, sourceLang);
  }
  
  return result;
}

/**
 * Определяет язык текста с помощью OpenAI
 * 
 * @param text Текст для определения языка
 * @returns Код языка ('ru', 'kz', 'en') или null в случае ошибки
 */
export async function detectLanguage(text: string): Promise<Language | null> {
  try {
    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `Определите язык текста и верните только код языка из списка: 'ru' для русского, 'kz' для казахского или 'en' для английского.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      const lang = result.language || result.lang || result.code;
      
      if (lang && ['ru', 'kz', 'en'].includes(lang)) {
        return lang as Language;
      }
      
      return 'ru'; // По умолчанию возвращаем русский
    } catch (error) {
      console.error("Ошибка при разборе ответа определения языка:", error);
      return 'ru';
    }
  } catch (error) {
    console.error("Ошибка при определении языка:", error);
    return null;
  }
}