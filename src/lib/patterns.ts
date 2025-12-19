import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./apiClient";
import { API_BASE_URL } from "./config";
import { getAccessToken } from "./auth/tokenStore";

export type PatternGenerationRequest = {
  project_id: number;
  garment_type: string;
  fit: string;
  category: string;
  measurements: {
    values: Record<string, number>;
    unit: string;
  };
  drafting_school_id: string;
  drafting_school_version: string;
  block_id: string;
  block_version: string;
  rule_graph_id: string;
  rule_graph_version: string;
  size_profile_id?: string;
  ease_profile_id?: string;
  transform_pipeline_ids?: string[];
  debug?: boolean;
};

export type PatternGenerationResponse = {
  pattern_id: number;
  status: string;
  result_id: number;
};

export type PatternResult = {
  id: number;
  pattern_id: number;
  geometry: Record<string, unknown> | null;
  exports: {
    svg?: {
      mime_type: string;
      content: string;
      metadata: Record<string, unknown>;
    };
    [key: string]: unknown;
  };
};

export async function generatePattern(
  request: PatternGenerationRequest,
): Promise<PatternGenerationResponse> {
  return apiFetch<PatternGenerationResponse>("/patterns/generate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getPatternResult(
  patternId: number,
): Promise<PatternResult> {
  return apiFetch<PatternResult>(`/patterns/${patternId}/result`);
}

export async function exportPatternFile(
  patternId: number,
  format: string,
): Promise<Blob> {
  const token = getAccessToken();
  const url = `${API_BASE_URL}/patterns/${patternId}/export?format=${format}`;
  const response = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Export failed");
  }
  return response.blob();
}

// React Query hooks
export function usePatternResult(patternId: number | null) {
  return useQuery({
    queryKey: ["pattern-result", patternId],
    queryFn: () => (patternId ? getPatternResult(patternId) : null),
    enabled: !!patternId,
  });
}

export function useGeneratePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generatePattern,
    onSuccess: (data) => {
      // Invalidate pattern result
      queryClient.invalidateQueries({
        queryKey: ["pattern-result", data.pattern_id],
      });
      // Invalidate project patterns list so history updates
      queryClient.invalidateQueries({
        queryKey: ["project-patterns"],
      });
      // Also invalidate projects list in case it shows pattern counts
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

export function usePatternGeneration() {
  // Semantic alias for useGeneratePattern to match the plan terminology.
  return useGeneratePattern();
}
