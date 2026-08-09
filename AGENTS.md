# CaliBro UI - AI Agent Guidelines & Component Standards

This directory contains the **CaliBro Angular 19/22 UI Application**.

## 🎨 UI/UX Design System & Rules

1. **100% Separate Files Rule**:
   - Every Angular component MUST have 3 separate files:
     - `name.component.ts`
     - `name.component.html`
     - `name.component.css`
   - Inline templates (`template: ...`) or inline styles (`styles: [...]`) are strictly forbidden.

2. **Typography Scale & Layout**:
   - Use compact navbar-scale typography (~13px font scale for inputs and table cells) to maximize data density and avoid vertical page scrolling.
   - Sidebar width is fixed at **$220\text{px}$** ($78\text{px}$ in collapsed mode).
   - Topbar height is **$70\text{px}$**.

3. **Status Badges Color Hierarchy**:
   - 🟢 **Success**: `p-tag-success` (`#10b981` green) -> *ACCEPTED, APPROVED, QUALIFIED, ACTIVE, DELIVERED, COMPLETED*.
   - 🟡 **Warning**: `p-tag-warning` (`#f59e0b` amber) -> *PENDING, QUOTED, QUEUED, DRAFT*.
   - 🔵 **Info**: `p-tag-info` (`#00f2fe` cyan) -> *OPEN, SENT, RECEIVED, DISPATCHED, IN-CALIBRATION*.
   - 🔴 **Danger**: `p-tag-danger` (`#ef4444` red) -> *REJECTED, EXPIRED, OVERDUE, INACTIVE*.

4. **Data Table Features**:
   - All data grids must include:
     - Per-column search filter textboxes (`.filter-input`).
     - Interactive column header sorting (`.sortable-header` + `pi-sort-amount-up-alt`).
     - Numbered pagination bar (`1, 2, 3... 100`) with active page highlight.
     - CSV export trigger (`exportToCsv()`).

5. **Toast Notifications**:
   - Inject `ToastService` for all CRUD actions:
     - `toastService.showSuccess(title, message)`
     - `toastService.showWarning(title, message)`
     - `toastService.showError(title, message)`
     - `toastService.showInfo(title, message)`

6. **Modal Overlays**:
   - Use universal modal card markup:
     ```html
     @if (showCreateModal) {
       <div class="modal-overlay" (click)="showCreateModal = false">
         <div class="modal-card" (click)="$event.stopPropagation()">
           ...
         </div>
       </div>
     }
     ```

---

## 🛠 Workflow for Adding New Views

1. Create component files in appropriate subdirectory (`components/transactions/`, `components/qc/`, `components/user-management/`, `components/masters/`).
2. Add route definition in `app.routes.ts` with `canActivate: [authGuard]`.
3. Add router link in `sidebar.component.html`.
4. Verify build with `npx ng build`.
