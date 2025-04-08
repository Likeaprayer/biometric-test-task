import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';


@InputType()
export class CreateAuthInput {
    @Field()
    @IsEmail()
    email: string;
  
    @Field()
    @MinLength(7)
    password: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(7)
  password: string;
}


@InputType()
export class BiometricLoginInput {
  @Field()
  @IsNotEmpty()
  biometricKey: string;
}
