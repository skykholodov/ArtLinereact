import { Request, Response } from "express";
import { storage } from "../storage";
import fs from "fs";
import path from "path";

// Upload files (images)
export async function uploadFiles(req: Request, res: Response) {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    
    const category = req.body.category || "general";
    const userId = req.user?.id;
    
    const uploadedFiles = [];
    
    for (const file of req.files as Express.Multer.File[]) {
      // Create media record
      const media = await storage.createMedia({
        filename: path.basename(file.path),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        category,
        uploadedBy: userId
      });
      
      uploadedFiles.push(media);
    }
    
    res.status(201).json(uploadedFiles);
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "Error uploading files" });
  }
}

// Get media files
export async function getMedia(req: Request, res: Response) {
  try {
    const { category } = req.query;
    
    if (category) {
      const media = await storage.getMediaByCategory(category as string);
      return res.json(media);
    }
    
    const allMedia = await storage.getAllMedia();
    res.json(allMedia);
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ message: "Error fetching media" });
  }
}

// Delete media file
export async function deleteMedia(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Missing media id" });
    }
    
    const media = await storage.getMediaById(parseInt(id));
    
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }
    
    // Delete the file from the filesystem
    try {
      fs.unlinkSync(media.path);
    } catch (error) {
      console.error("Error deleting file from filesystem:", error);
      // Continue anyway to delete from database
    }
    
    // Delete from database
    const deleted = await storage.deleteMedia(parseInt(id));
    
    if (!deleted) {
      return res.status(500).json({ message: "Error deleting media from database" });
    }
    
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ message: "Error deleting media" });
  }
}
