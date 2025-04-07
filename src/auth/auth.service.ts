import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { BiometricLoginInput } from './dto/biometric-login.input';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from './entities/auth-response.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const { email, password } = registerInput;
    
    // Check if the user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Create a new user
    const user = await this.usersService.create(email, password);
    
    // Generate JWT token
    const token = this.jwtService.sign({ id: user.id, email: user.email });
    
    return {
      token,
      user,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    
    // Find the user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate JWT token
    const token = this.jwtService.sign({ id: user.id, email: user.email });
    
    return {
      token,
      user,
    };
  }

  async biometricLogin(biometricLoginInput: BiometricLoginInput): Promise<AuthResponse> {
    const { biometricKey } = biometricLoginInput;
    
    // Find the user by biometric key
    const user = await this.usersService.findByBiometricKey(biometricKey);
    if (!user) {
      throw new UnauthorizedException('Invalid biometric key');
    }
    
    // Generate JWT token
    const token = this.jwtService.sign({ id: user.id, email: user.email });

    delete user.password
    
    return {
      token,
      user,
    };
  }

  async addBiometricKey(userId: string, biometricKey: string): Promise<AuthResponse> {
    // Check if biometric key is already in use
    const existingUserWithKey = await this.usersService.findByBiometricKey(biometricKey);
    if (existingUserWithKey) {
      throw new ConflictException('Biometric key already in use');
    }
    
    // Update user with biometric key
    const user = await this.usersService.updateBiometricKey(userId, biometricKey);
    
    // Generate JWT token
    const token = this.jwtService.sign({ id: user.id, email: user.email });

    delete user.password
    
    return {
      token,
      user,
    };
  }
}