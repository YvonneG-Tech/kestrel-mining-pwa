"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./RoleBasedAccess";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/workers", label: "Workers", icon: "users" },
    { href: "/documents", label: "Documents", icon: "files" },
    { href: "/scanner", label: "Scanner", icon: "qr" },
  ];

  return (
    <div className="navbar navbar-expand-md navbar-light border-bottom">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand">
          <div className="d-flex align-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-lg me-2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="fw-bold">Kestrel Mining</span>
          </div>
        </Link>

        <div className="navbar-nav flex-fill">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <span className="nav-link-icon d-md-none d-lg-inline-block">
                  {item.icon === "dashboard" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <circle cx="12" cy="13" r="2" />
                      <line x1="13.45" y1="11.55" x2="15.5" y2="9.5" />
                      <path d="M6.4 20a9 9 0 1 1 11.2 0z" />
                    </svg>
                  )}
                  {item.icon === "users" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                    </svg>
                  )}
                  {item.icon === "files" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                      <path d="M9 9l1 0" />
                      <path d="M9 13l6 0" />
                      <path d="M9 17l6 0" />
                    </svg>
                  )}
                  {item.icon === "qr" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <rect x="4" y="4" width="6" height="6" rx="1" />
                      <rect x="4" y="14" width="6" height="6" rx="1" />
                      <rect x="14" y="4" width="6" height="6" rx="1" />
                      <rect x="14" y="14" width="6" height="6" rx="1" />
                    </svg>
                  )}
                </span>
                {item.label}
              </Link>
            );
          })}
          
          {/* Global Search - only show on larger screens */}
          <div className="d-none d-md-block">
            <div className="nav-item">
              <div className="nav-link p-0">
                <div id="global-search-placeholder">
                  {/* GlobalSearch will be mounted here by pages */}
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Menu */}
          <div className="nav-item dropdown ms-auto">
            <button
              className="nav-link dropdown-toggle d-flex align-items-center"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
            >
              <span className="avatar avatar-sm me-2 bg-primary text-white">
                {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              </span>
              <div className="d-none d-md-block">
                <div className="fw-medium">{user?.name || 'User'}</div>
                <div className="text-muted small">{user?.role || 'User'}</div>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="dropdown-menu dropdown-menu-end show">
                <div className="dropdown-item-text">
                  <div className="fw-medium">{user?.name}</div>
                  <div className="text-muted small">{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                {can("system", "manage") && (
                  <Link href="/admin/roles" className="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon dropdown-item-icon" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <circle cx="12" cy="7" r="4"/>
                      <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                    </svg>
                    Role Management
                  </Link>
                )}
                <Link href="/profile" className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon dropdown-item-icon" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                  </svg>
                  Profile Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon dropdown-item-icon" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/>
                    <path d="M7 12h14l-3 -3m0 6l3 -3"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}