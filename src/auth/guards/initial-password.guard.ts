import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

interface AuthenticatedRequest {
  user?: {
    userId: number;
    mustChangePassword: boolean;
  };
}

@Injectable()
export class InitialPasswordGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.mustChangePassword) {
      throw new ForbiddenException(
        'Debés establecer una nueva contraseña antes de utilizar el sistema',
      );
    }

    return true;
  }
}
