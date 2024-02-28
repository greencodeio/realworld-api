import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserResponse implements NestInterceptor {
    constructor(private readonly configService: ConfigService) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map((data) => {
                return {
                    user: {
                        ...data,
                        token: sign(
                            {
                                id: data.id,
                                username: data.username,
                                email: data.email,
                            },
                            this.configService.get('JWT_SECRET'),
                        ),
                    },
                };
            }),
        );
    }
}
