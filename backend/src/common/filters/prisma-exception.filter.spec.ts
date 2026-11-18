import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Prisma } from '../../generated/prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('error', { code, clientVersion: 'test' });
}

function httpHost() {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response);
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  it.each([
    ['P2002', HttpStatus.CONFLICT],
    ['P2003', HttpStatus.BAD_REQUEST],
    ['P2025', HttpStatus.NOT_FOUND],
  ])('maps %s to HTTP %i', (code, status) => {
    const { host, response } = httpHost();

    filter.catch(prismaError(code), host);

    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: status, error: code }));
  });

  it('delegates unknown codes to the default Nest handler', () => {
    const fallback = jest.spyOn(BaseExceptionFilter.prototype, 'catch').mockImplementation(() => undefined);
    const { host, response } = httpHost();
    const error = prismaError('P9999');

    filter.catch(error, host);

    expect(fallback).toHaveBeenCalledWith(error, host);
    expect(response.status).not.toHaveBeenCalled();
    fallback.mockRestore();
  });
});
