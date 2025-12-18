/* Non-i18n dashboard page.
 * Lists projects and measurement profiles and links into the project workspace.
 */
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import {
  createProject,
  listProjects,
  listMeasurementProfiles,
  createMeasurementProfile,
  type Project,
  type MeasurementProfile,
} from '../../lib/projects';
import ProjectSort, { type SortOption } from '../../components/ProjectSort';
import ClothingImage from '../../components/ClothingImage';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [measurementName, setMeasurementName] = useState('');
  const [measurementCategory, setMeasurementCategory] = useState('womenswear');
  const [measurementUnit, setMeasurementUnit] = useState('mm');
  const [measurementValues, setMeasurementValues] = useState<Record<string, number>>({
    chest: 0,
    waist: 0,
    hip: 0,
    shoulder_width: 0,
    back_length: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
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

  useEffect(() => {
    // Load sort preference from localStorage
    if (typeof window === 'undefined') return;
    const savedSort = window.localStorage.getItem('projectSort');
    if (savedSort) {
      setSortOption(savedSort as SortOption);
    }
  }, []);

  useEffect(() => {
    // Save sort preference to localStorage
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('projectSort', sortOption);
  }, [sortOption]);

  if (!isAuthenticated) {
    return null;
  }

  const sortProjects = (list: Project[], option: SortOption): Project[] => {
    const sorted = [...list];
    switch (option) {
      case 'alphabetical-az':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'alphabetical-za':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'date-newest':
        return sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      case 'date-oldest':
        return sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return sorted;
    }
  };

  const sortedProjects = sortProjects(projects, sortOption);

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectName.trim()) return;
    const project = await createProject(projectName.trim());
    setProjects((prev) => [project, ...prev]);
    setProjectName('');
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
      setMeasurementName('');
      setMeasurementValues({
        chest: 0,
        waist: 0,
        hip: 0,
        shoulder_width: 0,
        back_length: 0,
      });
    } catch (error) {
      console.error('Failed to create measurement profile:', error);
      window.alert('Failed to create measurement profile. Please check the console for details.');
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your pattern projects and measurement profiles.
          </p>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
              <ProjectSort value={sortOption} onChange={setSortOption} />
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Create and organize projects to generate and track garment patterns.
            </p>

            <form
              onSubmit={handleCreateProject}
              className="mb-6 flex flex-wrap items-center gap-3"
            >
              <input
                type="text"
                placeholder="New project name"
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-md bg-sky-500 px-6 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400"
              >
                Create
              </button>
            </form>

            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Loading projects…</p>
              ) : sortedProjects.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No projects yet. Create your first project above.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {sortedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-500/40 hover:bg-slate-50"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <ClothingImage
                          src={project.image_url}
                          category={project.category}
                          alt={project.name}
                          size="sm"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 group-hover:text-sky-600 transition">
                            {project.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs uppercase text-slate-500">
                              {project.status}
                            </span>
                            {project.created_at && (
                              <span className="text-xs text-slate-500">
                                {new Date(project.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Measurement profiles
              </h2>
              <button
                onClick={() => setShowMeasurementForm(!showMeasurementForm)}
                className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-sky-400"
              >
                {showMeasurementForm ? 'Cancel' : '+ New profile'}
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Save reusable body measurements to quickly configure new projects.
            </p>

            {showMeasurementForm && (
              <form
                onSubmit={handleCreateMeasurementProfile}
                className="mt-4 space-y-3 rounded-lg border border-slate-300 bg-slate-50 p-4"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Profile name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Client A – womenswear"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    value={measurementName}
                    onChange={(e) => setMeasurementName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Category
                    </label>
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      value={measurementCategory}
                      onChange={(e) => setMeasurementCategory(e.target.value)}
                    >
                      <option value="womenswear">Womenswear</option>
                      <option value="menswear">Menswear</option>
                      <option value="childrenswear">Childrenswear</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Unit
                    </label>
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
                  <label className="block text-xs font-medium text-slate-700">
                    Body measurements ({measurementUnit})
                  </label>
                  {Object.entries(measurementValues).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="w-32 text-xs text-slate-500 capitalize">
                        {key.replace('_', ' ')}:
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        value={value || ''}
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
                  Create profile
                </button>
              </form>
            )}

            <div className="mt-3 space-y-1 text-sm text-slate-800">
              {profiles.length === 0 && !showMeasurementForm ? (
                <p className="text-slate-500">No profiles yet.</p>
              ) : (
                <ul className="space-y-1">
                  {profiles.map((profile) => (
                    <li key={profile.id} className="flex items-center justify-between">
                      <span>
                        {profile.name}{' '}
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Subscription</h2>
            <p className="mt-1 text-sm text-slate-600">
              Subscription and billing will be added later. For now, enjoy unlimited
              access during the beta.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

