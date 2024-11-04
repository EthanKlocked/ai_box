import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { ConfigService } from '@nestjs/config';
import { ImageStyle, ImageSize } from '@src/ai/dto/image-generation.dto';

interface ImageGenerationResult {
	imageUrl: string | null;
	isGenerated: boolean;
}

interface GenerationOptions {
	style?: ImageStyle;
	size?: ImageSize;
}

@Injectable()
export class ImageGenerationService {
	private model: ChatOpenAI;
	private chain: LLMChain;
	private openai: OpenAI;

	constructor(private configService: ConfigService) {
		const apiKey = this.configService.get<string>('OPENAI_API_KEY');
		if (!apiKey)
			throw new Error(
				'OPENAI_API_KEY is not defined in the environment variables',
			);

		this.openai = new OpenAI({ apiKey });

		this.model = new ChatOpenAI({
			openAIApiKey: apiKey,
			modelName: 'gpt-4',
			temperature: 0.2,
		});

		const prompt = PromptTemplate.fromTemplate(`
            Create a concise image prompt based on the following diary entry. 
            Focus on the main scene, mood, or central image that best represents the text.

            Guidelines:
            1. Keep the description simple and clear
            2. Focus on one main visual element
            3. Include style (e.g., minimalist illustration, simple sketch, flat design)
            4. Specify "simple" or "minimal" in the description
            5. Avoid complex scenes or multiple elements
            6. Maximum 50 words

            Return ONLY the image generation prompt, without any additional text or formatting.

            Diary entry: {input_text}
        `);

		this.chain = new LLMChain({ llm: this.model, prompt });
	}

	async generateImage(
		text: string,
		options: GenerationOptions = {},
	): Promise<ImageGenerationResult> {
		try {
			if (!text || text.trim() === '') {
				return this.createFailedResult();
			}

			const result = await this.chain.call({ input_text: text });
			const imagePrompt = result.text.trim();

			const image = await this.openai.images.generate({
				model: 'dall-e-3',
				prompt: imagePrompt,
				n: 1,
				size: '1024x1024',
				quality: 'standard',
				style: 'natural',
			});

			return {
				imageUrl: image.data[0].url,
				isGenerated: true,
			};
		} catch (error) {
			Logger.error(
				`Failed to generate image: ${error.message}`,
				'ImageGenerationService',
			);
			return this.createFailedResult();
		}
	}

	private createFailedResult(): ImageGenerationResult {
		return {
			imageUrl: null,
			isGenerated: false,
		};
	}
}
