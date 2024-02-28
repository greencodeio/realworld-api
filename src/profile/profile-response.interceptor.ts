import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export class ProfileResponse implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map((data) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { email, ...restData } = data;

                return { profile: { ...restData } };
            }),
        );
    }
}
