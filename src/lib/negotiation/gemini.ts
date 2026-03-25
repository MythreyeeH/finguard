import { GoogleGenAI } from '@google/genai';
import { ObligationRow, StrategyType } from './types';
import { STRATEGY_LABELS, STRATEGY_DAYS } from './strategy';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const TONE_DESCRIPTIONS = [
  'Firm and formal, using professional business language',
  'Balanced and warm, maintaining a professional yet friendly tone',
  'Casual and partner-like, written as a trusted colleague',
];

function buildNegotiationPrompt(
  obligation: ObligationRow,
  strategy: StrategyType,
  tone: number,
  channel: 'email' | 'sms' | 'call'
): string {
  const toneLevel = tone < 33 ? 0 : tone < 66 ? 1 : 2;
  const toneDesc = TONE_DESCRIPTIONS[toneLevel];
  const extensionDays = STRATEGY_DAYS[strategy];
  const strategyLabel = STRATEGY_LABELS[strategy];
  const repayDate = new Date(obligation.due_date);
  repayDate.setDate(repayDate.getDate() + extensionDays);
  const repayDateStr = repayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(obligation.amount);

  const channelInstructions: Record<string, string> = {
    email: 'Write a complete professional email with greeting, body, and signature.',
    sms: 'Write a concise SMS (max 160 characters). Friendly, direct, to the point.',
    call: 'Write a brief call script with opening, key talking points, and closing.',
  };

  return `Generate a professional financial negotiation message. Return PLAIN TEXT ONLY — no markdown, no JSON.

Channel: ${channel.toUpperCase()}
${channelInstructions[channel]}

Context:
- Counterparty: ${obligation.counterparty}
- Amount: ${formattedAmount}
- Strategy Type: ${strategyLabel}
- Extension Requested: ${extensionDays} days
- Proposed Repayment Date: ${repayDateStr}
- Tone: ${toneDesc}
- Notes: ${obligation.notes || 'Standard vendor relationship'}

Constraints:
- Be polite and credible
- Maintain the business relationship
- Reference the exact repayment date (${repayDateStr})
- Do not use placeholder text like [Name] or [Company]
- Sign the message as: Alex Chen | CFO, Finguard Inc.

Return ONLY the message content. No preamble, no explanation.`;
}

/**
 * Calls Gemini via @google/genai (v1 API) to generate a negotiation message.
 */
export async function generateNegotiationMessage(
  obligation: ObligationRow,
  strategy: StrategyType,
  tone: number,
  channel: 'email' | 'sms' | 'call' = 'email'
): Promise<string> {
  if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not configured in .env.local');

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = buildNegotiationPrompt(obligation, strategy, tone, channel);

  let rawText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });
    rawText = (response.text ?? '').replace(/```[\w]*\n?|```/g, '').trim();
  } catch (err: any) {
    throw new Error(`Gemini API error: ${err?.message ?? err}`);
  }

  if (!rawText) throw new Error('Gemini returned an empty response.');
  return rawText;
}
