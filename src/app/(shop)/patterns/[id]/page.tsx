"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PatternViewer from "../../../../components/PatternViewer";
import {
  exportPatternFile,
  usePatternResult,
} from "../../../../lib/patterns";

export default function PatternDetailPage() {
  const params = useParams();
  const idParam = params.id as string;
  const patternId = useMemo(
    () => Number.parseInt(idParam, 10),
    [idParam],
  );

  const { data: result, isLoading, error } = usePatternResult(
    Number.isNaN(patternId) ? null : patternId,
  );
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(
    null,
  );

  const svgContent =
    result && result.exports && "svg" in result.exports
      ? (result.exports.svg as any).content
      : null;

  const availableFormats = result
    ? Object.keys(result.exports ?? {})
    : [];

  const handleExport = async (format: string) => {
    if (!patternId) return;
    try {
      setDownloadingFormat(format);
      const blob = await exportPatternFile(patternId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pattern_${patternId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Pattern #{patternId}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            View the generated technical draft, inspect exports, and move
            between pattern versions from your projects.
          </p>
        </div>
      </header>

      {isLoading && (
        <p className="text-sm text-slate-600">Loading pattern…</p>
      )}
      {error && (
        <p className="text-sm text-red-600">
          Failed to load pattern result.
        </p>
      )}

      {result && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            {svgContent ? (
              <PatternViewer svgContent={svgContent} />
            ) : (
              <p className="text-sm text-slate-600">
                This pattern does not have an SVG export yet.
              </p>
            )}
          </section>

          <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm text-slate-700">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Metadata
              </h2>
              <dl className="mt-2 space-y-1 text-xs text-slate-700">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Pattern ID</dt>
                  <dd>{result.pattern_id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Result ID</dt>
                  <dd>{result.id}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Exports
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {availableFormats.length === 0 && (
                  <span className="text-slate-9000">
                    No exports available for this pattern.
                  </span>
                )}
                {availableFormats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleExport(fmt)}
                    disabled={!!downloadingFormat}
                    className="rounded-md border border-slate-300 bg-sky-500 px-3 py-1 text-xs text-white shadow-sm hover:border-sky-600 hover:bg-sky-600 disabled:opacity-40"
                  >
                    {downloadingFormat === fmt
                      ? `Downloading ${fmt.toUpperCase()}…`
                      : fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

