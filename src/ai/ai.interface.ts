export interface AnalysisResult {
	category: string | null;
	subcategories: string[];
	primaryEmotion: string | null;
	secondaryEmotion: string | null;
	keywords: string[];
	tone: string | null;
	timeFocus: string | null;
	confidenceScore: number;
	isAnalyzed: boolean;
	hasInappropriateContent: boolean;
	maskedContent?: string;
	inappropriateContent?: Array<{
		originalText: string;
		category: string;
		maskedText: string;
	}>;
}
