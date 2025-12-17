"use client";

import { useState } from "react";
import {
  useCreateMeasurementProfile,
  useMeasurementProfiles,
} from "../../../lib/projects";

export default function MeasurementsPage() {
  const { data: profiles, isLoading } = useMeasurementProfiles();
  const createProfile = useCreateMeasurementProfile();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("womenswear");
  const [unit, setUnit] = useState("mm");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createProfile.mutateAsync({
      name: name.trim(),
      category,
      unit,
      values: {},
    });
    setName("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Measurement profiles
      </h1>
      <p className="text-sm text-slate-600">
        Create and manage reusable body measurement profiles for different
        clients and body categories.
      </p>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          New profile
        </h2>
        <div className="flex flex-wrap items-end gap-2 text-xs">
          <div className="flex-1 space-y-1">
            <label className="block text-[11px] text-slate-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="w-40 space-y-1">
            <label className="block text-[11px] text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="womenswear">Womenswear</option>
              <option value="menswear">Menswear</option>
              <option value="childrenswear">Childrenswear</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div className="w-24 space-y-1">
            <label className="block text-[11px] text-slate-700">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-600"
          >
            Save
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Saved profiles
        </h2>
        {isLoading && (
          <p className="text-xs text-slate-600">Loading profiles…</p>
        )}
        {!isLoading && !profiles?.length && (
          <p className="text-xs text-slate-600">
            No measurement profiles yet. Create your first profile above.
          </p>
        )}
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {profiles?.map((profile) => (
            <div
              key={profile.id}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-900">
                {profile.name}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-600">
                {profile.category} · {profile.unit}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

