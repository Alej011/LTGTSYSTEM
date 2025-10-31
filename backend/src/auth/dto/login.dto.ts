import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@ltgt.local',
    description: 'Email del usuario'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin123!',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;
}
