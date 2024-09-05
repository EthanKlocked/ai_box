import { Module } from '@nestjs/common';
import { AiController } from '@src/ai/ai.controller';
import { TextGenerationService } from '@src/ai/services/text-generation.service';
import { ImageGenerationService } from '@src/ai/services/image-generation.service';
import { TextAnalysisService } from '@src/ai/services/text-analysis.service';

@Module({
	controllers: [AiController],
	providers: [
		TextGenerationService,
		ImageGenerationService,
		TextAnalysisService,
	],
})
export class AiModule {}
