import { IsNotEmpty, IsString } from 'class-validator';

export class TextAnalysisDto {
	@IsNotEmpty()
	@IsString()
	text: string;
}