"use client";
import { Protected, RoleManager } from "../../components/RoleBasedAccess";

export default function RoleManagementPage() {
  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="page-header d-print-none">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">Role Management</h2>
              <div className="page-subtitle">Manage user roles and permissions</div>
            </div>
          </div>
        </div>

        <div className="row row-deck row-cards">
          <div className="col-12">
            <Protected resource="system" action="manage">
              <RoleManager />
            </Protected>
          </div>
        </div>
      </div>
    </div>
  );
}