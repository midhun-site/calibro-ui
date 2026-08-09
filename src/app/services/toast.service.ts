import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public toasts = signal<ToastMessage[]>([]);
  private nextId = 1;

  show(type: 'success' | 'warning' | 'error' | 'info', title: string, message: string, duration = 4000) {
    const id = this.nextId++;
    const toast: ToastMessage = { id, type, title, message, duration };

    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  showSuccess(title: string, message: string) {
    this.show('success', title, message);
  }

  showWarning(title: string, message: string) {
    this.show('warning', title, message);
  }

  showError(title: string, message: string) {
    this.show('error', title, message);
  }

  showInfo(title: string, message: string) {
    this.show('info', title, message);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
