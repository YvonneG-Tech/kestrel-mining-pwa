"use client";
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        // Check if sign in was successful
        const session = await getSession();
        if (session) {
          router.push('/');
        }
      }
    } catch {
      setError('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@kestrelmining.com', password: 'admin123' },
    { role: 'Supervisor', email: 'supervisor@kestrelmining.com', password: 'supervisor123' },
    { role: 'User', email: 'user@kestrelmining.com', password: 'user123' },
  ];

  return (
    <div className="page page-center">
      <div className="container container-tight py-4">
        <div className="card card-md">
          <div className="card-body">
            <h2 className="h2 text-center mb-4">
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
              Kestrel Mining
            </h2>
            <p className="text-muted mb-4 text-center">
              Sign in to access the workforce management system
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="form-footer">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Demo Credentials */}
          <div className="card-footer">
            <div className="text-center">
              <small className="text-muted">Demo Credentials:</small>
            </div>
            <div className="row g-2 mt-2">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="col-4">
                  <div 
                    className="card card-link cursor-pointer"
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.password);
                    }}
                  >
                    <div className="card-body p-2 text-center">
                      <div className="small fw-bold">{cred.role}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        Click to fill
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-muted mt-3">
          Workforce Management System for Australian Mining Operations
        </div>
      </div>
    </div>
  );
}