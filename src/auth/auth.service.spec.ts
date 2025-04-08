import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import * as bcrypt from 'bcrypt';

// Mock data and services
const mockUser = {
  id: 'user-id',
  email: 'test@example.com',
  password: 'hashedPassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
  findByBiometricKey: jest.fn(),
  create: jest.fn(),
  updateBiometricKey: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        JwtStrategy,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);

    // Mock bcrypt compare function
    jest.spyOn(bcrypt, 'compare').mockImplementation(async (password, hash) => {
      return password === 'correctPassword';
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if user with email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should create a new user and return token if email is available', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user with email does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@example.com', password: 'anyPassword' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user if credentials are correct', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'correctPassword',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('biometricLogin', () => {
    it('should throw UnauthorizedException if biometric key is invalid', async () => {
      mockUsersService.findByBiometricKey.mockResolvedValue(null);

      await expect(
        authService.biometricLogin({ biometricKey: 'invalid-key' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findByBiometricKey).toHaveBeenCalledWith('invalid-key');
    });

    it('should return token and user if biometric key is valid', async () => {
      const userWithBiometric = { ...mockUser, biometricKey: 'valid-biometric-key' };
      mockUsersService.findByBiometricKey.mockResolvedValue(userWithBiometric);

      const result = await authService.biometricLogin({
        biometricKey: 'valid-biometric-key',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(userWithBiometric);
    });
  });

  describe('addBiometricKey', () => {
    it('should throw ConflictException if biometric key is already in use', async () => {
      mockUsersService.findByBiometricKey.mockResolvedValue(mockUser);

      await expect(
        authService.addBiometricKey('user-id', 'existing-biometric-key'),
      ).rejects.toThrow(ConflictException);
      expect(mockUsersService.findByBiometricKey).toHaveBeenCalledWith('existing-biometric-key');
    });

    it('should update user with biometric key and return token', async () => {
      mockUsersService.findByBiometricKey.mockResolvedValue(null);
      const updatedUser = { ...mockUser, biometricKey: 'new-biometric-key' };
      mockUsersService.updateBiometricKey.mockResolvedValue(updatedUser);

      const result = await authService.addBiometricKey('user-id', 'new-biometric-key');

      expect(mockUsersService.updateBiometricKey).toHaveBeenCalledWith('user-id', 'new-biometric-key');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual(updatedUser);
    });
  });
});