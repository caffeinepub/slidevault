# PPT Share Hub

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- PowerPoint file upload and storage (admin only)
- A shareable QR code per presentation that links to a public request-to-view page
- Guest access request flow: guests scan QR code, fill in name/email, and submit a request to view a specific PPT
- Admin dashboard showing:
  - All uploaded presentations
  - All pending/approved/rejected view requests per presentation
  - Ability to approve or reject each request
- After approval, the guest gets a view page where they can download or view the PPT file
- Authorization: admin login to manage PPTs and requests; guests operate without login

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- Data models:
  - `Presentation`: id, title, description, fileId (blob), uploadedAt, ownerId
  - `ViewRequest`: id, presentationId, guestName, guestEmail, status (pending/approved/rejected), requestedAt
- API:
  - `uploadPresentation(title, description, fileBlob)` -- admin only
  - `getPresentations()` -- admin only, returns all presentations
  - `getPresentation(id)` -- returns metadata (public)
  - `submitViewRequest(presentationId, guestName, guestEmail)` -- public
  - `getViewRequests(presentationId)` -- admin only
  - `getAllViewRequests()` -- admin only
  - `approveRequest(requestId)` -- admin only
  - `rejectRequest(requestId)` -- admin only
  - `getApprovedPresentationUrl(requestId)` -- for approved guests to retrieve download

### Frontend
- Pages/Views:
  1. **Admin Login** -- login with Internet Identity
  2. **Admin Dashboard** -- list of uploaded PPTs with request counts; upload new PPT button
  3. **PPT Detail (Admin)** -- view requests table (pending/approved/rejected), approve/reject actions, QR code display for sharing
  4. **Public Request Page** (`/request/:presentationId`) -- shown when guest scans QR code; form to submit name + email
  5. **Request Submitted** -- confirmation page after guest submits request
  6. **Approved View Page** -- page for approved guests to view/download the PPT (guest enters their email to retrieve access)
- QR code generated in-browser from the public request URL
- Blob storage used for PPT files
- Authorization component for admin role
