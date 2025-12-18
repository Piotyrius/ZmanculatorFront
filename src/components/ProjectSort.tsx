'use client';

export type SortOption =
  | 'alphabetical-az'
  | 'alphabetical-za'
  | 'date-newest'
  | 'date-oldest'
  | 'status';

interface ProjectSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function ProjectSort({ value, onChange }: ProjectSortProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-300">Sort by:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
      >
        <option value="alphabetical-az">Alphabetical (A–Z)</option>
        <option value="alphabetical-za">Alphabetical (Z–A)</option>
        <option value="date-newest">Date created (newest)</option>
        <option value="date-oldest">Date created (oldest)</option>
        <option value="status">Status</option>
      </select>
    </div>
  );
}





