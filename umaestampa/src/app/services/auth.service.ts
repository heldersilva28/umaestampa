import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface para representar um utilizador autenticado
 * @interface User
 * @property {string} id - Identificador único do utilizador
 * @property {string} name - Nome do utilizador
 * @property {string} email - Email do utilizador
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Chaves para armazenamento local de dados de autenticação
 */
const STORAGE_KEYS = {
  CURRENT_USER: 'auth:currentUser',
};

/**
 * Serviço de Autenticação
 * Gerencia o estado de autenticação do utilizador
 * Guarda informações de utilizador em Storage para persistência entre sessões
 * @class AuthService
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal que indica o utilizador atualmente autenticado (ou null se não autenticado)
  private readonly currentUser = signal<User | null>(null);

  /**
   * Construtor do serviço AuthService
   * @constructor
   * @param {StorageService} storageService - Serviço de armazenamento persistente
   */
  constructor(private storageService: StorageService) {
    this.loadUserFromStorage();
  }

  /**
   * Getter que retorna o utilizador atualmente autenticado
   * @returns {User | null} Utilizador autenticado ou null
   */
  get user(): User | null {
    return this.currentUser();
  }

  /**
   * Getter que retorna se o utilizador está autenticado
   * @returns {boolean} true se autenticado, false caso contrário
   */
  get isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  /**
   * Getter que retorna um signal para o template reactivamente
   * @returns {() => boolean} Função que retorna o estado de autenticação
   */
  get isAuthenticated$(): () => boolean {
    return () => this.currentUser() !== null;
  }

  /**
   * Getter que retorna um signal para o template reactivamente
   * @returns {() => User | null} Função que retorna o utilizador atual
   */
  get currentUser$(): () => User | null {
    return () => this.currentUser();
  }

  /**
   * Autentica um utilizador com email e password
   * Simula uma autenticação bem-sucedida
   * @async
   * @param {string} email - Email do utilizador
   * @param {string} name - Nome do utilizador (para registo)
   * @returns {Promise<User>} Utilizador autenticado
   */
  async login(email: string, name: string = 'Utilizador'): Promise<User> {
    // Simula autenticação no backend
    const user: User = {
      id: `user_${Date.now()}`,
      name,
      email,
    };

    this.currentUser.set(user);
    await this.storageService.set(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }

  /**
   * Termina a sessão do utilizador
   * Remove os dados de autenticação do Storage
   * @async
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    this.currentUser.set(null);
    await this.storageService.remove(STORAGE_KEYS.CURRENT_USER);
  }

  /**
   * Carrega o utilizador do Storage (persistência entre sessões)
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async loadUserFromStorage(): Promise<void> {
    try {
      const user = await this.storageService.get<User>(STORAGE_KEYS.CURRENT_USER);
      if (user) {
        this.currentUser.set(user);
      }
    } catch (error) {
      console.error('Erro ao carregar utilizador do Storage:', error);
    }
  }
}
