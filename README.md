# NestJS AI Text Analysis Service

This project is a NestJS-based AI service that analyzes text content, particularly diary entries, using OpenAI's GPT models. It categorizes the text, extracts emotions, keywords, and other metadata to provide insightful analysis of the input text.

## Features

- Text analysis using OpenAI's GPT models
- Categorization of text into main and subcategories
- Emotion extraction (primary and secondary)
- Keyword identification
- Tone analysis
- Time focus determination
- Confidence scoring

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/nestjs-ai-text-analysis.git
   cd nestjs-ai-text-analysis
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the server:
   ```
   npm run start
   ```

2. The API will be available at `http://localhost:3000` (or the port you've configured).

3. To analyze text, send a POST request to `/ai/analyze_text` with the following body:
   ```json
   {
     "text": "Your diary entry or text to analyze here"
   }
   ```

4. The service will return a JSON response with the analysis results.

## API Endpoints

- `POST /ai/analyze_text`: Analyzes the provided text and returns the analysis results.

## Configuration

- The OpenAI model and parameters can be configured in the `TextAnalysisService` class.
- Authentication guards (`ApiGuard` and `JwtAuthGuard`) can be enabled/disabled in the `AiController`.

## Security

- The project uses guards for API authentication.
- Ensure to keep your OpenAI API key confidential and use environment variables for sensitive information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- This project uses [NestJS](https://nestjs.com/)
- AI capabilities powered by [OpenAI](https://openai.com/)
- Langchain for LLM integration