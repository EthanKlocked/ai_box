import { UnauthorizedException, GoneException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';


export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(err, user, info) {
		if (err || !user) {
			if (info instanceof TokenExpiredError) {
				throw new GoneException('Token has expired');
			} else if (info instanceof JsonWebTokenError) {
				throw new UnauthorizedException('Invalid token');
			} else {
				throw new UnauthorizedException('Unauthorized');
			}
		}
		return user;
	}	
}