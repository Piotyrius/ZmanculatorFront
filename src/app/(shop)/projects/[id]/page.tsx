"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useProjectPatterns,
  useProjects,
  restorePatternVersion,
} from "../../../../lib/projects";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number.parseInt(params.id as string, 10);

  const { data: projects } = useProjects();
  const { data: patterns } = useProjectPatterns(
    Number.isNaN(projectId) ? null : projectId,
  );

  const project = projects?.find((p) => p.id === projectId);

  const handleRestore = async (patternId: number) => {
    await restorePatternVersion(patternId);
    // Rely on react-query refetch on focus; UX polish step can add explicit refetch.
  };

  if (!project) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Project not found
        </h1>
        <Link
          href="/projects"
          className="text-sm text-sky-600 hover:text-sky-700"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {project.name}
          </h1>
          <p className="text-sm text-slate-600">
            Version history for patterns generated in this project.
          </p>
        </div>
        <Link
          href="/projects"
          className="text-xs text-sky-600 hover:text-sky-700"
        >
          Back to projects
        </Link>
      </header>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Pattern history
        </h2>
        {!patterns?.length && (
          <p className="text-xs text-slate-600">
            No patterns generated for this project yet.
          </p>
        )}
        <div className="mt-2 space-y-2">
          {patterns?.map((pattern) => (
            <div
              key={pattern.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs shadow-sm"
            >
              <div>
                <div className="font-semibold">
                  Version {pattern.version_index}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-600">
                  Status: {pattern.status}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/patterns/${pattern.id}`}
                  className="rounded-md border border-slate-300 bg-sky-500 px-2 py-1 text-[11px] text-white shadow-sm hover:border-sky-600 hover:bg-sky-600"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => handleRestore(pattern.id)}
                  className="rounded-md border border-slate-300 bg-sky-500 px-2 py-1 text-[11px] text-white shadow-sm hover:border-sky-600 hover:bg-sky-600"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


