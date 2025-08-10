import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { uuid } from '@/utils/util';
import * as path from 'path';
import * as fs from 'fs';

@Controller('file')
export class FileController {
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, _, cb) => {
                    const type = req.body.type || req.query.type || 'files';
                    const dateStr = new Date().toISOString().slice(0, 10);
                    const uploadPath = path.join(process.env.UPLOAD_DIR || __dirname, 'uploads', type, dateStr);
                    // 确保目录存在
                    fs.mkdirSync(uploadPath, { recursive: true });
                    cb(null, uploadPath);
                },
                filename: (_, file, cb) => {
                    const ext = path.extname(file.originalname);
                    const name = path.basename(file.originalname, ext);
                    cb(null, `${name}-${uuid()}${ext}`);
                }
            })
        })
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            message: '上传成功',
            filename: file.filename,
            path: file.path,
        };
    }
}
