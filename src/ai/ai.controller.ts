import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TextAnalysisService } from '@src/ai/services/text-analysis.service';
import { TextAnalysisDto } from '@src/ai/dto/text-analysis.dto';
import { JwtAuthGuard } from '@src/auth/guard/jwt.guard';
import { ApiGuard } from '@src/auth/guard/api.guard';


@Controller('ai')
@UseGuards(ApiGuard)
//@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly textAnalysisService: TextAnalysisService) {}

    @Post('analyze_text')
    async analyzeText(@Body() body: TextAnalysisDto) {
        const analysis = await this.textAnalysisService.analyzeText(body.text);
        return analysis;
    }
}