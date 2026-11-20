import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../../generated/prisma/enums';

export class UserDto {
  id: string;
  email: string;
  name: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;
}
