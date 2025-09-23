// middleware/upload.middleware.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage(); // Use memory instead of disk

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.svg',
    ];
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif, bmp, tiff, svg)'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;