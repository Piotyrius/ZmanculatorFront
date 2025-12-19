"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { catalogItems } from "../../../../lib/catalog";
import {
  useBlocks,
  useDraftingSchools,
  useEaseProfiles,
  useRuleGraphs,
  useSizeProfiles,
  useTransformPipelines,
} from "../../../../lib/configs";
import {
  useCreateMeasurementProfile,
  useCreateProject,
  useMeasurementProfiles,
  useProjects,
} from "../../../../lib/projects";
import { usePatternGeneration } from "../../../../lib/patterns";
import { showToast } from "../../../../components/Toast";

type Step = 1 | 2 | 3 | 4 | 5;

type FitIntent = "close" | "regular" | "relaxed" | "custom";

export default function ProductConfiguratorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const product = useMemo(
    () => catalogItems.find((item) => item.slug === slug),
    [slug],
  );

  const [step, setStep] = useState<Step>(1);

  // Data hooks
  const { data: projects } = useProjects();
  const { data: measurementProfiles } = useMeasurementProfiles();
  const { data: draftingSchools } = useDraftingSchools();
  const { data: blocks } = useBlocks();
  const { data: ruleGraphs } = useRuleGraphs();
  const { data: easeProfiles } = useEaseProfiles();
  const { data: sizeProfiles } = useSizeProfiles();
  const { data: transformPipelines } = useTransformPipelines();

  const createProject = useCreateProject();
  const createMeasurementProfile = useCreateMeasurementProfile();
  const generatePattern = usePatternGeneration();

  // Selections
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [newProjectName, setNewProjectName] = useState("");

  const [selectedMeasurementId, setSelectedMeasurementId] = useState<
    number | null
  >(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileCategory, setNewProfileCategory] = useState(
    product?.defaults.category ?? "womenswear",
  );
  const [newProfileUnit, setNewProfileUnit] = useState("mm");
  const [newProfileValues, setNewProfileValues] = useState({
    chest: "",
    waist: "",
    hip: "",
    back_length: "",
    shoulder_width: "",
    body_height: "",
    bust: "",
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(
    null,
  );
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedRuleGraphId, setSelectedRuleGraphId] = useState<
    number | null
  >(null);

  const [fitIntent, setFitIntent] = useState<FitIntent>("regular");
  const [selectedSizeProfileId, setSelectedSizeProfileId] = useState<
    number | null
  >(null);
  const [selectedEaseProfileId, setSelectedEaseProfileId] = useState<
    number | null
  >(null);

  const [selectedTransformIds, setSelectedTransformIds] = useState<number[]>(
    [],
  );

  if (!product) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">
          Product not found
        </h1>
        <button
          onClick={() => router.push("/catalog")}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
        >
          Back to catalog
        </button>
      </div>
    );
  }

  const selectedMeasurement = measurementProfiles?.find(
    (p) => p.id === selectedMeasurementId,
  );
  const selectedSchool = draftingSchools?.find(
    (s) => s.id === selectedSchoolId,
  );
  const selectedBlock = blocks?.find((b) => b.id === selectedBlockId);
  const selectedRuleGraph = ruleGraphs?.find(
    (r) => r.id === selectedRuleGraphId,
  );
  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  const canGoNext =
    step === 1
      ? Boolean(selectedMeasurement)
      : step === 2
        ? Boolean(selectedSchool && selectedBlock && selectedRuleGraph)
        : step === 3
          ? Boolean(fitIntent)
          : step === 4
            ? true
            : Boolean(
                selectedProject &&
                  selectedMeasurement &&
                  selectedSchool &&
                  selectedBlock &&
                  selectedRuleGraph
              );

  const handleToggleTransform = (id: number) => {
    setSelectedTransformIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      showToast("Please enter a project name", "error");
      return;
    }
    try {
      const created = await createProject.mutateAsync(newProjectName.trim());
      setSelectedProjectId(created.id);
      setNewProjectName("");
      showToast(`Project "${created.name}" created and selected`, "success");
    } catch (error: any) {
      console.error("Failed to create project:", error);
      showToast(
        error?.message || "Failed to create project. Please try again.",
        "error"
      );
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;
    // Convert string values to numbers, filtering out empty values
    const values: Record<string, number> = {};
    Object.entries(newProfileValues).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          values[key] = numValue;
        }
      }
    });
    
    try {
      const created = await createMeasurementProfile.mutateAsync({
        name: newProfileName.trim(),
        category: newProfileCategory,
        unit: newProfileUnit,
        values: values,
      });
      setSelectedMeasurementId(created.id);
      setCreatingProfile(false);
      setNewProfileName("");
      showToast("Measurement profile created successfully", "success");
    } catch (error: any) {
      showToast(error?.message || "Failed to create profile", "error");
    }
  };

  const handleGenerate = async () => {
    if (
      !selectedProject ||
      !selectedMeasurement ||
      !selectedSchool ||
      !selectedBlock ||
      !selectedRuleGraph
    ) {
      const missing = [];
      if (!selectedProject) missing.push("project");
      if (!selectedMeasurement) missing.push("measurement profile");
      if (!selectedSchool) missing.push("drafting school");
      if (!selectedBlock) missing.push("block");
      if (!selectedRuleGraph) missing.push("rule graph");
      showToast(
        `Please select: ${missing.join(", ")}`,
        "error"
      );
      return;
    }

    try {
      showToast("Generating pattern...", "info");
      const response = await generatePattern.mutateAsync({
        project_id: selectedProject.id,
        garment_type: product.defaults.garment_type,
        fit: fitIntent,
        category: product.defaults.category,
        measurements: {
          values: selectedMeasurement.values,
          unit: selectedMeasurement.unit,
        },
        drafting_school_id: String(selectedSchool.id),
        drafting_school_version: selectedSchool.version,
        block_id: String(selectedBlock.id),
        block_version: selectedBlock.version,
        rule_graph_id: String(selectedRuleGraph.id),
        rule_graph_version: selectedRuleGraph.version,
        size_profile_id: selectedSizeProfileId
          ? String(selectedSizeProfileId)
          : undefined,
        ease_profile_id: selectedEaseProfileId
          ? String(selectedEaseProfileId)
          : undefined,
        transform_pipeline_ids: selectedTransformIds.map(String),
      });

      showToast("Pattern generated successfully! Redirecting...", "success");
      // Small delay to show success message
      setTimeout(() => {
        router.push(`/patterns/${response.pattern_id}`);
      }, 500);
    } catch (error: any) {
      console.error("Failed to generate pattern:", error);
      showToast(
        error?.message || "Failed to generate pattern. Please check the console for details.",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sky-600">
            {product.categoryLabel}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {product.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {product.shortDescription}
          </p>
        </div>
        <div className="flex gap-1 text-xs text-slate-700">
          {([1, 2, 3, 4, 5] as Step[]).map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex min-w-[80px] flex-col items-center rounded-md border px-2 py-1 ${
                s === step
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              <span className="text-[10px] uppercase">Step {s}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Step 1 · Measurements
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Select a body measurement profile or create a new one.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-700">
                  Saved profiles
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {measurementProfiles?.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => setSelectedMeasurementId(profile.id)}
                      className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left text-xs transition ${
                        selectedMeasurementId === profile.id
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span className="font-semibold">{profile.name}</span>
                      <span className="mt-0.5 text-[11px] text-slate-600">
                        {profile.category} · {profile.unit}
                      </span>
                    </button>
                  ))}
                  {!measurementProfiles?.length && (
                    <p className="text-xs text-slate-9000">
                      No measurement profiles yet. Create one below.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 space-y-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setCreatingProfile((v) => !v)}
                  className="text-xs font-medium text-sky-600 hover:text-sky-200"
                >
                  {creatingProfile
                    ? "Hide new profile form"
                    : "Create new measurement profile"}
                </button>
                {creatingProfile && (
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-white/80 p-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-700">
                        Profile name
                      </label>
                      <input
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="block text-[11px] text-slate-700">
                          Category
                        </label>
                        <select
                          value={newProfileCategory}
                          onChange={(e) =>
                            setNewProfileCategory(e.target.value)
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                        >
                          <option value="womenswear">Womenswear</option>
                          <option value="menswear">Menswear</option>
                          <option value="childrenswear">Childrenswear</option>
                          <option value="unisex">Unisex</option>
                        </select>
                      </div>
                      <div className="w-24 space-y-1">
                        <label className="block text-[11px] text-slate-700">
                          Unit
                        </label>
                        <select
                          value={newProfileUnit}
                          onChange={(e) => setNewProfileUnit(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                        >
                          <option value="mm">mm</option>
                          <option value="cm">cm</option>
                        </select>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-2">
                      <label className="block text-[11px] font-medium text-slate-700 mb-2">
                        Body Measurements (required)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-600">Chest/Bust</label>
                          <input
                            type="number"
                            value={newProfileValues.chest}
                            onChange={(e) => setNewProfileValues({...newProfileValues, chest: e.target.value, bust: e.target.value})}
                            placeholder="900"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-600">Waist</label>
                          <input
                            type="number"
                            value={newProfileValues.waist}
                            onChange={(e) => setNewProfileValues({...newProfileValues, waist: e.target.value})}
                            placeholder="700"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-600">Hip</label>
                          <input
                            type="number"
                            value={newProfileValues.hip}
                            onChange={(e) => setNewProfileValues({...newProfileValues, hip: e.target.value})}
                            placeholder="950"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-600">Back Length</label>
                          <input
                            type="number"
                            value={newProfileValues.back_length}
                            onChange={(e) => setNewProfileValues({...newProfileValues, back_length: e.target.value})}
                            placeholder="400"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-600">Shoulder Width</label>
                          <input
                            type="number"
                            value={newProfileValues.shoulder_width}
                            onChange={(e) => setNewProfileValues({...newProfileValues, shoulder_width: e.target.value})}
                            placeholder="380"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-600">Body Height</label>
                          <input
                            type="number"
                            value={newProfileValues.body_height}
                            onChange={(e) => setNewProfileValues({...newProfileValues, body_height: e.target.value})}
                            placeholder="1650"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateProfile}
                      className="mt-2 w-full rounded-md bg-sky-500 px-3 py-1 text-xs font-medium text-white hover:bg-sky-600"
                    >
                      Save profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Step 2 · Construction system
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choose drafting school, base block and rule graph.
                </p>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="mb-1 text-[11px] font-medium text-slate-700">
                    Drafting school
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {draftingSchools?.map((school) => (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => setSelectedSchoolId(school.id)}
                        className={`rounded-lg border px-3 py-2 text-left transition ${
                          selectedSchoolId === school.id
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <div className="text-xs font-semibold">
                          {school.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          v{school.version}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-[11px] font-medium text-slate-700">
                    Base block
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {blocks?.map((block) => (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`rounded-lg border px-3 py-2 text-left transition ${
                          selectedBlockId === block.id
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <div className="text-xs font-semibold">
                          {block.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          v{block.version}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-[11px] font-medium text-slate-700">
                    Rule graph
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {ruleGraphs?.map((graph) => (
                      <button
                        key={graph.id}
                        type="button"
                        onClick={() => setSelectedRuleGraphId(graph.id)}
                        className={`rounded-lg border px-3 py-2 text-left transition ${
                          selectedRuleGraphId === graph.id
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <div className="text-xs font-semibold">
                          {graph.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          v{graph.version}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Step 3 · Fit and ease
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choose fit intent and optional size and ease presets.
                </p>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="mb-1 text-[11px] font-medium text-slate-700">
                    Fit intent
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["close", "regular", "relaxed", "custom"] as FitIntent[]).map(
                      (intent) => (
                        <button
                          key={intent}
                          type="button"
                          onClick={() => setFitIntent(intent)}
                          className={`rounded-md border px-3 py-1 transition ${
                            fitIntent === intent
                              ? "border-sky-500 bg-sky-50 text-sky-700"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          {intent === "close"
                            ? "Close"
                            : intent === "regular"
                              ? "Regular"
                              : intent === "relaxed"
                                ? "Relaxed"
                                : "Custom"}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[11px] font-medium text-slate-700">
                      Size profile (optional)
                    </div>
                    <select
                      value={selectedSizeProfileId ?? ""}
                      onChange={(e) =>
                        setSelectedSizeProfileId(
                          e.target.value
                            ? Number.parseInt(e.target.value, 10)
                            : null,
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    >
                      <option value="">Use default</option>
                      {sizeProfiles?.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-medium text-slate-700">
                      Ease profile (optional)
                    </div>
                    <select
                      value={selectedEaseProfileId ?? ""}
                      onChange={(e) =>
                        setSelectedEaseProfileId(
                          e.target.value
                            ? Number.parseInt(e.target.value, 10)
                            : null,
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    >
                      <option value="">Use default</option>
                      {easeProfiles?.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Step 4 · Style options
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Stack style transformations such as flare, length adjustments
                  or darts.
                </p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-medium text-slate-700">
                  Transform pipelines
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {transformPipelines?.map((pipeline) => (
                    <button
                      key={pipeline.id}
                      type="button"
                      onClick={() => handleToggleTransform(pipeline.id)}
                      className={`flex items-start justify-between rounded-lg border px-3 py-2 text-left transition ${
                        selectedTransformIds.includes(pipeline.id)
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {pipeline.name}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        v{pipeline.version}
                      </span>
                    </button>
                  ))}
                  {!transformPipelines?.length && (
                    <p className="text-xs text-slate-9000">
                      No style transforms configured yet. Generation will use
                      the base block only.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Step 5 · Review & generate
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choose a project and review your configuration before
                  generating the pattern.
                </p>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="mb-1 text-[11px] font-medium text-slate-700">
                    Project
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projects?.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`rounded-md border px-3 py-1 text-xs transition ${
                          selectedProjectId === project.id
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {project.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="New project name"
                      className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700"
                    >
                      Create
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canGoNext || generatePattern.isPending}
                  onClick={handleGenerate}
                  className="mt-2 inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-800"
                >
                  {generatePattern.isPending
                    ? "Generating pattern…"
                    : "Generate pattern"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-between text-xs text-slate-700">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
              className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={step === 5 || !canGoNext}
              onClick={() => setStep((s) => (s < 5 ? ((s + 1) as Step) : s))}
              className="rounded-md border border-sky-600 bg-sky-600/10 px-3 py-1 text-xs text-sky-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>

        <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm text-slate-700">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Configuration summary
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            <li>
              <span className="text-slate-600">Project: </span>
              {selectedProject ? selectedProject.name : "Not selected"}
            </li>
            <li>
              <span className="text-slate-600">Measurements: </span>
              {selectedMeasurement ? selectedMeasurement.name : "Not selected"}
            </li>
            <li>
              <span className="text-slate-600">Drafting school: </span>
              {selectedSchool ? selectedSchool.name : "Not selected"}
            </li>
            <li>
              <span className="text-slate-600">Block: </span>
              {selectedBlock ? selectedBlock.name : "Not selected"}
            </li>
            <li>
              <span className="text-slate-600">Rule graph: </span>
              {selectedRuleGraph ? selectedRuleGraph.name : "Not selected"}
            </li>
            <li>
              <span className="text-slate-600">Fit: </span>
              {fitIntent}
            </li>
            <li>
              <span className="text-slate-600">Style transforms: </span>
              {selectedTransformIds.length
                ? `${selectedTransformIds.length} selected`
                : "None"}
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

