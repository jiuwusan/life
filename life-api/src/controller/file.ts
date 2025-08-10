import {
    Res,
    Get,
    Post,
    Param,
    Controller,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { uuid } from '@/utils/util';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const getUploadRootDir = () => {
    return path.join(process.env.UPLOAD_DIR || __dirname, 'uploads')
}

@Controller('files')
export class FileController {
    @Post('upload/:type')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, _, cb) => {
                    const type = req.params.type || 'files';
                    const dateStr = new Date().toISOString().slice(0, 10).replace(/\-/g, '');
                    const uploadPath = path.join(getUploadRootDir(), type, dateStr);
                    // 确保目录存在
                    fs.mkdirSync(uploadPath, { recursive: true });
                    cb(null, uploadPath);
                },
                filename: (_, file, cb) => {
                    const ext = path.extname(file.originalname);
                    // const name = path.basename(file.originalname, ext);
                    cb(null, `${uuid()}${ext}`);
                }
            })
        })
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        const pathName = path.relative(getUploadRootDir(), file.path).replace(/\\/g, '/');
        return {
            fileId: path.parse(file.filename).name,
            fileName: file.filename,
            pathName
        };
    }

    @Get('send/:type/:date/:fileName')
    getFile(@Param('type') type: string, @Param('date') date: string, @Param('fileName') fileName: string, @Res() res: Response,) {
        const filePath = path.join(
            getUploadRootDir(),
            type,
            date,
            fileName
        );

        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }

        res.sendFile(filePath);
    }
}

