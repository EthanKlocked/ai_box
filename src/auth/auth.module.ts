import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@src/config/jwt.config';
import { JwtStrategy } from '@src/auth/strategy/jwt.strategy';


@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync(jwtConfig)
    ],
    providers: [JwtStrategy],
})


export class AuthModule {}