import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '@src/auth/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService
	){
		super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
					const apiKey = request.headers['x-ai-api-key'];
                    const token = apiKey;
                    return token;
                },
            ]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_SECRET"),
		});
	}
	
	async validate(payload: Payload) {
		return { id: payload.id, email: payload.email };
	}
}