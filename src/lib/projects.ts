import { apiFetch } from "./apiClient";

export type Project = {
  id: number;
  name: string;
  status: string;
};

export type MeasurementProfile = {
  id: number;
  name: string;
  category: string;
  unit: string;
  values: Record<string, number>;
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

export async function createMeasurementProfile(
  payload: Omit<MeasurementProfile, "id">
): Promise<MeasurementProfile> {
  return apiFetch<MeasurementProfile>("/measurement-profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listMeasurementProfiles(): Promise<MeasurementProfile[]> {
  return apiFetch<MeasurementProfile[]>("/measurement-profiles");
}



