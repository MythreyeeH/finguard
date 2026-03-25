import { GoogleGenerativeAI } from "@google/generative-ai";
import { ValidatedObligation, normalizeAndValidate } from './normalizer';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const buildPrompt = (input: string) =>
  `Extract structured financial data from this text. Return ONLY a raw JSON object, no markdown fences, no explanation.

JSON schema:
{
  "amount": number,
  "date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "type": "payable" or "receivable",
  "counterparty": "vendor or person name",
  "deferrable": true
}

Rules:
- "received", "credited", "income" → receivable
- "paid", "debited", "expense", "bill" → payable
- If date is missing, use: ${new Date().toISOString().split('T')[0]}
- Return NOTHING except the JSON object.

Input text: "${input}"`;

/**
 * Passes unstructured manual text into Gemini for JSON extraction.
 * Throws if Gemini call fails or returns unparseable data (error propagates to UI).
 */
export async function parseUnstructuredTextWithGemini(text: string): Promise<ValidatedObligation> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not defined in .env.local");

  const ai = new GoogleGenerativeAI(API_KEY);

  let rawText = '';
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(buildPrompt(text));
    const response = await result.response;
    rawText = response.text().replace(/```json|```/g, '').trim();
  } catch (apiError: any) {
    throw new Error(`Gemini API call failed: ${apiError?.message ?? apiError}`);
  }

  if (!rawText) {
    throw new Error("Gemini returned an empty response. Check your API key and quota.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(`Gemini returned non-JSON text: "${rawText.substring(0, 120)}"`);
  }

  return normalizeAndValidate(parsed, 'manual');
}

/**
 * Passes receipt images (Base64) to Gemini for OCR and extraction.
 * Throws on failure.
 */
export async function parseImageWithGemini(base64Image: string, mimeType: string): Promise<ValidatedObligation> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not defined in .env.local");

  const ai = new GoogleGenerativeAI(API_KEY);

  const rawBase64 = base64Image.replace(/^data:[^;]+;base64,/, '');

  let rawText = '';
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      buildPrompt('the attached image/receipt'),
      { inlineData: { data: rawBase64, mimeType: mimeType || 'image/jpeg' } }
    ]);
    const response = await result.response;
    rawText = response.text().replace(/```json|```/g, '').trim();
  } catch (apiError: any) {
    throw new Error(`Gemini Vision API call failed: ${apiError?.message ?? apiError}`);
  }

  if (!rawText) throw new Error("Gemini Vision returned empty response.");

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(`Gemini Vision returned non-JSON: "${rawText.substring(0, 120)}"`);
  }

  return normalizeAndValidate(parsed, 'image');
}
