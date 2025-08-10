"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define user roles and their permissions
export type UserRole = "Super Admin" | "Admin" | "Supervisor" | "Safety Officer" | "User" | "Viewer";

export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete" | "export" | "manage")[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  permissions?: Permission[];
  lastLogin?: string;
  status: "active" | "inactive" | "suspended";
}

// Role-based permissions matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  "Super Admin": [
    { resource: "*", actions: ["create", "read", "update", "delete", "export", "manage"] }
  ],
  "Admin": [
    { resource: "workers", actions: ["create", "read", "update", "delete", "export"] },
    { resource: "documents", actions: ["create", "read", "update", "delete", "export"] },
    { resource: "scanner", actions: ["read", "export"] },
    { resource: "audit", actions: ["read", "export"] },
    { resource: "reports", actions: ["create", "read", "export"] },
    { resource: "system", actions: ["read", "update"] }
  ],
  "Supervisor": [
    { resource: "workers", actions: ["create", "read", "update", "export"] },
    { resource: "documents", actions: ["create", "read", "update", "export"] },
    { resource: "scanner", actions: ["read"] },
    { resource: "reports", actions: ["read", "export"] }
  ],
  "Safety Officer": [
    { resource: "workers", actions: ["read", "update"] },
    { resource: "documents", actions: ["create", "read", "update", "export"] },
    { resource: "scanner", actions: ["read"] },
    { resource: "reports", actions: ["read", "export"] }
  ],
  "User": [
    { resource: "workers", actions: ["read"] },
    { resource: "documents", actions: ["read"] },
    { resource: "scanner", actions: ["read"] }
  ],
  "Viewer": [
    { resource: "workers", actions: ["read"] },
    { resource: "documents", actions: ["read"] },
    { resource: "scanner", actions: ["read"] }
  ]
};

// Authentication Context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  can: (resource: string, action: string) => boolean;
  cannot: (resource: string, action: string) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Sample users for demonstration
const DEMO_USERS: User[] = [
  {
    id: "1",
    name: "System Administrator",
    email: "admin@kestrelmining.com",
    role: "Super Admin",
    department: "IT",
    lastLogin: new Date().toISOString(),
    status: "active"
  },
  {
    id: "2", 
    name: "Site Manager",
    email: "manager@kestrelmining.com",
    role: "Admin",
    department: "Operations",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "3",
    name: "Team Supervisor",
    email: "supervisor@kestrelmining.com", 
    role: "Supervisor",
    department: "Mining",
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "4",
    name: "Safety Coordinator",
    email: "safety@kestrelmining.com",
    role: "Safety Officer",
    department: "Safety",
    lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "5",
    name: "Field Worker",
    email: "worker@kestrelmining.com",
    role: "User",
    department: "Operations",
    lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: "active"
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('current-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('current-user');
      }
    } else {
      // Auto-login as Admin for demo purposes
      const demoUser = DEMO_USERS[1]; // Site Manager
      setUser(demoUser);
      localStorage.setItem('current-user', JSON.stringify(demoUser));
    }
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    const foundUser = DEMO_USERS.find(u => u.email === email);
    
    if (foundUser && foundUser.status === "active") {
      const userWithLastLogin = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      
      setUser(userWithLastLogin);
      localStorage.setItem('current-user', JSON.stringify(userWithLastLogin));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current-user');
  };

  const getUserPermissions = (user: User): Permission[] => {
    // Get base role permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Merge with any custom user permissions
    const customPermissions = user.permissions || [];
    
    // Combine permissions (custom permissions take precedence)
    const allPermissions = [...rolePermissions];
    
    customPermissions.forEach(customPerm => {
      const existingIndex = allPermissions.findIndex(p => p.resource === customPerm.resource);
      if (existingIndex >= 0) {
        // Merge actions
        const combinedActions = Array.from(new Set([
          ...allPermissions[existingIndex].actions,
          ...customPerm.actions
        ]));
        allPermissions[existingIndex] = {
          ...allPermissions[existingIndex],
          actions: combinedActions
        };
      } else {
        allPermissions.push(customPerm);
      }
    });
    
    return allPermissions;
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    const permissions = getUserPermissions(user);
    
    // Check for wildcard permission (Super Admin)
    const wildcardPerm = permissions.find(p => p.resource === "*");
    if (wildcardPerm && wildcardPerm.actions.includes(action as Permission['actions'][number])) {
      return true;
    }
    
    // Check specific resource permission
    const resourcePerm = permissions.find(p => p.resource === resource);
    if (resourcePerm && resourcePerm.actions.includes(action as Permission['actions'][number])) {
      return true;
    }
    
    return false;
  };

  const can = (resource: string, action: string): boolean => {
    return hasPermission(resource, action);
  };

  const cannot = (resource: string, action: string): boolean => {
    return !hasPermission(resource, action);
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    can,
    cannot,
    isRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes/components
interface ProtectedProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
  roles?: UserRole[];
}

export function Protected({ 
  children, 
  resource, 
  action, 
  fallback, 
  roles 
}: ProtectedProps) {
  const { can, isRole } = useAuth();
  
  // Check role-based access if roles are specified
  if (roles && !isRole(roles)) {
    return (
      <div className="alert alert-warning">
        <div className="d-flex">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <circle cx="12" cy="12" r="9"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <h4 className="alert-title">Access Restricted</h4>
            <div className="text-muted">
              This feature is only available to {roles.join(", ")} users.
            </div>
          </div>
        </div>
      </div>
    ) || fallback || null;
  }
  
  // Check permission-based access
  if (!can(resource, action)) {
    return (
      <div className="alert alert-danger">
        <div className="d-flex">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>
          <div>
            <h4 className="alert-title">Insufficient Permissions</h4>
            <div className="text-muted">
              You don&apos;t have permission to {action} {resource}. Contact your administrator if you need access.
            </div>
          </div>
        </div>
      </div>
    ) || fallback || null;
  }
  
  return <>{children}</>;
}

// Role management component for admins
export function RoleManager() {
  const { user, can } = useAuth();
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  if (!can("system", "manage")) {
    return (
      <div className="alert alert-warning">
        <h4 className="alert-title">Access Denied</h4>
        <div className="text-muted">You don&apos;t have permission to manage user roles.</div>
      </div>
    );
  }

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      "Super Admin": "bg-danger",
      "Admin": "bg-primary",
      "Supervisor": "bg-info",
      "Safety Officer": "bg-warning",
      "User": "bg-success",
      "Viewer": "bg-secondary"
    };
    return colors[role];
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Role Management</h3>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-vcenter">
            <thead>
              <tr>
                <th>User</th>
                <th>Department</th>
                <th>Current Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-sm me-2 bg-secondary text-white">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </span>
                      <div>
                        <div className="fw-medium">{u.name}</div>
                        <div className="text-muted small">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.department || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getRoleBadgeColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted small">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      u.status === 'active' ? 'bg-success' : 
                      u.status === 'suspended' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {u.id !== user?.id && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowRoleModal(true);
                        }}
                      >
                        Edit Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Edit Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal modal-blur show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit User Role</h4>
                <button
                  className="btn-close"
                  onClick={() => setShowRoleModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">User</label>
                  <div className="form-control-plaintext fw-bold">
                    {selectedUser.name}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Current Role</label>
                  <div className="form-control-plaintext">
                    <span className={`badge ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Select New Role</label>
                  <div className="form-selectgroup">
                    {Object.keys(ROLE_PERMISSIONS).map((role) => (
                      <label key={role} className="form-selectgroup-item">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          className="form-selectgroup-input"
                          defaultChecked={role === selectedUser.role}
                        />
                        <span className="form-selectgroup-label">
                          <span className={`badge ${getRoleBadgeColor(role as UserRole)} me-2`}>
                            {role}
                          </span>
                          <div className="small text-muted">
                            {ROLE_PERMISSIONS[role as UserRole].length} permissions
                          </div>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="alert alert-info">
                  <h4 className="alert-title">Role Permissions</h4>
                  <div className="text-muted">
                    Different roles have different levels of access to system features. 
                    Choose carefully as this affects what the user can see and do.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const form = new FormData(document.querySelector('form') as HTMLFormElement);
                    const newRole = form.get('role') as UserRole;
                    if (newRole && selectedUser) {
                      updateUserRole(selectedUser.id, newRole);
                    }
                  }}
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}