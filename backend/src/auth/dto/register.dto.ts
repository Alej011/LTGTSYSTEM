import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'SUPPORT',
    description: 'Rol del usuario',
    enum: ['ADMIN', 'SUPPORT']
  })
  @IsIn(['ADMIN', 'SUPPORT'])
  role: 'ADMIN' | 'SUPPORT';
}
