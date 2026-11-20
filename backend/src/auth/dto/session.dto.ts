import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '../../users/dto/user.dto';

export class SessionTokensDto {
  accessToken: string;

  @ApiProperty({ format: 'date-time' })
  accessTokenExpiresAt: string;

  /** Ausente cuando el refresh se reintenta dentro de la ventana de gracia */
  refreshToken?: string;

  @ApiProperty({ format: 'date-time', required: false })
  refreshTokenExpiresAt?: string;

  user: UserDto;
}

export class CurrentUserDto extends UserDto {
  createdAt: Date;
}
