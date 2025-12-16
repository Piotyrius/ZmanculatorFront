import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./apiClient";

export type DraftingSchool = {
  id: number;
  name: string;
  version: string;
  config: Record<string, unknown>;
  is_active: boolean;
};

export type BlockConfig = {
  id: number;
  name: string;
  version: string;
  config: Record<string, unknown>;
};

export type EaseProfile = {
  id: number;
  name: string;
  version: string;
  config: Record<string, unknown>;
};

export type SizeProfile = {
  id: number;
  name: string;
  version: string;
  config: Record<string, unknown>;
};

export type TransformPipeline = {
  id: number;
  name: string;
  version: string;
  config: Record<string, unknown>;
};

export async function listDraftingSchools(
  activeOnly = true
): Promise<DraftingSchool[]> {
  return apiFetch<DraftingSchool[]>(
    `/configs/drafting-schools?active_only=${activeOnly}`
  );
}

export async function listBlocks(): Promise<BlockConfig[]> {
  return apiFetch<BlockConfig[]>("/configs/blocks");
}

export async function listEaseProfiles(): Promise<EaseProfile[]> {
  return apiFetch<EaseProfile[]>("/configs/ease-profiles");
}

export async function listSizeProfiles(): Promise<SizeProfile[]> {
  return apiFetch<SizeProfile[]>("/configs/size-profiles");
}

export async function listTransformPipelines(): Promise<TransformPipeline[]> {
  return apiFetch<TransformPipeline[]>("/configs/transform-pipelines");
}

// React Query hooks
export function useDraftingSchools(activeOnly = true) {
  return useQuery({
    queryKey: ["drafting-schools", activeOnly],
    queryFn: () => listDraftingSchools(activeOnly),
  });
}

export function useBlocks() {
  return useQuery({
    queryKey: ["blocks"],
    queryFn: () => listBlocks(),
  });
}

export function useEaseProfiles() {
  return useQuery({
    queryKey: ["ease-profiles"],
    queryFn: () => listEaseProfiles(),
  });
}

export function useSizeProfiles() {
  return useQuery({
    queryKey: ["size-profiles"],
    queryFn: () => listSizeProfiles(),
  });
}

export function useTransformPipelines() {
  return useQuery({
    queryKey: ["transform-pipelines"],
    queryFn: () => listTransformPipelines(),
  });
}

