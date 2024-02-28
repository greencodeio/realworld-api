import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
