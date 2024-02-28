import { IExpressRequest } from '@app/user/interfaces/express-request.interface';
import { UserService } from '@app/user/user.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}

    async use(req: IExpressRequest, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            req.user = null;

            next();
            return;
        }

        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodeToken = verify(
                token,
                this.configService.get('JWT_SECRET'),
            );
            const user = await this.userService.getUserById(decodeToken.id);

            req.user = user;

            next();
        } catch (error) {
            req.user = null;

            next();
        }
    }
}
