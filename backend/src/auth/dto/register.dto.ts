import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() name: string;
  @IsIn(['ADMIN', 'SUPPORT']) role: 'ADMIN' | 'SUPPORT';
}
