// backend/utils/imageUtils.ts
import axios from "axios";
import { Types } from "mongoose";

export async function convertImageToDataURL(imageUrl: string): Promise<string> {
  try {
    if (imageUrl.startsWith('data:')) {
      return imageUrl; 
    }

    if (imageUrl.startsWith('http')) {

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(response.data).toString('base64');
      const mimeType = response.headers['content-type'] || 'image/png';
      return `data:${mimeType};base64,${base64}`;
    } else {

      const fs = require('fs').promises;
      const imageBuffer = await fs.readFile(imageUrl);
      const base64 = imageBuffer.toString('base64');
      

      let mimeType = 'image/png';
      if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) mimeType = 'image/jpeg';
      if (imageUrl.endsWith('.gif')) mimeType = 'image/gif';
      if (imageUrl.endsWith('.webp')) mimeType = 'image/webp';
      
      return `data:${mimeType};base64,${base64}`;
    }
  } catch (error) {
    console.error('Error converting image to data URL:', error);
    return ''; 
  }
}