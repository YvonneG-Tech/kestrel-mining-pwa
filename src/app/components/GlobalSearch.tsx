"use client";
import { useState, useEffect, useRef } from "react";
import { WorkerDocument } from "../documents/page";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
  department?: string;
}

interface SearchResult {
  id: string;
  type: "worker" | "document" | "scanner";
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  relevance: number;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  workers?: Worker[];
  documents?: WorkerDocument[];
  scanHistory?: any[];
}

export default function GlobalSearch({ workers = [], documents = [], scanHistory = [] }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to open search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery("");
        setResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle search input
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults = performSearch(query);
    setResults(searchResults);
    setActiveIndex(0);
    setIsLoading(false);
  }, [query, workers, documents, scanHistory]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (results[activeIndex]) {
            handleResultClick(results[activeIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex]);

  const performSearch = (searchQuery: string): SearchResult[] => {
    const query = searchQuery.toLowerCase().trim();
    const allResults: SearchResult[] = [];

    // Search workers
    workers.forEach(worker => {
      const relevance = calculateRelevance(query, [
        worker.name,
        worker.employeeId,
        worker.role,
        worker.department || "",
        worker.status
      ]);

      if (relevance > 0) {
        allResults.push({
          id: worker.id,
          type: "worker",
          title: worker.name,
          subtitle: `${worker.employeeId} • ${worker.role}`,
          description: `Status: ${worker.status.toUpperCase()} • Last seen: ${worker.lastSeen}`,
          url: `/workers?id=${worker.id}`,
          relevance,
          metadata: { status: worker.status, department: worker.department }
        });
      }
    });

    // Search documents
    documents.forEach(document => {
      const relevance = calculateRelevance(query, [
        document.name,
        document.type,
        document.workerName || "",
        document.description || "",
        document.status
      ]);

      if (relevance > 0) {
        allResults.push({
          id: document.id,
          type: "document",
          title: document.name,
          subtitle: `${document.type.toUpperCase()} • ${document.workerName || 'Unassigned'}`,
          description: document.description || `Status: ${document.status.toUpperCase()}`,
          url: `/documents?id=${document.id}`,
          relevance,
          metadata: { type: document.type, status: document.status }
        });
      }
    });

    // Search scan history
    scanHistory.forEach((scan, index) => {
      if (scan.worker) {
        const relevance = calculateRelevance(query, [
          scan.worker.name,
          scan.worker.employeeId,
          scan.location || "",
          scan.status
        ]);

        if (relevance > 0) {
          allResults.push({
            id: `scan-${index}`,
            type: "scanner",
            title: `Scan: ${scan.worker.name}`,
            subtitle: `${scan.worker.employeeId} • ${scan.location || 'Unknown location'}`,
            description: `${scan.status.toUpperCase()} • ${new Date(scan.timestamp).toLocaleString()}`,
            url: `/scanner?id=${scan.id}`,
            relevance,
            metadata: { status: scan.status, timestamp: scan.timestamp }
          });
        }
      }
    });

    // Sort by relevance and return top 10
    return allResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  };

  const calculateRelevance = (query: string, fields: string[]): number => {
    let score = 0;
    
    fields.forEach(field => {
      const fieldLower = field.toLowerCase();
      
      // Exact match gets highest score
      if (fieldLower === query) {
        score += 100;
      }
      // Starts with query gets high score
      else if (fieldLower.startsWith(query)) {
        score += 50;
      }
      // Contains query gets medium score
      else if (fieldLower.includes(query)) {
        score += 25;
      }
      // Word boundary match gets bonus
      else if (new RegExp(`\\b${query}`, 'i').test(fieldLower)) {
        score += 35;
      }
    });

    return score;
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the result
    window.location.href = result.url;
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "worker":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-primary" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
          </svg>
        );
      case "document":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-success" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
            <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
          </svg>
        );
      case "scanner":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-warning" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <rect x="4" y="4" width="6" height="6" rx="1"/>
            <rect x="4" y="14" width="6" height="6" rx="1"/>
            <rect x="14" y="4" width="6" height="6" rx="1"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-warning text-dark">{part}</mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        className="btn btn-outline-secondary"
        onClick={() => setIsOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <circle cx="10" cy="10" r="7"/>
          <path d="M21 21l-6 -6"/>
        </svg>
        Search...
        <kbd className="kbd ms-2">⌘K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="modal modal-blur show d-block">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-transparent border-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <circle cx="10" cy="10" r="7"/>
                      <path d="M21 21l-6 -6"/>
                    </svg>
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control bg-transparent border-0"
                    placeholder="Search workers, documents, and scans..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="btn btn-ghost-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    <kbd>Esc</kbd>
                  </button>
                </div>
              </div>

              <div className="modal-body pt-0" ref={resultsRef}>
                {isLoading && (
                  <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {!isLoading && query && results.length === 0 && (
                  <div className="empty">
                    <div className="empty-img">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" width="48" height="48" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="10" cy="10" r="7"/>
                        <path d="M21 21l-6 -6"/>
                      </svg>
                    </div>
                    <p className="empty-title">No results found</p>
                    <p className="empty-subtitle text-muted">
                      Try searching for workers, documents, or scan history
                    </p>
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="list-group list-group-flush">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        className={`list-group-item list-group-item-action d-flex align-items-center ${
                          index === activeIndex ? 'active' : ''
                        }`}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <div className="me-3">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-fill text-start">
                          <div className="fw-medium">
                            {highlightMatch(result.title, query)}
                          </div>
                          <div className="text-muted small">
                            {highlightMatch(result.subtitle, query)}
                          </div>
                          {result.description && (
                            <div className="text-muted small mt-1">
                              {highlightMatch(result.description, query)}
                            </div>
                          )}
                        </div>
                        <div className="ms-auto">
                          <span className={`badge badge-soft-${result.type === 'worker' ? 'primary' : result.type === 'document' ? 'success' : 'warning'}`}>
                            {result.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!query && (
                  <div className="text-center py-4">
                    <div className="text-muted">
                      <div className="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg text-muted" width="48" height="48" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <circle cx="10" cy="10" r="7"/>
                          <path d="M21 21l-6 -6"/>
                        </svg>
                      </div>
                      <div>Start typing to search across:</div>
                      <div className="mt-2">
                        <span className="badge bg-primary me-2">Workers</span>
                        <span className="badge bg-success me-2">Documents</span>
                        <span className="badge bg-warning">Scan History</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0">
                <div className="text-muted small">
                  <kbd>↑↓</kbd> to navigate • <kbd>Enter</kbd> to select • <kbd>Esc</kbd> to close
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="modal-backdrop show"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}