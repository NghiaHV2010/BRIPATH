import CompanyCard from './CompanyCard';
import type { CompanySummary } from '../../types/company';

interface CompanyListProps {
  companies: CompanySummary[];
  onCompanyClick?: (companyId: string) => void;
}

export default function CompanyList({ companies, onCompanyClick }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Companies Found</h3>
        <p className="text-slate-600 max-w-md">
          Try adjusting your filters or search criteria to find more companies.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onClick={() => onCompanyClick?.(company.id)}
        />
      ))}
    </div>
  );
}
