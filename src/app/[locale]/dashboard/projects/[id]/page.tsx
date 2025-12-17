'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '../../../../../lib/auth/AuthContext';
import {
  useDraftingSchools,
  useBlocks,
  useEaseProfiles,
  useSizeProfiles,
  useTransformPipelines,
  useRuleGraphs,
} from '../../../../../lib/configs';
import {
  useGeneratePattern,
  usePatternResult,
} from '../../../../../lib/patterns';
import { listMeasurementProfiles, type MeasurementProfile } from '../../../../../lib/projects';
import { listProjects, type Project } from '../../../../../lib/projects';
import { apiFetch } from '../../../../../lib/apiClient';
import { API_BASE_URL } from '../../../../../lib/config';
import PatternViewer from '../../../../../components/PatternViewer';
import ClothingImage from '../../../../../components/ClothingImage';
import Link from 'next/link';

type Step = 'measurement' | 'category' | 'school' | 'block' | 'ease' | 'transform' | 'generate';
type Tab = 'configure' | 'history';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const t = useTranslations('project');
  const projectId = parseInt(params.id as string, 10);

  const [step, setStep] = useState<Step>('measurement');
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [selectedRuleGraph, setSelectedRuleGraph] = useState<number | null>(null);
  const [selectedEase, setSelectedEase] = useState<number | null>(null);
  const [selectedTransforms, setSelectedTransforms] = useState<number[]>([]);
  const [generatedPatternId, setGeneratedPatternId] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementProfile[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('configure');
  const [patternHistory, setPatternHistory] = useState<any[]>([]);

  const { data: draftingSchools } = useDraftingSchools();
  const { data: blocks } = useBlocks();
  const { data: ruleGraphs } = useRuleGraphs();
  const { data: easeProfiles } = useEaseProfiles();
  const { data: sizeProfiles } = useSizeProfiles();
  const { data: transformPipelines } = useTransformPipelines();
  const { data: patternResult, refetch: refetchPatternResult } = usePatternResult(generatedPatternId);
  const generatePattern = useGeneratePattern();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/${locale}/auth/login`);
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
        router.replace(`/${locale}/dashboard`);
        return;
      }
      setProject(foundProject);
      setMeasurements(profs);
      setPatternHistory(history);
    };

    void load();
  }, [isAuthenticated, router, projectId, locale]);

  if (!isAuthenticated || !project) {
    return null;
  }

  const handleExport = async (patternId: number, format: string) => {
    try {
      const token = localStorage.getItem('token');
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
        const a = document.createElement('a');
        a.href = url;
        a.download = `pattern_${patternId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRestore = async (patternId: number) => {
    try {
      await apiFetch(`/patterns/${patternId}/restore`, {
        method: 'POST',
      });
      const history = await apiFetch<any[]>(`/projects/${projectId}/patterns`);
      setPatternHistory(history);
      setActiveTab('configure');
    } catch (error) {
      console.error('Restore failed:', error);
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
        garment_type: 'shirt',
        fit: 'regular',
        category: selectedCategory || 'womenswear',
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
      setStep('generate');
      
      setTimeout(() => {
        void refetchPatternResult();
      }, 1000);
    } catch (error) {
      console.error('Failed to generate pattern:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ClothingImage
              src={project.image_url}
              category={project.category}
              alt={project.name}
              size="md"
            />
            <div>
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <p className="mt-1 text-sm text-slate-400">{t('configurePattern')}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            {t('backToDashboard')}
          </Link>
        </header>

        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('configure')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'configure'
                ? 'border-b-2 border-sky-500 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('configure')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'history'
                ? 'border-b-2 border-sky-500 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('history')}
          </button>
        </div>

        {activeTab === 'configure' && (
          <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="mb-4 text-lg font-semibold">{t('configurationSteps')}</h2>
                
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-slate-200">
                    1. {t('selectMeasurementProfile')}
                  </h3>
                  <select
                    value={selectedMeasurement?.id || ''}
                    onChange={(e) => {
                      const profile = measurements.find(
                        (p) => p.id === parseInt(e.target.value, 10)
                      );
                      setSelectedMeasurement(profile || null);
                    }}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="">{t('chooseProfile')}</option>
                    {measurements.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.category})
                      </option>
                    ))}
                  </select>
                  {selectedMeasurement && (
                    <button
                      onClick={() => setStep('category')}
                      className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                    >
                      {t('nextCategory')}
                    </button>
                  )}
                </div>

                {step !== 'measurement' && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-200">
                      2. {t('garmentCategory')}
                    </h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="">{t('chooseCategory')}</option>
                      <option value="womenswear">{t('womenswear')}</option>
                      <option value="menswear">{t('menswear')}</option>
                      <option value="childrenswear">{t('childrenswear')}</option>
                    </select>
                    {selectedCategory && (
                      <button
                        onClick={() => setStep('school')}
                        className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                      >
                        {t('nextDraftingSchool')}
                      </button>
                    )}
                  </div>
                )}

                {step !== 'measurement' && step !== 'category' && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-200">
                      3. {t('draftingSchool')}
                    </h3>
                    <select
                      value={selectedSchool || ''}
                      onChange={(e) =>
                        setSelectedSchool(
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="">{t('chooseDraftingSchool')}</option>
                      {draftingSchools?.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name} (v{school.version})
                        </option>
                      ))}
                    </select>
                    {selectedSchool && (
                      <button
                        onClick={() => setStep('block')}
                        className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                      >
                        {t('nextBlock')}
                      </button>
                    )}
                  </div>
                )}

                {step !== 'measurement' &&
                  step !== 'category' &&
                  step !== 'school' && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-sm font-medium text-slate-200">
                        4. {t('blockConfiguration')}
                      </h3>
                      <select
                        value={selectedBlock || ''}
                        onChange={(e) =>
                          setSelectedBlock(
                            e.target.value ? parseInt(e.target.value, 10) : null
                          )
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      >
                        <option value="">{t('chooseBlock')}</option>
                        {blocks?.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.name} (v{block.version})
                          </option>
                        ))}
                      </select>
                      {selectedBlock && (
                        <button
                          onClick={() => setStep('ruleGraph')}
                          className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                        >
                          {t('nextRuleGraph')}
                        </button>
                      )}
                    </div>
                  )}

                {step !== 'measurement' &&
                  step !== 'category' &&
                  step !== 'school' &&
                  step !== 'block' && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-sm font-medium text-slate-200">
                        5. {t('ruleGraphConfiguration')}
                      </h3>
                      <select
                        value={selectedRuleGraph || ''}
                        onChange={(e) =>
                          setSelectedRuleGraph(
                            e.target.value ? parseInt(e.target.value, 10) : null
                          )
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      >
                        <option value="">{t('chooseRuleGraph')}</option>
                        {ruleGraphs?.map((graph) => (
                          <option key={graph.id} value={graph.id}>
                            {graph.name} (v{graph.version})
                          </option>
                        ))}
                      </select>
                      {selectedRuleGraph && (
                        <button
                          onClick={() => setStep('ease')}
                          className="mt-2 w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                        >
                          {t('nextEaseProfile')}
                        </button>
                      )}
                    </div>
                  )}

                {step !== 'measurement' &&
                  step !== 'category' &&
                  step !== 'school' &&
                  step !== 'block' &&
                  step !== 'ruleGraph' && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-sm font-medium text-slate-200">
                        6. {t('easeProfile')}
                      </h3>
                      <select
                        value={selectedEase || ''}
                        onChange={(e) =>
                          setSelectedEase(
                            e.target.value ? parseInt(e.target.value, 10) : null
                          )
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      >
                        <option value="">{t('noneUseDefault')}</option>
                        {easeProfiles?.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.name} (v{profile.version})
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setStep('transform')}
                          className="flex-1 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                        >
                          {t('nextTransforms')}
                        </button>
                        <button
                          onClick={handleGenerate}
                          disabled={generatePattern.isPending}
                          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-green-500 disabled:opacity-50"
                        >
                          {generatePattern.isPending ? t('generating') : t('generate')}
                        </button>
                      </div>
                    </div>
                  )}

                {step === 'transform' && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-200">
                      7. {t('transformPipelines')}
                    </h3>
                    <div className="space-y-2">
                      {transformPipelines?.map((pipeline) => (
                        <label
                          key={pipeline.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTransforms.includes(pipeline.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTransforms([...selectedTransforms, pipeline.id]);
                              } else {
                                setSelectedTransforms(
                                  selectedTransforms.filter((id) => id !== pipeline.id)
                                );
                              }
                            }}
                            className="rounded border-slate-700"
                          />
                          {pipeline.name} (v{pipeline.version})
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={generatePattern.isPending}
                      className="mt-2 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-green-500 disabled:opacity-50"
                    >
                      {generatePattern.isPending ? t('generating') : t('generatePattern')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="mb-4 text-lg font-semibold">{t('patternPreview')}</h2>
              {patternResult?.exports?.svg?.content ? (
                <PatternViewer svgContent={patternResult.exports.svg.content} />
              ) : generatedPatternId ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  {t('loadingPattern')}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-slate-500">
                  {t('completeConfiguration')}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('patternHistory')}</h2>
            {patternHistory.length === 0 ? (
              <p className="text-sm text-slate-400">{t('noPatterns')}</p>
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
                          {t('version')} {pattern.version_index || '?'}
                        </span>
                        {pattern.tag && (
                          <span className="text-xs text-slate-500">({pattern.tag})</span>
                        )}
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            pattern.status === 'completed'
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-yellow-900/50 text-yellow-400'
                          }`}
                        >
                          {pattern.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {pattern.created_at
                          ? new Date(pattern.created_at).toLocaleString()
                          : 'Unknown date'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {pattern.has_result && (
                        <>
                          <button
                            onClick={() => handleExport(pattern.id, 'svg')}
                            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700"
                          >
                            SVG
                          </button>
                          <button
                            onClick={() => handleExport(pattern.id, 'dxf')}
                            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700"
                          >
                            DXF
                          </button>
                          <button
                            onClick={() => handleExport(pattern.id, 'pdf')}
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
                        {t('restore')}
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


