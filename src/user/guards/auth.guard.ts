import { IExpressRequest } from '@app/user/interfaces/express-request.interface';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        ctx: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = ctx.switchToHttp().getRequest<IExpressRequest>();

        if (!req.user) throw new UnauthorizedException('Not Authorized');

        return true;
    }
}
