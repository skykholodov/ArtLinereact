import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage';
import { InsertContent } from '@shared/schema';

/**
 * Обрабатывает массовый импорт контента
 */
export async function bulkImport(req: Request, res: Response) {
  try {
    const { sectionType, format, content, language } = req.body;
    
    if (!sectionType || !format || !content || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Пожалуйста, укажите все необходимые поля: тип раздела, формат, содержимое и язык'
      });
    }
    
    // Переменная для хранения массива данных
    let dataArray: any[] = [];
    
    // Парсим данные в зависимости от формата
    if (format === 'json') {
      try {
        dataArray = JSON.parse(content);
        if (!Array.isArray(dataArray)) {
          dataArray = [dataArray]; // Если передан один объект, преобразуем его в массив
        }
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid JSON format',
          message: 'Проверьте формат JSON. Данные должны быть массивом объектов'
        });
      }
    } else if (format === 'csv') {
      try {
        dataArray = parse(content, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid CSV format',
          message: 'Проверьте формат CSV. Первая строка должна содержать заголовки'
        });
      }
    } else {
      return res.status(400).json({ 
        error: 'Invalid format',
        message: 'Поддерживаемые форматы: JSON, CSV'
      });
    }
    
    // Проверка наличия данных
    if (dataArray.length === 0) {
      return res.status(400).json({ 
        error: 'No data to import',
        message: 'Нет данных для импорта'
      });
    }
    
    // Счетчик для успешно импортированных записей
    let importedCount = 0;
    const errors: string[] = [];
    
    // Получаем ID пользователя
    const userId = req.user?.id;
    
    // В зависимости от типа секции выполняем разные действия
    switch (sectionType) {
      case 'portfolio':
        for (const item of dataArray) {
          try {
            const contentData: InsertContent = {
              sectionType: 'portfolio',
              sectionKey: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              language,
              content: {
                title: item.title || '',
                description: item.description || '',
                category: item.category || 'other',
                image: item.image || '',
                date: item.date || new Date().toISOString().slice(0, 10)
              },
              createdBy: userId,
              updatedBy: userId
            };
            
            await storage.createContent(contentData);
            importedCount++;
          } catch (error) {
            errors.push(`Ошибка при импорте элемента портфолио: ${(error as Error).message}`);
          }
        }
        break;
        
      case 'services':
        for (const item of dataArray) {
          try {
            const contentData: InsertContent = {
              sectionType: 'services',
              sectionKey: `service-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              language,
              content: {
                title: item.title || '',
                description: item.description || '',
                icon: item.icon || 'settings',
                price: item.price || ''
              },
              createdBy: userId,
              updatedBy: userId
            };
            
            await storage.createContent(contentData);
            importedCount++;
          } catch (error) {
            errors.push(`Ошибка при импорте услуги: ${(error as Error).message}`);
          }
        }
        break;
        
      case 'testimonials':
        for (const item of dataArray) {
          try {
            const contentData: InsertContent = {
              sectionType: 'testimonials',
              sectionKey: `testimonial-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              language,
              content: {
                author: item.author || '',
                position: item.position || '',
                text: item.text || '',
                rating: parseInt(item.rating) || 5,
                company: item.company || ''
              },
              createdBy: userId,
              updatedBy: userId
            };
            
            await storage.createContent(contentData);
            importedCount++;
          } catch (error) {
            errors.push(`Ошибка при импорте отзыва: ${(error as Error).message}`);
          }
        }
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Invalid section type',
          message: 'Поддерживаемые типы разделов: portfolio, services, testimonials'
        });
    }
    
    // Возвращаем результат
    res.status(200).json({
      importedCount,
      totalCount: dataArray.length,
      errors: errors.length > 0 ? errors : undefined,
      success: importedCount > 0,
    });
    
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: `Произошла ошибка сервера: ${(error as Error).message}`
    });
  }
}