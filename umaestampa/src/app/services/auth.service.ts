import { Injectable, signal } from '@angular/core';
import { JwtService } from './jwt.service';
import { StorageService } from './storage.service';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

const STORAGE_KEYS = {
  JWT_TOKEN: 'auth:jwt',
  USERS_DB: 'auth:users',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(null);

  constructor(
    private storageService: StorageService,
    private jwtService: JwtService,
  ) {
    this.restoreSession();
  }

  get user(): User | null {
    return this.currentUser();
  }

  get isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  get isAuthenticated$(): () => boolean {
    return () => this.currentUser() !== null;
  }

  get currentUser$(): () => User | null {
    return () => this.currentUser();
  }

  async login(email: string, password: string): Promise<User> {
    const users = await this.getStoredUsers();
    const stored = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!stored) {
      throw new Error('Utilizador não encontrado.');
    }
    const hash = await this.jwtService.hashPassword(password);
    if (hash !== stored.passwordHash) {
      throw new Error('Password incorreta.');
    }
    return this.createSession({ id: stored.id, name: stored.name, email: stored.email });
  }

  async register(email: string, name: string, password: string): Promise<User> {
    const users = await this.getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este email já está registado.');
    }
    const passwordHash = await this.jwtService.hashPassword(password);
    const newUser: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      email,
      passwordHash,
    };
    users.push(newUser);
    await this.storageService.set(STORAGE_KEYS.USERS_DB, users);
    return this.createSession({ id: newUser.id, name: newUser.name, email: newUser.email });
  }

  async logout(): Promise<void> {
    this.currentUser.set(null);
    await this.storageService.remove(STORAGE_KEYS.JWT_TOKEN);
  }

  private async createSession(user: User): Promise<User> {
    const token = await this.jwtService.sign({ sub: user.id, name: user.name, email: user.email });
    await this.storageService.set(STORAGE_KEYS.JWT_TOKEN, token);
    this.currentUser.set(user);
    return user;
  }

  private async restoreSession(): Promise<void> {
    try {
      const token = await this.storageService.get<string>(STORAGE_KEYS.JWT_TOKEN);
      if (!token) return;
      const claims = await this.jwtService.verify(token);
      if (!claims) {
        await this.storageService.remove(STORAGE_KEYS.JWT_TOKEN);
        return;
      }
      this.currentUser.set({
        id: claims['sub'] as string,
        name: claims['name'] as string,
        email: claims['email'] as string,
      });
    } catch {
      await this.storageService.remove(STORAGE_KEYS.JWT_TOKEN);
    }
  }

  private async getStoredUsers(): Promise<StoredUser[]> {
    const users = await this.storageService.get<StoredUser[]>(STORAGE_KEYS.USERS_DB);
    return users ?? [];
  }
}
