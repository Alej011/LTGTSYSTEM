import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

const ERRORS: Record<string, { status: HttpStatus; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Ya existe un registro con ese valor único' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Referencia a un registro relacionado inexistente' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Registro no encontrado' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const mapped = ERRORS[exception.code];
    if (!mapped) return super.catch(exception, host);

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(mapped.status)
      .json({ statusCode: mapped.status, message: mapped.message, error: exception.code });
  }
}
