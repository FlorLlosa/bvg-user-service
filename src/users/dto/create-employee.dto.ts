import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastname!: string;

  @IsEmail()
  email!: string;

  // 2 = Empleado, 3 = Encargado
  @IsInt()
  @IsIn([2, 3])
  roleId!: number;

  // ID del sector administrado por bvg-task-service
  @IsInt()
  @IsPositive()
  sectorId!: number;
}
