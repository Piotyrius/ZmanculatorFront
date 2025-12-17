"use client";

import {
  useEaseProfiles,
  useSizeProfiles,
  useTransformPipelines,
} from "../../../lib/configs";

export default function ProfilesPage() {
  const { data: sizeProfiles } = useSizeProfiles();
  const { data: easeProfiles } = useEaseProfiles();
  const { data: transformPipelines } = useTransformPipelines();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Fit & style presets
      </h1>
      <p className="text-sm text-slate-600">
        Browse available size profiles, ease profiles, and style transform
        pipelines for your drafting system.
      </p>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Size profiles
          </h2>
          {!sizeProfiles?.length && (
            <p className="text-slate-500">No size profiles configured.</p>
          )}
          <ul className="space-y-1">
            {sizeProfiles?.map((profile) => (
              <li key={profile.id} className="text-slate-700">
                {profile.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ease profiles
          </h2>
          {!easeProfiles?.length && (
            <p className="text-slate-500">No ease profiles configured.</p>
          )}
          <ul className="space-y-1">
            {easeProfiles?.map((profile) => (
              <li key={profile.id} className="text-slate-700">
                {profile.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Style pipelines
          </h2>
          {!transformPipelines?.length && (
            <p className="text-slate-500">No style pipelines configured.</p>
          )}
          <ul className="space-y-1">
            {transformPipelines?.map((pipeline) => (
              <li key={pipeline.id} className="text-slate-700">
                {pipeline.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

