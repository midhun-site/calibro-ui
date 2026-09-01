import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService, DepartmentLookup, DesignationLookup, RoleLookup, Branch } from '../../services/api.service';
import { UserService, UserRow, CreateUserPayload, UpdateUserPayload } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { DataGridState } from '../../common/grid';

/**
 * Component managing laboratory user accounts, metrology staff, and departmental signatories.
 * Integrates server-side PostgreSQL pagination, filtering, sorting, CSV export, and full user creation & edit modal.
 * Uses dedicated UserService for user management endpoints.
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  /**
   * Universal data grid state managing server-side pagination, sorting, and per-column filtering.
   */
  public grid = new DataGridState<UserRow>({
    fetchFn: (params) => this.userService.getUsers(params),
    defaultPageSize: 10,
    defaultSortColumn: 'id',
    defaultSortDirection: 'desc'
  });

  public showCreateModal = false;
  public isEditMode = signal<boolean>(false);
  public editingUserId = signal<number | null>(null);
  public isSavingUser = signal<boolean>(false);
  public showPassword = signal<boolean>(false);
  public Math = Math;

  // Dropdown reference signals
  public branches = signal<Branch[]>([]);
  public departments = signal<DepartmentLookup[]>([]);
  public allDesignations = signal<DesignationLookup[]>([]);
  public roles = signal<RoleLookup[]>([]);

  // Selected department in modal to filter designations
  public selectedDepartmentId = signal<number | null>(null);

  /**
   * Filtered designations based on the currently selected department in the registration form.
   */
  public availableDesignations = computed(() => {
    const deptId = this.selectedDepartmentId();
    const list = this.allDesignations();
    if (!deptId || deptId <= 0) return list;
    return list.filter(d => !d.departmentId || d.departmentId === deptId);
  });

  /**
   * Form state for creating or editing a user / staff member.
   */
  public newUserForm: CreateUserPayload = this.getInitialUserForm();

  ngOnInit(): void {
    this.grid.load();
    this.loadDropdownData();
  }

  /**
   * Loads reference datasets on demand for registration dropdowns.
   */
  public loadDropdownData(): void {
    this.apiService.getBranches().subscribe({
      next: (res) => {
        if (res && res.items) {
          this.branches.set(res.items);
        }
      },
      error: (err) => console.error('Failed to load branches', err)
    });

    this.apiService.getDepartments().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.departments.set(data);
        }
      },
      error: (err) => console.error('Failed to load departments', err)
    });

    this.apiService.getDesignations().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.allDesignations.set(data);
        }
      },
      error: (err) => console.error('Failed to load designations', err)
    });

    this.apiService.getRoles().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.roles.set(data);
        }
      },
      error: (err) => console.error('Failed to load roles', err)
    });
  }

  /**
   * Resets form to clean initial state.
   */
  private getInitialUserForm(): CreateUserPayload {
    return {
      firstName: '',
      lastName: '',
      username: '',
      emailAddress: '',
      password: '',
      phoneNumber: '',
      address: '',
      passportNo: '',
      nationalId: '',
      employeeCode: '',
      departmentId: undefined,
      designationId: undefined,
      branchId: undefined,
      roleIds: [],
      isActive: true
    };
  }

  /**
   * Handles department dropdown changes to dynamically filter designations.
   */
  public onDepartmentChange(deptId: number | string | undefined): void {
    const id = deptId ? Number(deptId) : null;
    this.selectedDepartmentId.set(id);
    this.newUserForm.departmentId = id || undefined;
    this.newUserForm.designationId = undefined; // reset designation when dept changes
  }

  /**
   * Opens the user registration modal dialog in CREATE mode.
   */
  public openCreateModal(): void {
    this.isEditMode.set(false);
    this.editingUserId.set(null);
    this.newUserForm = this.getInitialUserForm();
    this.selectedDepartmentId.set(null);
    this.showPassword.set(false);
    this.loadDropdownData();
    this.userService.getNextEmployeeCode().subscribe({
      next: (res) => {
        if (res && res.code) {
          this.newUserForm.employeeCode = res.code;
        }
      },
      error: () => {
        this.newUserForm.employeeCode = 'EMP-0001';
      }
    });
    this.showCreateModal = true;
  }

  /**
   * Opens the user modal in EDIT mode and loads the full user profile.
   * @param user Selected user row.
   */
  public openEditModal(user: UserRow): void {
    this.isEditMode.set(true);
    this.editingUserId.set(user.id);
    this.showPassword.set(false);
    this.loadDropdownData();

    // Set initial quick values from grid row
    this.newUserForm = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddress: user.emailAddress,
      password: '', // Blank indicates password remains unchanged
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      passportNo: user.passportNo || '',
      nationalId: user.nationalId || '',
      employeeCode: user.employeeCode || '',
      departmentId: user.departmentId || undefined,
      designationId: user.designationId || undefined,
      branchId: user.branchId || undefined,
      roleIds: [],
      isActive: user.isActive
    };
    this.selectedDepartmentId.set(user.departmentId || null);
    this.showCreateModal = true;

    // Fetch full user record including roles via UserService
    this.userService.getUserById(user.id).subscribe({
      next: (detail) => {
        this.newUserForm = {
          firstName: detail.firstName,
          lastName: detail.lastName,
          username: detail.username,
          emailAddress: detail.emailAddress,
          password: '',
          phoneNumber: detail.phoneNumber || '',
          address: detail.address || '',
          passportNo: detail.passportNo || '',
          nationalId: detail.nationalId || '',
          employeeCode: detail.employeeCode || '',
          departmentId: detail.departmentId || undefined,
          designationId: detail.designationId || undefined,
          branchId: detail.branchId || undefined,
          roleIds: detail.roleIds || [],
          isActive: detail.isActive
        };
        this.selectedDepartmentId.set(detail.departmentId || null);
      },
      error: (err) => {
        console.error('Failed to load user details', err);
      }
    });
  }

  /**
   * Closes the user registration / edit modal dialog.
   */
  public closeCreateModal(): void {
    if (this.isSavingUser()) return;
    this.showCreateModal = false;
  }

  /**
   * Generates a strong, secure 12-character random password.
   */
  public generatePassword(): void {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';
    const all = uppercase + lowercase + numbers + symbols;

    let pwd = '';
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 12; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle characters
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    this.newUserForm.password = pwd;
    this.showPassword.set(true);
    this.toastService.showInfo('Password Generated', 'Auto-generated strong temporary password.');
  }

  /**
   * Toggles password masking in input.
   */
  public togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  /**
   * Copies the current password to the system clipboard.
   */
  public copyPassword(): void {
    if (this.newUserForm.password) {
      navigator.clipboard.writeText(this.newUserForm.password);
      this.toastService.showSuccess('Copied', 'Password copied to clipboard.');
    }
  }

  /**
   * Validates and submits the user registration or update payload to the API.
   */
  public saveUser(): void {
    const f = this.newUserForm;
    const isEdit = this.isEditMode();

    if (!f.firstName?.trim() || !f.lastName?.trim()) {
      this.toastService.showWarning('Required Fields', 'Please enter staff First Name and Last Name.');
      return;
    }

    if (!f.username?.trim()) {
      this.toastService.showWarning('Required Field', 'Please enter a unique Username.');
      return;
    }

    if (!f.emailAddress?.trim()) {
      this.toastService.showWarning('Required Field', 'Please enter an Email Address.');
      return;
    }

    // Password required for new accounts; optional for editing existing accounts
    if (!isEdit && (!f.password || f.password.length < 6)) {
      this.toastService.showWarning('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (isEdit && f.password && f.password.length > 0 && f.password.length < 6) {
      this.toastService.showWarning('Weak Password', 'New password must be at least 6 characters.');
      return;
    }

    this.isSavingUser.set(true);

    if (isEdit) {
      const updatePayload: UpdateUserPayload = {
        id: this.editingUserId()!,
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        username: f.username.trim(),
        emailAddress: f.emailAddress.trim(),
        password: f.password?.trim() || undefined,
        phoneNumber: f.phoneNumber?.trim() || undefined,
        address: f.address?.trim() || undefined,
        passportNo: f.passportNo?.trim() || undefined,
        nationalId: f.nationalId?.trim() || undefined,
        employeeCode: f.employeeCode?.trim() || undefined,
        departmentId: f.departmentId ? Number(f.departmentId) : undefined,
        designationId: f.designationId ? Number(f.designationId) : undefined,
        branchId: f.branchId ? Number(f.branchId) : undefined,
        roleIds: f.roleIds && f.roleIds.length > 0 ? f.roleIds.map(r => Number(r)) : undefined,
        isActive: f.isActive ?? true
      };

      this.userService.updateUser(updatePayload.id, updatePayload).subscribe({
        next: (res) => {
          this.isSavingUser.set(false);
          this.showCreateModal = false;
          this.toastService.showSuccess('User Updated', `Staff member ${updatePayload.firstName} ${updatePayload.lastName} updated successfully.`);
          this.grid.load();
        },
        error: (err) => {
          this.isSavingUser.set(false);
          const detail = err.error?.detail || err.error?.title || err.message || 'Failed to update user account.';
          this.toastService.showError('Update Failed', detail);
        }
      });
    } else {
      const createPayload: CreateUserPayload = {
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        username: f.username.trim(),
        emailAddress: f.emailAddress.trim(),
        password: f.password.trim(),
        phoneNumber: f.phoneNumber?.trim() || undefined,
        address: f.address?.trim() || undefined,
        passportNo: f.passportNo?.trim() || undefined,
        nationalId: f.nationalId?.trim() || undefined,
        employeeCode: f.employeeCode?.trim() || undefined,
        departmentId: f.departmentId ? Number(f.departmentId) : undefined,
        designationId: f.designationId ? Number(f.designationId) : undefined,
        branchId: f.branchId ? Number(f.branchId) : undefined,
        roleIds: f.roleIds && f.roleIds.length > 0 ? f.roleIds.map(r => Number(r)) : undefined,
        isActive: f.isActive ?? true
      };

      this.userService.createUser(createPayload).subscribe({
        next: (res) => {
          this.isSavingUser.set(false);
          this.showCreateModal = false;
          this.toastService.showSuccess('User Created', `Staff user registered successfully (User ID: ${res.id}).`);
          this.grid.load();
        },
        error: (err) => {
          this.isSavingUser.set(false);
          const detail = err.error?.detail || err.error?.title || err.message || 'Failed to create user account.';
          this.toastService.showError('Registration Failed', detail);
        }
      });
    }
  }

  /**
   * Exports filtered grid rows to CSV.
   */
  public exportToCsv(): void {
    const data = this.grid.items();
    if (data.length === 0) {
      this.toastService.showWarning('Export Error', 'No records available to export.');
      return;
    }
    let csvContent = 'Employee Code,Username,Full Name,Email,Phone,Department,Designation,Branch,Roles,Status,Last Login\n';
    data.forEach(row => {
      csvContent += `"${row.employeeCode || ''}","${row.username}","${row.fullName}","${row.emailAddress}","${row.phoneNumber || ''}","${row.departmentName || ''}","${row.designationName || ''}","${row.branchName || ''}","${row.roleNames || ''}","${row.isActive ? 'ACTIVE' : 'INACTIVE'}","${row.lastLoginAt || 'Never'}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CaliBro_Staff_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess('Export Complete', `Exported ${data.length} staff records to CSV.`);
  }

  /**
   * Helper to toggle role selection.
   */
  public toggleRole(roleId: number): void {
    const current = this.newUserForm.roleIds || [];
    if (current.includes(roleId)) {
      this.newUserForm.roleIds = current.filter(id => id !== roleId);
    } else {
      this.newUserForm.roleIds = [...current, roleId];
    }
  }

  public isRoleSelected(roleId: number): boolean {
    return (this.newUserForm.roleIds || []).includes(roleId);
  }
}
