"use client";
import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
  value: string | number | boolean;
  type: "text" | "select" | "date" | "checkbox" | "range";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  icon?: React.ReactNode;
  filters: FilterOption[];
}

interface AdvancedFiltersProps {
  filterGroups: FilterGroup[];
  onFiltersChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}

export default function AdvancedFilters({ filterGroups, onFiltersChange, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const updateFilter = (filterId: string, value: any) => {
    const newFilters = { ...activeFilters, [filterId]: value };
    
    // Remove empty/default values
    if (value === "" || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId];
    }
    
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const resetFilters = () => {
    setActiveFilters({});
    onReset();
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const renderFilter = (filter: FilterOption) => {
    const currentValue = activeFilters[filter.id] || "";

    switch (filter.type) {
      case "text":
        return (
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder={`Enter ${filter.label.toLowerCase()}...`}
            value={currentValue}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
          />
        );

      case "select":
        return (
          <select
            className="form-select form-select-sm"
            value={currentValue}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            className="form-control form-control-sm"
            value={currentValue}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
          />
        );

      case "checkbox":
        return (
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={currentValue === true}
              onChange={(e) => updateFilter(filter.id, e.target.checked)}
            />
            <label className="form-check-label">
              {filter.label}
            </label>
          </div>
        );

      case "range":
        return (
          <div className="row g-1">
            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Min"
                min={filter.min}
                max={filter.max}
                value={currentValue.min || ""}
                onChange={(e) => updateFilter(filter.id, { 
                  ...currentValue, 
                  min: e.target.value ? parseInt(e.target.value) : null 
                })}
              />
            </div>
            <div className="col-6">
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Max"
                min={filter.min}
                max={filter.max}
                value={currentValue.max || ""}
                onChange={(e) => updateFilter(filter.id, { 
                  ...currentValue, 
                  max: e.target.value ? parseInt(e.target.value) : null 
                })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <button
        className="btn btn-outline-secondary position-relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M5.5 5h13a1 1 0 0 1 .5 1.5L14 12L14 19L10 16L10 12L5.5 6.5a1 1 0 0 1 .5 -1.5"/>
        </svg>
        Advanced Filters
        {getActiveFilterCount() > 0 && (
          <span className="badge bg-primary ms-2">
            {getActiveFilterCount()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu dropdown-menu-end show" style={{ width: "400px", maxHeight: "500px", overflow: "auto" }}>
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <span>Advanced Filters</span>
            <div>
              {getActiveFilterCount() > 0 && (
                <button 
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              )}
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {filterGroups.map((group) => (
            <div key={group.id} className="mb-3">
              <button
                className="dropdown-item d-flex align-items-center justify-content-between p-2"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="d-flex align-items-center">
                  {group.icon && <span className="me-2">{group.icon}</span>}
                  <span className="fw-medium">{group.label}</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`icon transition-transform ${expandedGroups.has(group.id) ? 'rotate-90' : ''}`} 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2" 
                  stroke="currentColor" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <polyline points="9,6 15,12 9,18"/>
                </svg>
              </button>

              {expandedGroups.has(group.id) && (
                <div className="px-3 pb-2">
                  {group.filters.map((filter) => (
                    <div key={filter.id} className="mb-3">
                      {filter.type !== "checkbox" && (
                        <label className="form-label small fw-medium mb-1">
                          {filter.label}
                        </label>
                      )}
                      {renderFilter(filter)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {getActiveFilterCount() > 0 && (
            <>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item-text">
                <div className="small text-muted mb-2">Active Filters:</div>
                <div className="d-flex flex-wrap gap-1">
                  {Object.entries(activeFilters).map(([filterId, value]) => {
                    const filter = filterGroups
                      .flatMap(g => g.filters)
                      .find(f => f.id === filterId);
                    
                    if (!filter) return null;
                    
                    let displayValue = value;
                    if (filter.type === "select") {
                      const option = filter.options?.find(o => o.value === value);
                      displayValue = option?.label || value;
                    } else if (filter.type === "checkbox") {
                      displayValue = value ? "Yes" : "No";
                    } else if (filter.type === "range") {
                      displayValue = `${value.min || ""}–${value.max || ""}`;
                    }
                    
                    return (
                      <span key={filterId} className="badge bg-primary">
                        {filter.label}: {displayValue}
                        <button
                          className="btn-close btn-close-white ms-1"
                          style={{ fontSize: "0.5em" }}
                          onClick={() => updateFilter(filterId, null)}
                        />
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="dropdown-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}