# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 PWA for mining workforce management called "Kestrel Mining." It's a client-side application that manages worker records, generates QR code passes, and provides a dashboard for workforce compliance and training management.

## Development Commands

- `npm run dev` - Start development server with Turbopack (faster builds)
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: Tabler (Bootstrap-based CSS framework)
- **Styling**: TailwindCSS v4 + Tabler CSS components
- **Icons**: Tabler Icons
- **QR Codes**: react-qr-code + qr-scanner
- **TypeScript**: Strict mode enabled
- **Fonts**: Inter (Google Fonts)

## Architecture

### Component Structure
- **Client-side only**: All components use "use client" directive
- **State management**: Local React state (no external state manager)
- **Data persistence**: Currently in-memory only (localStorage or external API integration needed for production)

### Core Components
- `page.tsx` - Main dashboard with worker statistics and management
- `WorkerCard.tsx` - Individual worker display with expandable details and QR pass access
- `AddWorkerForm.tsx` - Modal-style form for adding new workers with document upload
- `MinePass.tsx` - QR code generator modal for worker credentials
- `FileUpload.tsx` - Reusable drag-and-drop file upload component
- `DocumentCard.tsx` - Individual document display with expiry tracking
- `DocumentUpload.tsx` - Bulk document upload with metadata management
- `Navigation.tsx` - Top navigation bar with active route highlighting

### Data Interfaces
```typescript
interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
  documents?: WorkerDocument[];
}

interface WorkerDocument {
  id: string;
  name: string;
  type: "id" | "certification" | "training" | "medical" | "other";
  file: File;
  uploadedAt: string;
  expiryDate?: string;
  workerId?: string;
  workerName?: string;
  status: "valid" | "expiring" | "expired";
  fileSize: number;
  description?: string;
}
```

### CSS Framework Integration
- Uses Tabler CSS classes extensively (`.card`, `.btn`, `.badge`, `.avatar`, etc.)
- TailwindCSS for custom styling where needed
- Responsive grid system with Bootstrap-style columns

## Key Features

1. **Worker Management**: Add, view, and manage mining workforce with search and filtering
2. **Document Management**: Upload, categorize, and track worker documents with expiry monitoring
3. **QR Code Passes**: Generate scannable mine passes for worker verification
4. **Status Tracking**: Real-time worker status (active/pending/inactive)
5. **File Upload System**: Drag-and-drop file uploads with validation and metadata
6. **Navigation System**: Multi-page navigation (Dashboard, Workers, Documents)
7. **Responsive Design**: Mobile-first approach for mining site usage

### Document Features
- **Document Types**: ID, Certification, Training, Medical, Other
- **Expiry Tracking**: Automatic status calculation (valid/expiring/expired)
- **Bulk Upload**: Multiple file upload with individual metadata
- **File Validation**: Type and size restrictions (PDF, images, Office docs up to 10MB)
- **Worker Integration**: Link documents to specific workers
- **Search & Filter**: By document type, status, worker, and content

## Development Notes

- **Path Alias**: `@/*` maps to `./src/*`
- **ESLint Config**: Uses Next.js recommended rules with TypeScript support
- **No Backend**: Currently a frontend-only application with sample data
- **PWA Ready**: Designed as PWA for offline mining site usage (service worker not yet implemented)

## Styling Conventions

- Primary UI framework is Tabler (not pure Bootstrap)
- Use Tabler component classes: `.card`, `.btn`, `.modal`, `.avatar`
- TailwindCSS for spacing and custom styles
- Consistent color scheme: blue primary, success/warning/danger status colors