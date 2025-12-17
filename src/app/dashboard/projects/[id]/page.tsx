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

  const { data: draftingSchools } = useDraftingSchools();
  const { data: blocks } = useBlocks();
  const { data: ruleGraphs } = useRuleGraphs();
  const { data: easeProfiles } = useEaseProfiles();
  const { data: sizeProfiles } = useSizeProfiles();
  const { data: transformPipelines } = useTransformPipelines();
  
  // MVP: Filter to show only Winifred Aldrich or Müller & Sohn
  const mvpSchools = draftingSchools?.filter(
    (school) => 
      school.name.toLowerCase().includes("winifred aldrich") ||
      school.name.toLowerCase().includes("müller") ||
      school.name.toLowerCase().includes("muller")
  ) || [];
  
  // MVP: Filter blocks to show only tested ones (Bodice with Waist Darts)
  const mvpBlocks = blocks?.filter(
    (block) => 
      block.name.toLowerCase().includes("bodice") && 
      block.name.toLowerCase().includes("waist")
  ) || [];
  
  // MVP: Filter rule graphs to show only bodice with waist darts
  const mvpRuleGraphs = ruleGraphs?.filter(
    (graph) => 
      graph.name.toLowerCase().includes("bodice") && 
      graph.name.toLowerCase().includes("waist")
  ) || [];
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
      
      // Refetch pattern result after a short delay
      setTimeout(() => {
        void refetchPatternResult();
      }, 1000);
    } catch (error) {
      console.error("Failed to generate pattern:", error);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <span className="rounded-full bg-yellow-900/50 px-3 py-1 text-xs font-medium text-yellow-400">
                Private Beta for Tailors
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Configure and generate your pattern
            </p>
            <p className="mt-1 text-xs text-amber-400">
              ⚠️ Draft pattern for testing and fitting purposes
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("configure")}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "configure"
                ? "border-b-2 border-sky-500 text-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Configure
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "history"
                ? "border-b-2 border-sky-500 text-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            History
          </button>
        </div>

        {activeTab === "configure" && (
          <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
            {/* Configuration Panel */}
            <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="mb-4 text-lg font-semibold">Configuration Steps</h2>
              
              {/* Step 1: Measurement */}
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-slate-200">
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
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
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
                  <h3 className="mb-2 text-sm font-medium text-slate-200">
                    2. Garment Category
                  </h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
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
                  <h3 className="mb-2 text-sm font-medium text-slate-200">
                    3. Drafting School
                  </h3>
                  <select
                    value={selectedSchool || ""}
                    onChange={(e) =>
                      setSelectedSchool(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                  >
                    <option value="">Choose drafting school...</option>
                    {mvpSchools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} (v{school.version})
                      </option>
                    ))}
                  </select>
                  {mvpSchools.length === 0 && (
                    <p className="mt-2 text-xs text-slate-400">
                      Using Winifred Aldrich drafting system (MVP)
                    </p>
                  )}
                  </select>
                  {selectedSchool && (
                    <button
                      onClick={() => setStep("block")}
                      className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                    >
                      Next: Block
                    </button>
                  )}
                </div>
              )}

              {/* Step 4: Block */}
              {step !== "measurement" &&
                step !== "category" &&
                step !== "school" && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-200">
                      4. Block Configuration
                    </h3>
                    <select
                      value={selectedBlock || ""}
                      onChange={(e) =>
                        setSelectedBlock(
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                    >
                      <option value="">Choose block...</option>
                      {mvpBlocks.map((block) => (
                        <option key={block.id} value={block.id}>
                          {block.name} (v{block.version})
                        </option>
                      ))}
                    </select>
                    {mvpBlocks.length === 0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        Only tested blocks are shown (Bodice with Waist Darts)
                      </p>
                    )}
                    </select>
                    {selectedBlock && (
                      <button
                        onClick={() => setStep("ruleGraph")}
                        className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                      >
                        Next: Rule Graph
                      </button>
                    )}
                  </div>
                )}

              {/* Step 5: Rule Graph */}
              {step !== "measurement" &&
                step !== "category" &&
                step !== "school" &&
                step !== "block" && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-200">
                      5. Rule Graph Configuration
                    </h3>
                    <select
                      value={selectedRuleGraph || ""}
                      onChange={(e) =>
                        setSelectedRuleGraph(
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                    >
                      <option value="">Choose rule graph...</option>
                      {mvpRuleGraphs.map((graph) => (
                        <option key={graph.id} value={graph.id}>
                          {graph.name} (v{graph.version})
                        </option>
                      ))}
                    </select>
                    {mvpRuleGraphs.length === 0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        Only tested rule graphs are shown
                      </p>
                    )}
                    </select>
                    {selectedRuleGraph && (
                      <button
                        onClick={() => setStep("ease")}
                        className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
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
                    <h3 className="mb-2 text-sm font-medium text-slate-200">
                      6. Ease Profile (Optional)
                    </h3>
                    <select
                      value={selectedEase || ""}
                      onChange={(e) =>
                        setSelectedEase(
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Pattern Preview</h2>
            {patternResult?.exports?.svg?.content ? (
              <>
                <div className="mb-3 rounded-md bg-amber-900/20 border border-amber-800/50 p-2 text-xs text-amber-300">
                  ⚠️ Draft pattern for testing and fitting purposes
                </div>
                <PatternViewer svgContent={patternResult.exports.svg.content} />
              </>
            ) : generatedPatternId ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                Loading pattern...
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-500">
                Complete the configuration steps to generate a pattern
              </div>
            )}
          </div>
        </div>
        )}

        {activeTab === "history" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Pattern History</h2>
            {patternHistory.length === 0 ? (
              <p className="text-sm text-slate-400">No patterns generated yet.</p>
            ) : (
              <div className="space-y-3">
                {patternHistory.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">
                          Version {pattern.version_index || "?"}
                        </span>
                        {pattern.tag && (
                          <span className="text-xs text-slate-500">({pattern.tag})</span>
                        )}
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            pattern.status === "completed"
                              ? "bg-green-900/50 text-green-400"
                              : "bg-yellow-900/50 text-yellow-400"
                          }`}
                        >
                          {pattern.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
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
                            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700"
                          >
                            SVG
                          </button>
                          <button
                            onClick={() => handleExport(pattern.id, "dxf")}
                            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700"
                          >
                            DXF
                          </button>
                          <button
                            onClick={() => handleExport(pattern.id, "pdf")}
                            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700"
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
    </div>
  );
}

