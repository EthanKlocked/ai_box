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
			modelName: 'gpt-4o-mini',
			temperature: 0.2,
		});

		const prompt = PromptTemplate.fromTemplate(`
            Analyze the following diary entry. Focus on the quality and clarity of the content, regardless of its length. If the content is unclear, incoherent, or lacks meaningful information, assign a low confidence score.

            Provide the following information in English:
            1. Main category (Choose one: Work, Personal, Family, Health, Relationships, Education, Hobbies, Travel, Finance, Spirituality)
            2. Subcategories (List up to 3 specific subcategories related to the main category, separated by commas)
            3. Primary emotion expressed (if clearly evident from the text)
            4. Secondary emotion (Another emotion present in the entry, or "None" if not applicable)
            5. Up to five key words or phrases in English (translate if necessary)
            6. Overall tone of the entry (e.g., positive, negative, neutral, reflective, humorous, serious)
            7. Time focus (past, present, future, or a combination)
            8. Confidence score (0-100, based on the clarity and meaningfulness of the content. Use lower scores for vague or unclear entries)

            Format the output as a JSON object with keys: category, subcategories (as an array), primaryEmotion, secondaryEmotion, keywords (as an array), tone, timeFocus, and confidenceScore.

            IMPORTANT: Return ONLY the JSON object, without any additional text, markdown formatting, or code blocks. Ensure all fields, including keywords, are in English.

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
			parsedResult.subcategories = Array.isArray(
				parsedResult.subcategories,
			)
				? parsedResult.subcategories
				: parsedResult.subcategories.split(',').map((s) => s.trim());
			parsedResult.keywords = Array.isArray(parsedResult.keywords)
				? parsedResult.keywords
				: parsedResult.keywords.split(',').map((s) => s.trim());

			// Validate and adjust the result
			return this.validateAndAdjustResult(parsedResult);
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
		};
	}
}
