import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CreateAuthInput,  LoginInput } from './dto/create-auth.input';

import { BiometricLoginInput } from './dto/create-auth.input'
import { AuthResponse } from './entities/auth.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: CreateAuthInput): Promise<AuthResponse> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async biometricLogin(
    @Args('biometricLoginInput') biometricLoginInput: BiometricLoginInput,
  ): Promise<AuthResponse> {
    return this.authService.biometricLogin(biometricLoginInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => AuthResponse)
  async addBiometricKey(
    @CurrentUser() user: any,
    @Args('biometricKey') biometricKey: string,
  ): Promise<AuthResponse> {
    return this.authService.addBiometricKey(user.id, biometricKey);
  }
}