import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      // inject: [ConfigService],
      // secret: ConfigService.get<string>('JWT_SECRET'),
      // useFactory: (configService: ConfigService) => ({
        
      //   signOptions: { expiresIn: '1d' },
      // }),

      useFactory: ()=>({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '2hr' },
      })
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}