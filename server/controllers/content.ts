import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { translateContent, type Language, type ContentField } from "../services/translation";

// Schema for content request validation
const contentRequestSchema = z.object({
  sectionType: z.string().min(1),
  sectionKey: z.string().min(1),
  language: z.string().refine(val => ['ru', 'kz', 'en'].includes(val), {
    message: "Language must be one of: ru, kz, en",
  }),
  content: z.any()
});

// Get content for a specific section, key, and language
export async function getContent(req: Request, res: Response) {
  try {
    const { sectionType, sectionKey, language } = req.query;

    // If all query parameters are provided, return specific content
    if (sectionType && sectionKey && language) {
      const content = await storage.getContent(
        sectionType as string,
        sectionKey as string,
        language as string
      );
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      return res.json(content);
    }
    
    // If only sectionType and sectionKey are provided, return content for all languages
    if (sectionType && sectionKey) {
      const ru = await storage.getContent(sectionType as string, sectionKey as string, 'ru');
      const kz = await storage.getContent(sectionType as string, sectionKey as string, 'kz');
      const en = await storage.getContent(sectionType as string, sectionKey as string, 'en');
      
      return res.json({ ru, kz, en });
    }
    
    // If only sectionType is provided, return all content for that section
    if (sectionType) {
      const contents = await storage.getAllContentBySectionType(sectionType as string);
      return res.json(contents);
    }
    
    // If no query parameters, return error
    return res.status(400).json({ message: "Missing required query parameters" });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Error fetching content" });
  }
}

// Save content for a specific section, key, and language
export async function saveContent(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = contentRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request body", 
        errors: validationResult.error.errors 
      });
    }
    
    const { sectionType, sectionKey, language, content } = validationResult.data;
    
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user?.id;
    
    // Save content
    const savedContent = await storage.createContent({
      sectionType,
      sectionKey,
      language,
      content,
      createdBy: userId,
      updatedBy: userId
    });
    
    // Если сохраняется русскоязычный контент и включена опция автоперевода,
    // выполняем автоматический перевод на другие языки
    if (language === 'ru' && req.body.autoTranslate === true) {
      try {
        // Определяем поля для перевода в зависимости от типа контента
        let fieldsToTranslate: ContentField[] = ['content'];
        
        // Для определенных типов разделов добавляем дополнительные поля
        if (sectionType === 'hero' || sectionType === 'services' || sectionType === 'about') {
          fieldsToTranslate = ['title', 'description', 'content'];
        }
        
        // Автоматически переводим контент на все поддерживаемые языки
        const translations = await translateContent({ ...req.body }, fieldsToTranslate, 'ru');
        
        // Сохраняем переводы для других языков
        const savePromises = Object.entries(translations)
          .filter(([lang]) => lang !== 'ru') // Пропускаем русский, он уже сохранен
          .map(async ([lang, translatedContent]) => {
            try {
              // Создаем новый контент с переведенными данными
              return await storage.createContent({
                sectionType,
                sectionKey,
                language: lang as Language,
                content: translatedContent.content,
                createdBy: userId,
                updatedBy: userId
              });
            } catch (err) {
              console.error(`Error saving ${lang} translation:`, err);
              return null;
            }
          });
        
        // Ждем выполнения всех операций сохранения
        await Promise.all(savePromises);
        
        // Возвращаем успешный ответ с информацией о переводах
        return res.status(201).json({
          original: savedContent,
          translationsCreated: true,
          languages: ['kz', 'en']
        });
      } catch (translationError) {
        console.error("Error during auto-translation:", translationError);
        // Возвращаем ответ об успешном сохранении оригинала, но с ошибкой перевода
        return res.status(201).json({
          original: savedContent,
          translationsCreated: false,
          translationError: "Не удалось автоматически перевести контент"
        });
      }
    }
    
    // Стандартный ответ без переводов
    res.status(201).json(savedContent);
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).json({ message: "Error saving content" });
  }
}

// Get content revisions for a specific content
export async function getContentRevisions(req: Request, res: Response) {
  try {
    const { sectionType, sectionKey, language } = req.query;
    
    if (!sectionType || !sectionKey || !language) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }
    
    const revisions = await storage.getContentRevisionsByCriteria(
      sectionType as string,
      sectionKey as string,
      language as string
    );
    
    res.json(revisions);
  } catch (error) {
    console.error("Error fetching content revisions:", error);
    res.status(500).json({ message: "Error fetching content revisions" });
  }
}

// Restore a specific content revision
export async function restoreContentRevision(req: Request, res: Response) {
  try {
    const { revisionId } = req.params;
    
    if (!revisionId) {
      return res.status(400).json({ message: "Missing revisionId parameter" });
    }
    
    const revision = await storage.getContentRevision(parseInt(revisionId));
    
    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }
    
    // Get the content associated with this revision
    const content = await storage.getContent(
      req.body.sectionType,
      req.body.sectionKey,
      req.body.language
    );
    
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    // Create a new revision of the current content before restoring
    await storage.createContentRevision({
      contentId: content.id,
      content: content.content,
      createdBy: req.user?.id
    });
    
    // Update the content with the revision data
    const updatedContent = await storage.updateContent(content.id, {
      content: revision.content,
      updatedAt: new Date(),
      updatedBy: req.user?.id
    });
    
    res.json(updatedContent);
  } catch (error) {
    console.error("Error restoring content revision:", error);
    res.status(500).json({ message: "Error restoring content revision" });
  }
}
