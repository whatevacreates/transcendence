import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

class AvatarUploadService {
    static MAX_SIZE = process.env.MAX_UPLOAD_SIZE;
    static allowedTypes = ['image/png', 'image/jpeg'];

    static async save(file, userId) {
        // --- check types ---
        if (!AvatarUploadService.allowedTypes.includes(file.mimetype)) {
            throw new Error("Invalid file type. Only PNG or JPEG allowed.");
        }

        // --- check for .svg files ---
        if (file.filename.toLowerCase().endsWith('.svg')) {
            throw new Error("SVG files are not allowed.");
        }

        // --- check max size ---
        const buffer = await file.toBuffer();
        if (buffer.length > AvatarUploadService.MAX_SIZE) {
            throw new Error("File too large. Max size is 2MB.");
        }

        // --- Sanitize image using sharp ---
        const sanitizedBuffer = await sharp(buffer)
            .resize(256, 256, { fit: 'cover' }) // standardize to 256x256
            .png()
            .toBuffer();


        const uploadPath = path.join(process.cwd(), 'upload', 'avatar');
        const filename = `${userId}.png`;

        await fs.mkdir(uploadPath, { recursive: true });
        await fs.writeFile(path.join(uploadPath, filename), sanitizedBuffer);
    }
}

export default AvatarUploadService;
