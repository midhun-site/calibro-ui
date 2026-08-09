import { Injectable, signal } from '@angular/core';

export interface UserSession {
  username: string;
  role: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser = signal<UserSession | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('calibro-user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch {
        this.logout();
      }
    }
  }

  login(username: string, password: string): boolean {
    if (username && password) {
      const session: UserSession = {
        username: username,
        role: 'Senior Metrologist',
        fullName: 'Alex Rivera'
      };
      this.currentUser.set(session);
      localStorage.setItem('calibro-user', JSON.stringify(session));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('calibro-user');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
