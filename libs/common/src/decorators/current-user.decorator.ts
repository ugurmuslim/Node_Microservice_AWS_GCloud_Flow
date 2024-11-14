 import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsersDocument } from '@app/common';

const getCurrentUserByContext = (context: ExecutionContext): UsersDocument => {
  const request = context.switchToHttp().getRequest();
  return request.user;
}


export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getCurrentUserByContext(context)
)