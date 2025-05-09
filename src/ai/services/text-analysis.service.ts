import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { ConfigService } from '@nestjs/config';
import { AnalysisResult } from '@src/ai/ai.interface';

@Injectable()
export class TextAnalysisService {
	private model: ChatOpenAI;
	private chain: LLMChain;

	constructor(private configService: ConfigService) {
		const apiKey = this.configService.get<string>('OPENAI_API_KEY');
		if (!apiKey)
			throw new Error(
				'OPENAI_API_KEY is not defined in the environment variables',
			);

		this.model = new ChatOpenAI({
			openAIApiKey: apiKey,
			//modelName: 'gpt-4o-mini',
			modelName: 'gpt-4.1-nano',
			temperature: 0.2,
		});

		const prompt = PromptTemplate.fromTemplate(`
			First, check the following diary entry for inappropriate content:
			1. Profanity and curse words
			2. Explicit sexual content or sexual slurs
			3. Discriminatory slurs

			Masking rules:
			- Replace only explicit inappropriate words with 🐾🐾🐾 (use the same number of 🐾 as original text length)
			- Keep all other content intact, including negative expressions
			- Preserve the original context and emotion

			Analyze the diary entry and provide the following in a JSON response with two sections:

			1. Content Moderation:
			- inappropriateContent: Array of objects containing:
				- originalText: the inappropriate text found
				- category: type of inappropriate content
				- maskedText: text with 🐾🐾🐾 replacing the inappropriate parts
			- maskedContent: Full text with all inappropriate parts masked (if any found)
			- hasInappropriateContent: boolean

			2. Content Analysis:
			- category: Main category (Choose one: Work, Personal, Family, Health, Relationships, Education, Hobbies, Travel, Finance, Spirituality)
			- subcategories: Array of up to 3 specific subcategories related to the main category
			- primaryEmotion: Primary emotion expressed
			- secondaryEmotion: Secondary emotion or "None"
			- keywords: Array of up to 5 key phrases in English (translate if necessary)
			- tone: Overall tone (e.g., positive, negative, neutral, reflective, humorous, serious)
			- timeFocus: Time focus (past, present, future, or combination)
			- confidenceScore: 0-100 based on clarity and meaningfulness

			IMPORTANT: Return ONLY the JSON object with "Content Moderation" and "Content Analysis" sections. Ensure all fields are in English.

			Diary entry: {input_text}
        `);

		this.chain = new LLMChain({ llm: this.model, prompt });
	}

	async analyzeText(text: string): Promise<AnalysisResult> {
		try {
			if (!text || text.trim() === '') {
				return this.createInsufficientDataResult('Empty input');
			}

			const result = await this.chain.call({ input_text: text });
			const cleanedResult = this.cleanOutput(result.text);
			const parsedResult = JSON.parse(cleanedResult);

			// Ensure subcategories and keywords are arrays
			/*
			parsedResult.subcategories = Array.isArray(
				parsedResult.subcategories,
			)
				? parsedResult.subcategories
				: parsedResult.subcategories.split(',').map((s) => s.trim());
			parsedResult.keywords = Array.isArray(parsedResult.keywords)
				? parsedResult.keywords
				: parsedResult.keywords.split(',').map((s) => s.trim());
			*/
			const analysisData = parsedResult['Content Analysis'];
			const moderationData = parsedResult['Content Moderation'];

			const processedResult = {
				...analysisData,
				...moderationData,
				subcategories: Array.isArray(analysisData.subcategories)
					? analysisData.subcategories
					: analysisData.subcategories
							?.split(',')
							?.map((s: string) => s.trim()) || [],
				keywords: Array.isArray(analysisData.keywords)
					? analysisData.keywords
					: analysisData.keywords
							?.split(',')
							?.map((s: string) => s.trim()) || [],
			};

			return this.validateAndAdjustResult(processedResult);
		} catch (error) {
			Logger.error(
				`Failed to analyze text: ${error.message}`,
				'TextAnalysisService',
			);
			return this.createInsufficientDataResult('Analysis error');
		}
	}

	private cleanOutput(output: string): string {
		output = output.replace(/```json\n?|\n?```/g, '');
		output = output.trim();
		if (!output.startsWith('{')) {
			const match = output.match(/\{[\s\S]*\}/);
			if (match) {
				output = match[0];
			} else {
				throw new Error('Unable to extract JSON from the output');
			}
		}
		return output;
	}

	private validateAndAdjustResult(result: any): AnalysisResult {
		const confidenceScore = Number(result.confidenceScore);

		if (
			isNaN(confidenceScore) ||
			confidenceScore < 0 ||
			confidenceScore > 100
		) {
			return this.createInsufficientDataResult(
				'Invalid confidence score',
			);
		}

		if (confidenceScore <= 50) {
			return this.createInsufficientDataResult(
				'Low confidence in analysis',
			);
		}

		return {
			category: result.category,
			subcategories: result.subcategories,
			primaryEmotion: result.primaryEmotion,
			secondaryEmotion: result.secondaryEmotion,
			keywords: result.keywords,
			tone: result.tone,
			timeFocus: result.timeFocus,
			confidenceScore: confidenceScore,
			isAnalyzed: true,
			hasInappropriateContent: result.hasInappropriateContent || false,
			// optional for violent filter
			...(result.hasInappropriateContent && {
				maskedContent: result.maskedContent,
				inappropriateContent: result.inappropriateContent,
			}),
		};
	}

	private createInsufficientDataResult(reason: string): AnalysisResult {
		console.log(reason);
		return {
			category: null,
			subcategories: [],
			primaryEmotion: null,
			secondaryEmotion: null,
			keywords: [],
			tone: null,
			timeFocus: null,
			confidenceScore: 0,
			isAnalyzed: false,
			hasInappropriateContent: false,
		};
	}
}
