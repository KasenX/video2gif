import { type Request, type Response } from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const uploadFile = (req: Request, res: Response) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const uniqueFileName = `${uuidv4()}${path.extname(file.name)}`;
    const uploadPath = path.join(__dirname, '..', 'uploads', uniqueFileName);

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${uniqueFileName}`;
    
        res.status(201).header('Location', fileUrl).send({
            message: 'File uploaded successfully!',
            location: fileUrl
        });
    });
};
