import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';


@Injectable()
export class ApiGuard implements CanActivate {
    constructor(private readonly configService: ConfigService){}
    
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        if (authorization) {
            const [scheme, token] = authorization.split(" ");
            return scheme.toLowerCase() === "bearer" && token === this.configService.get<string>("API_SECRET");
        }
        throw new BadRequestException("Request without API KEY");
    }
}