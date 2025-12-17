import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./apiClient";

export type Project = {
  id: number;
  name: string;
  status: string;
  created_at?: string;
  image_url?: string;
  category?: string;
};

export type MeasurementProfile = {
  id: number;
  name: string;
  category: string;
  unit: string;
  values: Record<string, number>;
};

export type ProjectPatternSummary = {
  id: number;
  project_id: number;
  status: string;
  version_index: number;
  tag: string | null;
  config: Record<string, unknown>;
  created_at: string | null;
  has_result: boolean;
};

export type PatternDiffEntry = {
  path: string;
  type: "added" | "removed" | "changed";
  old_value: unknown;
  new_value: unknown;
};

export type PatternDiffResponse = {
  pattern1_id: number;
  pattern1_version: number;
  pattern2_id: number;
  pattern2_version: number;
  differences: PatternDiffEntry[];
  summary: {
    total_changes: number;
    added: number;
    removed: number;
    changed: number;
  };
};

export async function createProject(name: string): Promise<Project> {
  return apiFetch<Project>("/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects");
}

export async function listProjectPatterns(
  projectId: number,
): Promise<ProjectPatternSummary[]> {
  return apiFetch<ProjectPatternSummary[]>(`/projects/${projectId}/patterns`);
}

export async function comparePatterns(
  patternId: number,
  otherPatternId: number,
): Promise<PatternDiffResponse> {
  return apiFetch<PatternDiffResponse>(
    `/patterns/${patternId}/diff/${otherPatternId}`,
  );
}

export async function restorePatternVersion(patternId: number): Promise<{
  pattern_id: number;
  project_id: number;
  version_index: number;
  status: string;
}> {
  return apiFetch(`/patterns/${patternId}/restore`, {
    method: "POST",
  }) as Promise<{
    pattern_id: number;
    project_id: number;
    version_index: number;
    status: string;
  }>;
}

export async function createMeasurementProfile(
  payload: Omit<MeasurementProfile, "id">,
): Promise<MeasurementProfile> {
  return apiFetch<MeasurementProfile>("/measurement-profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listMeasurementProfiles(): Promise<MeasurementProfile[]> {
  return apiFetch<MeasurementProfile[]>("/measurement-profiles");
}

// React Query hooks

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });
}

export function useProjectPatterns(projectId: number | null) {
  return useQuery({
    queryKey: ["project-patterns", projectId],
    queryFn: () => (projectId ? listProjectPatterns(projectId) : []),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useMeasurementProfiles() {
  return useQuery({
    queryKey: ["measurement-profiles"],
    queryFn: () => listMeasurementProfiles(),
  });
}

export function useCreateMeasurementProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMeasurementProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurement-profiles"] });
    },
  });
}
