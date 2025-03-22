import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const error = exception.getError();
    const rpcError =
      typeof error === 'string' ? { message: error, status: 400 } : error;

    if (
      typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const status = isNaN(Number(rpcError.status)) ? 400 : rpcError.status;
      return response.status(status).json(rpcError);
    }
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: rpcError,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
