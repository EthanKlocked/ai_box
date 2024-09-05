import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { AiModule } from '@src/ai/ai.module';
import { AuthModule } from '@src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		/********* CONFIG SETTING *********/
		ConfigModule.forRoot({
			cache:true,
			isGlobal:true,
			envFilePath: `.env.${process.env.NODE_ENV}`,
		}),    
		/********* CUSTOM MODULES *********/
		AiModule, 
		AuthModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
