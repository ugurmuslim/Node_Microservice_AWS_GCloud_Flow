import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable, Logger,
} from '@nestjs/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AUTH_SERVICE } from '@app/common/constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from '@app/common/dto/user.dto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt = context.switchToHttp().getRequest().cookies?.Authentication || context.switchToHttp().getRequest().headers.Authentication;

    if (!jwt) {
      return false;
    }
  console.log("AUTH", this.authClient)
    return this.authClient.send<UserDto>('authenticate', { Authentication: jwt }).pipe(
      tap((res) => {
        context.switchToHttp().getRequest().user = res;
      }),map(() => true),
      catchError(() => of(false)),
    );
  }
}
