import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TagNameInterceptor implements NestInterceptor {
    intercept(
        ctx: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map((tags) => {
                return { tags: tags.map((tag) => tag.name) };
            }),
        );
    }
}
