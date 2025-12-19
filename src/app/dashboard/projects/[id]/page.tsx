"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/auth/AuthContext";
import {
  useDraftingSchools,
  useBlocks,
  useEaseProfiles,
  useSizeProfiles,
  useTransformPipelines,
  useRuleGraphs,
} from "../../../../lib/configs";
import {
  useGeneratePattern,
  usePatternResult,
} from "../../../../lib/patterns";
import { listMeasurementProfiles, type MeasurementProfile } from "../../../../lib/projects";
import { listProjects, type Project } from "../../../../lib/projects";
import { apiFetch } from "../../../../lib/apiClient";
import { API_BASE_URL } from "../../../../lib/config";
import PatternViewer from "../../../../components/PatternViewer";
import { showToast } from "../../../../components/Toast";

type Step =
  | "measurement"
  | "category"
  | "school"
  | "block"
  | "ruleGraph"
  | "ease"
  | "transform"
  | "generate";
type Tab = "configure" | "history";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const projectId = parseInt(params.id as string, 10);

  const [step, setStep] = useState<Step>("measurement");
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [selectedRuleGraph, setSelectedRuleGraph] = useState<number | null>(null);
  const [selectedEase, setSelectedEase] = useState<number | null>(null);
  const [selectedTransforms, setSelectedTransforms] = useState<number[]>([]);
  const [generatedPatternId, setGeneratedPatternId] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementProfile[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("configure");
  const [patternHistory, setPatternHistory] = useState<any[]>([]);

  const { data: draftingSchools, isLoading: schoolsLoading, error: schoolsError } = useDraftingSchools();
  const { data: blocks, isLoading: blocksLoading } = useBlocks();
  const { data: ruleGraphs, isLoading: ruleGraphsLoading } = useRuleGraphs();
  const { data: easeProfiles } = useEaseProfiles();
  const { data: sizeProfiles } = useSizeProfiles();
  const { data: transformPipelines } = useTransformPipelines();
  
  // Show ALL available drafting schools (no filtering for MVP)
  const allSchools = draftingSchools ?? [];
  const mvpSchools = allSchools;

  const allBlocks = blocks ?? [];
  const filteredBlocks =
    allBlocks.filter(
      (block) =>
        block.name.toLowerCase().includes("bodice") &&
        block.name.toLowerCase().includes("waist")
    ) ?? [];
  const mvpBlocks = filteredBlocks.length > 0 ? filteredBlocks : allBlocks;

  const allRuleGraphs = ruleGraphs ?? [];
  const filteredRuleGraphs =
    allRuleGraphs.filter(
      (graph) =>
        graph.name.toLowerCase().includes("bodice") &&
        graph.name.toLowerCase().includes("waist")
    ) ?? [];
  const mvpRuleGraphs =
    filteredRuleGraphs.length > 0 ? filteredRuleGraphs : allRuleGraphs;
  const { data: patternResult, refetch: refetchPatternResult } = usePatternResult(generatedPatternId);
  const generatePattern = useGeneratePattern();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    const load = async () => {
      const [projs, profs, history] = await Promise.all([
        listProjects(),
        listMeasurementProfiles(),
        apiFetch<any[]>(`/projects/${projectId}/patterns`).catch(() => []),
      ]);
      const foundProject = projs.find((p) => p.id === projectId);
      if (!foundProject) {
        router.replace("/dashboard");
        return;
      }
      setProject(foundProject);
      setMeasurements(profs);
      setPatternHistory(history);
    };

    void load();
  }, [isAuthenticated, router, projectId]);

  if (!isAuthenticated || !project) {
    return null;
  }

  const handleExport = async (patternId: number, format: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/patterns/${patternId}/export?format=${format}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pattern_${patternId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleRestore = async (patternId: number) => {
    try {
      await apiFetch(`/patterns/${patternId}/restore`, {
        method: "POST",
      });
      // Reload history
      const history = await apiFetch<any[]>(`/projects/${projectId}/patterns`);
      setPatternHistory(history);
      setActiveTab("configure");
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedMeasurement || !selectedSchool || !selectedBlock) {
      return;
    }

    const school = draftingSchools?.find((s) => s.id === selectedSchool);
    const block = blocks?.find((b) => b.id === selectedBlock);
    const ruleGraph = ruleGraphs?.find((r) => r.id === selectedRuleGraph);

    if (!school || !block || !ruleGraph) {
      return;
    }

    try {
      const result = await generatePattern.mutateAsync({
        project_id: projectId,
        garment_type: "shirt", // Default for MVP
        fit: "regular",
        category: selectedCategory || "womenswear",
        measurements: {
          values: selectedMeasurement.values,
          unit: selectedMeasurement.unit,
        },
        drafting_school_id: school.id.toString(),
        drafting_school_version: school.version,
        block_id: block.id.toString(),
        block_version: block.version,
        rule_graph_id: ruleGraph.id.toString(),
        rule_graph_version: ruleGraph.version,
        ease_profile_id: selectedEase ? selectedEase.toString() : undefined,
        transform_pipeline_ids: selectedTransforms.map((t) => t.toString()),
      });

      setGeneratedPatternId(result.pattern_id);
      setStep("generate");
      showToast("Pattern generation started! Check the preview below.", "success");
      
      // Reload pattern history to show the new pattern
      try {
        const history = await apiFetch<any[]>(`/projects/${projectId}/patterns`);
        setPatternHistory(history);
        if (history.length > 0) {
          showToast(`Pattern created! View it in the History tab.`, "info");
        }
      } catch (historyError) {
        console.error("Failed to reload pattern history:", historyError);
      }
      
      // Refetch pattern result after a short delay
      setTimeout(() => {
        void refetchPatternResult();
      }, 1000);
    } catch (error) {
      console.error("Failed to generate pattern:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showToast(`Failed to generate pattern: ${errorMessage}`, "error");
    }
  };

  const canProceed = () => {
    switch (step) {
      case "measurement":
        return selectedMeasurement !== null;
      case "category":
        return selectedCategory !== "";
      case "school":
        return selectedSchool !== null;
      case "block":
        return selectedBlock !== null;
      case "ruleGraph":
        return selectedRuleGraph !== null;
      case "ease":
        return true; // Optional
      case "transform":
        return true; // Optional
      default:
        return false;
    }
  };

  // --- Size details helpers ---
  const normalizeToMm = (value: number | undefined, unit: string | undefined) => {
    if (!value || !unit) return null;
    if (unit === "mm") return value;
    if (unit === "cm") return value * 10;
    if (unit === "in") return value * 25.4;
    return value;
  };

  const coreMeasurements = selectedMeasurement
    ? {
        chest: normalizeToMm(selectedMeasurement.values?.chest, selectedMeasurement.unit),
        waist: normalizeToMm(selectedMeasurement.values?.waist, selectedMeasurement.unit),
        hip: normalizeToMm(selectedMeasurement.values?.hip, selectedMeasurement.unit),
        back_length: normalizeToMm(
          selectedMeasurement.values?.back_length,
          selectedMeasurement.unit
        ),
        shoulder_width: normalizeToMm(
          selectedMeasurement.values?.shoulder_width,
          selectedMeasurement.unit
        ),
        body_height: normalizeToMm(
          selectedMeasurement.values?.body_height,
          selectedMeasurement.unit
        ),
      }
    : null;

  const derivedMeasurements =
    coreMeasurements && coreMeasurements.chest && coreMeasurements.waist && coreMeasurements.hip
      ? {
          half_chest: coreMeasurements.chest / 2,
          quarter_chest: coreMeasurements.chest / 4,
          half_waist: coreMeasurements.waist / 2,
          half_hip: coreMeasurements.hip / 2,
          estimated_armhole_depth: coreMeasurements.chest / 4 + 20,
        }
      : null;

  const selectedEaseProfile =
    selectedEase != null ? easeProfiles?.find((p) => p.id === selectedEase) : null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              Private Beta for Tailors
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Configure and generate your pattern
          </p>
          <p className="mt-1 text-xs text-amber-600">
            ⚠ Draft pattern for testing and fitting purposes
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("configure")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "configure"
              ? "border-b-2 border-sky-500 text-sky-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Configure
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "history"
              ? "border-b-2 border-sky-500 text-sky-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "configure" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr,1.7fr]">
          {/* Configuration Panel */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Configuration Steps</h2>
              
              {/* Step 1: Measurement */}
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-slate-900">
                  1. Select Measurement Profile
                </h3>
                <select
                  value={selectedMeasurement?.id || ""}
                  onChange={(e) => {
                    const profile = measurements.find(
                      (p) => p.id === parseInt(e.target.value, 10)
                    );
                    setSelectedMeasurement(profile || null);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                >
                  <option value="">Choose a profile...</option>
                  {measurements.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} ({profile.category})
                    </option>
                  ))}
                </select>
                {selectedMeasurement && (
                  <button
                    onClick={() => setStep("category")}
                    className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                  >
                    Next: Category
                  </button>
                )}
              </div>

              {/* Step 2: Category */}
              {step !== "measurement" && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-slate-900">
                    2. Garment Category
                  </h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                  >
                    <option value="">Choose category...</option>
                    <option value="womenswear">Womenswear</option>
                    <option value="menswear">Menswear</option>
                    <option value="childrenswear">Childrenswear</option>
                  </select>
                  {selectedCategory && (
                    <button
                      onClick={() => setStep("school")}
                      className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                    >
                      Next: Drafting School
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Drafting School */}
              {step !== "measurement" && step !== "category" && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-slate-900">
                    3. Drafting School / Construction System
                  </h3>
                  {schoolsLoading ? (
                    <div className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      Loading drafting schools...
                    </div>
                  ) : schoolsError ? (
                    <div className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
                      Error loading schools. Please refresh the page.
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedSchool || ""}
                        onChange={(e) =>
                          setSelectedSchool(
                            e.target.value ? parseInt(e.target.value, 10) : null
                          )
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                        disabled={mvpSchools.length === 0}
                      >
                        <option value="">Choose drafting school...</option>
                        {mvpSchools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name} (v{school.version})
                          </option>
                        ))}
                      </select>
                      {mvpSchools.length === 0 && !schoolsLoading && (
                        <p className="mt-2 text-xs text-amber-600">
                          ⚠️ No drafting schools available. Please ensure the backend is running and schools are seeded.
                        </p>
                      )}
                      {mvpSchools.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          {mvpSchools.length} drafting system{mvpSchools.length !== 1 ? 's' : ''} available
                        </p>
                      )}
                      {selectedSchool && (
                        <p className="mt-2 text-xs text-green-600">
                          ✓ School selected. Block options will appear below.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Block - Show when school is selected */}
              {selectedSchool && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-slate-900">
                    4. Block Configuration
                  </h3>
                  <select
                    value={selectedBlock || ""}
                    onChange={(e) =>
                      setSelectedBlock(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                    disabled={mvpBlocks.length === 0}
                  >
                    <option value="">Choose block...</option>
                    {mvpBlocks.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.name} (v{block.version})
                      </option>
                    ))}
                  </select>
                  {mvpBlocks.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      ⚠️ No blocks available. Please seed blocks in the database.
                    </p>
                  )}
                  {mvpBlocks.length > 0 && !selectedBlock && (
                    <p className="mt-2 text-xs text-slate-500">
                      {mvpBlocks.length} block{mvpBlocks.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>
              )}

              {/* Step 5: Rule Graph - Show when block is selected */}
              {selectedBlock && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-slate-900">
                    5. Rule Graph Configuration
                  </h3>
                  <select
                    value={selectedRuleGraph || ""}
                    onChange={(e) =>
                      setSelectedRuleGraph(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                    disabled={mvpRuleGraphs.length === 0}
                  >
                    <option value="">Choose rule graph...</option>
                    {mvpRuleGraphs.map((graph) => (
                      <option key={graph.id} value={graph.id}>
                        {graph.name} (v{graph.version})
                      </option>
                    ))}
                  </select>
                  {mvpRuleGraphs.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      ⚠️ No rule graphs available. Please seed rule graphs in the database.
                    </p>
                  )}
                  {mvpRuleGraphs.length > 0 && !selectedRuleGraph && (
                    <p className="mt-2 text-xs text-slate-500">
                      {mvpRuleGraphs.length} rule graph{mvpRuleGraphs.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                  {selectedRuleGraph && (
                    <button
                      onClick={() => setStep("ease")}
                      className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
                    >
                      Next: Ease Profile (Optional)
                    </button>
                  )}
                </div>
              )}

              {/* Step 6: Ease Profile (Optional) */}
              {step !== "measurement" &&
                step !== "category" &&
                step !== "school" &&
                step !== "block" &&
                step !== "ruleGraph" && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-900">
                      6. Ease Profile (Optional)
                    </h3>
                    <select
                      value={selectedEase || ""}
                      onChange={(e) =>
                        setSelectedEase(
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                    >
                      <option value="">None (use default)</option>
                      {easeProfiles?.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name} (v{profile.version})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleGenerate}
                      disabled={generatePattern.isPending}
                      className="mt-2 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-green-500 disabled:opacity-50"
                    >
                      {generatePattern.isPending ? "Generating..." : "Generate Pattern"}
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Pattern Viewer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Pattern Preview</h2>
            {patternResult?.exports?.svg?.content ? (
              <>
                <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
                  ⚠ Draft pattern for testing and fitting purposes
                </div>
                <PatternViewer svgContent={patternResult.exports.svg.content} />
              </>
            ) : generatedPatternId ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                Loading pattern...
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-500">
                Complete the configuration steps to generate a pattern.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Pattern History</h2>
          {patternHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No patterns generated yet.</p>
          ) : (
            <div className="space-y-3">
              {patternHistory.map((pattern) => (
                <div
                  key={pattern.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        Version {pattern.version_index || "?"}
                      </span>
                      {pattern.tag && (
                        <span className="text-xs text-slate-500">({pattern.tag})</span>
                      )}
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          pattern.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {pattern.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {pattern.created_at
                        ? new Date(pattern.created_at).toLocaleString()
                        : "Unknown date"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {pattern.has_result && (
                      <>
                        <button
                          onClick={() => handleExport(pattern.id, "svg")}
                          className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-200"
                        >
                          SVG
                        </button>
                        <button
                          onClick={() => handleExport(pattern.id, "dxf")}
                          className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-200"
                        >
                          DXF
                        </button>
                        <button
                          onClick={() => handleExport(pattern.id, "pdf")}
                          className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-200"
                        >
                          PDF
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRestore(pattern.id)}
                      className="rounded-md bg-sky-600 px-3 py-1.5 text-xs text-slate-50 transition hover:bg-sky-500"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

