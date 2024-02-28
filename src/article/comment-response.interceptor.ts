import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class CommentResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    const comments = data.map((comment) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { article, ...restResponse } = comment;
                        return { ...restResponse };
                    });

                    return { comments: [...comments] };
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { article, ...restResponse } = data;

                    return {
                        comment: { ...restResponse },
                    };
                }
            }),
        );
    }
}
