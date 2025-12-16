"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  createProject,
  listProjects,
  listMeasurementProfiles,
  createMeasurementProfile,
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
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [measurementName, setMeasurementName] = useState("");
  const [measurementCategory, setMeasurementCategory] = useState("womenswear");
  const [measurementUnit, setMeasurementUnit] = useState("mm");
  const [measurementValues, setMeasurementValues] = useState<Record<string, number>>({
    chest: 0,
    waist: 0,
    hip: 0,
    shoulder_width: 0,
    back_length: 0,
  });

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

  const handleCreateMeasurementProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!measurementName.trim()) return;
    try {
      const profile = await createMeasurementProfile({
        name: measurementName.trim(),
        category: measurementCategory,
        unit: measurementUnit,
        values: measurementValues,
      });
      setProfiles((prev) => [profile, ...prev]);
      setShowMeasurementForm(false);
      setMeasurementName("");
      setMeasurementValues({
        chest: 0,
        waist: 0,
        hip: 0,
        shoulder_width: 0,
        back_length: 0,
      });
    } catch (error) {
      console.error("Failed to create measurement profile:", error);
      alert("Failed to create measurement profile. Please check the console for details.");
    }
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
                      <button
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        className="flex-1 text-left text-slate-200 transition hover:text-sky-400"
                      >
                        {project.name}
                      </button>
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
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">
                  Measurement profiles
                </h2>
                <button
                  onClick={() => setShowMeasurementForm(!showMeasurementForm)}
                  className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-sky-400"
                >
                  {showMeasurementForm ? "Cancel" : "+ New Profile"}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Saved body measurements will appear here. Use them across
                projects and garment categories.
              </p>

              {showMeasurementForm && (
                <form
                  onSubmit={handleCreateMeasurementProfile}
                  className="mt-4 space-y-3 rounded-lg border border-slate-700 bg-slate-950 p-4"
                >
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., My Measurements"
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                      value={measurementName}
                      onChange={(e) => setMeasurementName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">
                        Category
                      </label>
                      <select
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                        value={measurementCategory}
                        onChange={(e) => setMeasurementCategory(e.target.value)}
                      >
                        <option value="womenswear">Womenswear</option>
                        <option value="menswear">Menswear</option>
                        <option value="childrenswear">Childrenswear</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">
                        Unit
                      </label>
                      <select
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                        value={measurementUnit}
                        onChange={(e) => setMeasurementUnit(e.target.value)}
                      >
                        <option value="mm">Millimeters (mm)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="in">Inches (in)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-300">
                      Body Measurements ({measurementUnit})
                    </label>
                    {Object.entries(measurementValues).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <label className="w-32 text-xs text-slate-400 capitalize">
                          {key.replace("_", " ")}:
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none focus:border-sky-500"
                          value={value || ""}
                          onChange={(e) =>
                            setMeasurementValues({
                              ...measurementValues,
                              [key]: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-green-500"
                  >
                    Create Profile
                  </button>
                </form>
              )}

              <div className="mt-3 space-y-1 text-sm text-slate-300">
                {profiles.length === 0 && !showMeasurementForm ? (
                  <p className="text-slate-500">
                    No profiles yet. Click "+ New Profile" to create one.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {profiles.map((profile) => (
                      <li key={profile.id} className="flex items-center justify-between">
                        <span>
                          {profile.name}{" "}
                          <span className="text-xs text-slate-500">
                            ({profile.category})
                          </span>
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

