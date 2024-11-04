import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum ImageStyle {
	NATURAL = 'natural',
	VIVID = 'vivid',
}

export enum ImageSize {
	MEDIUM = '1024x1024',
}

export class ImageGenerationDto {
	@IsNotEmpty()
	@IsString()
	text: string;

	@IsOptional()
	@IsEnum(ImageStyle)
	style?: ImageStyle = ImageStyle.NATURAL;

	@IsOptional()
	@IsEnum(ImageSize)
	size?: ImageSize = ImageSize.MEDIUM;
}
