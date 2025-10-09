import { useState, useEffect } from "react";
import { Search, MapPin, Building, Filter, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface CompanyFiltersProps {
  onFilter: (filters: {
    name?: string;
    location?: string;
    field?: string;
  }) => void;
  onReset: () => void;
}

export interface CompanyFilterValues {
  name: string;
  location: string;
  field: string;
}

export default function CompanyFilters({
  onFilter,
  onReset,
}: CompanyFiltersProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [field, setField] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFilter({
      name: name.trim() || undefined,
      location: location.trim() || undefined,
      field: field.trim() || undefined,
    });
  };

  // Auto-filter on change instead of waiting for submit
  const handleInputChange = (
    field: "name" | "location" | "field",
    value: string
  ) => {
    const updates = { name, location, field, [field]: value };

    if (field === "name") setName(value);
    if (field === "location") setLocation(value);
    if (field === "field") setField(value);

    // Debounce for name field, immediate for dropdowns
    if (field === "name") {
      // Implement debounce later if needed
      setTimeout(() => {
        onFilter({
          name: value.trim() || undefined,
          location: updates.location.trim() || undefined,
          field: updates.field.trim() || undefined,
        });
      }, 500);
    } else {
      onFilter({
        name: updates.name.trim() || undefined,
        location: value.trim() || undefined,
        field: updates.field.trim() || undefined,
      });
    }
  };

  const handleReset = () => {
    setName("");
    setLocation("");
    setField("");
    onReset();
  };

  const hasActiveFilters = name || location || field;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Lọc công ty</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Company name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Field/Industry..."
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </form>
  );
}
