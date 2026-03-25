import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNegotiations,
  generateAndSaveNegotiation,
  updateNegotiationStatus,
  logNegotiationResponse,
  regenerateMessage,
  subscribeToNegotiations,
} from '@/lib/negotiation/service';
import { Negotiation, Channel, NegotiationResponse } from '@/lib/negotiation/types';

// ─── Fetch All Negotiations ──────────────────────────────────────────────────

export function useNegotiations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['negotiations'],
    queryFn: fetchNegotiations,
    staleTime: 30_000,
  });

  // Real-time Supabase subscription
  useEffect(() => {
    const unsub = subscribeToNegotiations((updated) => {
      queryClient.setQueryData(['negotiations'], updated);
    });
    return unsub;
  }, [queryClient]);

  return query;
}

// ─── Generate Negotiation Mutation ───────────────────────────────────────────

export function useGenerateNegotiation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      obligation_id,
      tone,
      channel,
    }: {
      obligation_id: string;
      tone: number;
      channel: Channel;
    }) => generateAndSaveNegotiation(obligation_id, tone, channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

// ─── Update Status Mutation ───────────────────────────────────────────────────

export function useUpdateNegotiationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Negotiation['status'] }) =>
      updateNegotiationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

// ─── Log Response Mutation ────────────────────────────────────────────────────

export function useLogResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      negotiation_id,
      response_text,
      outcome,
    }: {
      negotiation_id: string;
      response_text: string;
      outcome: NegotiationResponse['outcome'];
    }) => logNegotiationResponse(negotiation_id, response_text, outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

// ─── Regenerate Message ────────────────────────────────────────────────────────

export function useRegenerateMessage() {
  return useMutation({
    mutationFn: ({
      negotiation_id,
      tone,
      channel,
    }: {
      negotiation_id: string;
      tone: number;
      channel: Channel;
    }) => regenerateMessage(negotiation_id, tone, channel),
  });
}
