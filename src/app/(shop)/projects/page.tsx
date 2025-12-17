"use client";

import Link from "next/link";
import { useProjects } from "../../../lib/projects";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-600">
            Each project groups pattern versions for a garment or client.
          </p>
        </div>
      </header>

      {isLoading && (
        <p className="text-sm text-slate-600">Loading projects…</p>
      )}

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm hover:border-sky-500 hover:shadow-md transition"
          >
            <div className="text-sm font-semibold text-slate-900">
              {project.name}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Status: {project.status}
            </div>
          </Link>
        ))}
        {!isLoading && !projects?.length && (
          <p className="text-sm text-slate-600">
            No projects yet. Create a project from the configuration flow when
            generating your first pattern.
          </p>
        )}
      </section>
    </div>
  );
}

