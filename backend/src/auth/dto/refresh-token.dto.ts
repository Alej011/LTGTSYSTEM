import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token recibido en el login o en el último refresh' })
  @IsString()
  @Length(43, 43)
  refreshToken!: string;
}
