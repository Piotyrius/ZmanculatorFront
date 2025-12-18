'use client';

import { useTranslations } from 'next-intl';

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
  const t = useTranslations('dashboard');

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-300">{t('sortBy')}:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
      >
        <option value="alphabetical-az">{t('sortAlphabeticalAZ')}</option>
        <option value="alphabetical-za">{t('sortAlphabeticalZA')}</option>
        <option value="date-newest">{t('sortDateNewest')}</option>
        <option value="date-oldest">{t('sortDateOldest')}</option>
        <option value="status">{t('sortByStatus')}</option>
      </select>
    </div>
  );
}



