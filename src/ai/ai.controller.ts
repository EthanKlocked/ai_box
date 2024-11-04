import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TextAnalysisService } from '@src/ai/services/text-analysis.service';
import { ImageGenerationService } from './services/image-generation.service';
import { TextAnalysisDto } from '@src/ai/dto/text-analysis.dto';
import { ImageGenerationDto } from '@src/ai/dto/image-generation.dto';
import { ApiGuard } from '@src/auth/guard/api.guard';

@Controller('ai')
@UseGuards(ApiGuard)
//@UseGuards(JwtAuthGuard)
export class AiController {
	constructor(
		private readonly textAnalysisService: TextAnalysisService,
		private readonly imageGenerationService: ImageGenerationService,
	) {}

	@Post('analyze_text')
	async analyzeText(@Body() body: TextAnalysisDto) {
		const analysis = await this.textAnalysisService.analyzeText(body.text);
		return analysis;
	}

	@Post('generate_image')
	async generateImage(@Body() body: ImageGenerationDto) {
		const result = await this.imageGenerationService.generateImage(
			body.text,
			{ style: body.style, size: body.size },
		);
		return {
			success: result.isGenerated,
			imageUrl: result.imageUrl,
		};
	}
}
