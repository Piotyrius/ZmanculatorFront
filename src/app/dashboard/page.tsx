"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  createProject,
  listProjects,
  listMeasurementProfiles,
  type Project,
  type MeasurementProfile,
} from "../../lib/projects";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    const load = async () => {
      try {
        const [proj, prof] = await Promise.all([
          listProjects(),
          listMeasurementProfiles(),
        ]);
        setProjects(proj);
        setProfiles(prof);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectName.trim()) return;
    const project = await createProject(projectName.trim());
    setProjects((prev) => [project, ...prev]);
    setProjectName("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Universal Garment Pattern Studio
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Measurements → projects → patterns → exports.
            </p>
          </div>
        </header>

        <main className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-sm font-semibold text-slate-200">
              Projects
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Create and manage pattern projects.
            </p>

            <form
              onSubmit={handleCreateProject}
              className="mt-4 flex flex-wrap items-center gap-3"
            >
              <input
                type="text"
                placeholder="New project name"
                className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400"
              >
                Create
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {loading ? (
                <p className="text-sm text-slate-400">Loading projects…</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No projects yet. Create your first project to begin.
                </p>
              ) : (
                <ul className="divide-y divide-slate-800 text-sm">
                  {projects.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span>{project.name}</span>
                      <span className="text-xs uppercase text-slate-500">
                        {project.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-sm font-semibold text-slate-200">
                Measurement profiles
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Saved body measurements will appear here. Use them across
                projects and garment categories.
              </p>
              <div className="mt-3 space-y-1 text-sm text-slate-300">
                {profiles.length === 0 ? (
                  <p className="text-slate-500">
                    No profiles yet. A profile editor will be added in the next
                    step.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {profiles.map((profile) => (
                      <li key={profile.id}>
                        {profile.name}{" "}
                        <span className="text-xs text-slate-500">
                          ({profile.category})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-sm font-semibold text-slate-200">
                Subscription
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Your current capabilities will appear here once the subscription
                API is wired.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

