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
}