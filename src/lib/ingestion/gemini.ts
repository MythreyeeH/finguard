import { GoogleGenAI } from "@google/genai";
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
 */
export async function parseUnstructuredTextWithGemini(text: string): Promise<ValidatedObligation> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not defined in .env.local");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let rawText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: buildPrompt(text),
    });
    rawText = (response.text ?? '').replace(/```json|```/g, '').trim();
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
 * Passes receipt images (Base64) to Gemini Vision for OCR and extraction.
 */
export async function parseImageWithGemini(base64Image: string, mimeType: string): Promise<ValidatedObligation> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not defined in .env.local");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const rawBase64 = base64Image.replace(/^data:[^;]+;base64,/, '');

  let rawText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        { text: buildPrompt('the attached image/receipt') },
        { inlineData: { data: rawBase64, mimeType: mimeType || 'image/jpeg' } }
      ],
    });
    rawText = (response.text ?? '').replace(/```json|```/g, '').trim();
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

const buildCSVPrompt = (csvText: string) =>
  `Extract structured financial data from this CSV. Return ONLY a raw JSON array of objects, no markdown fences, no explanation.

JSON array schema:
[
  {
    "amount": number,
    "date": "YYYY-MM-DD",
    "due_date": "YYYY-MM-DD",
    "type": "payable" or "receivable",
    "counterparty": "vendor or person name",
    "deferrable": true
  }
]

Rules:
- "received", "credited", "income", "deposit" → receivable
- "paid", "debited", "expense", "bill", "withdrawal" → payable
- If date is missing, use: ${new Date().toISOString().split('T')[0]}
- Discard header rows or non-transaction rows.
- Return NOTHING except the JSON array.

CSV text:
${csvText}`;

/**
 * Passes raw CSV text into Gemini for smart bulk extraction of transactions.
 */
export async function parseCSVWithGemini(csvText: string): Promise<ValidatedObligation[]> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not defined in .env.local");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let rawText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: buildCSVPrompt(csvText),
    });
    rawText = (response.text ?? '').replace(/```json|```/g, '').trim();
  } catch (apiError: any) {
    throw new Error(`Gemini API call failed: ${apiError?.message ?? apiError}`);
  }

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed)) {
      // Sometimes Gemini wraps it in an object like {"transactions": [...]}
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        parsed = parsed.transactions;
      } else {
        throw new Error("Result is not a JSON array.");
      }
    }
  } catch {
    throw new Error(`Gemini returned invalid JSON for CSV: "${rawText.substring(0, 120)}"`);
  }

  return parsed.map((item: any) => normalizeAndValidate(item, 'csv'));
}
