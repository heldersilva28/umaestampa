import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Chaves utilizadas para armazenar dados no Ionic Storage
 * Definidas como constantes para evitar erros de digitação
 */
export const STORAGE_KEYS = {
  CART_ITEMS: 'cart_items',
  ORDER_HISTORY: 'order_history',
  USER_DATA: 'user_data',
} as const;

/**
 * Serviço responsável por gerenciar persistência de dados utilizando Ionic Storage
 * Permite guardar e recuperar dados do dispositivo de forma segura e eficiente
 * 
 * Nota: Em desenvolvimento (browser), o Storage funciona com IndexedDB
 * Em produção (mobile), utiliza o armazenamento nativo do dispositivo
 * @class StorageService
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private isReady = false;
  private initPromise: Promise<void>;

  /**
   * Construtor do StorageService
   * Inicializa o Ionic Storage quando o serviço é criado
   * @constructor
   * @param {Storage} storage - Instância do Ionic Storage
   */
  constructor(private storage: Storage) {
    this.initPromise = this.initStorage();
  }

  /**
   * Inicializa o Ionic Storage
   * Deve ser chamado uma única vez ao carregar a aplicação
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async initStorage(): Promise<void> {
    try {
      await this.storage.create();
      this.isReady = true;
    } catch (error) {
      console.warn('Erro ao inicializar Storage:', error);
      this.isReady = true; // Continue mesmo com erro
    }
  }

  /**
   * Aguarda até que o Storage esteja pronto para uso
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async ensureReady(): Promise<void> {
    if (!this.isReady) {
      try {
        await this.initPromise;
      } catch (error) {
        console.warn('Erro ao aguardar Storage pronto:', error);
      }
    }
  }

  /**
   * Guarda um valor no Storage
   * @async
   * @param {string} key - Chave para identificar o valor
   * @param {T} value - Valor a guardar (será convertido para JSON)
   * @returns {Promise<void>}
   */
  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureReady();
    try {
      await this.storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Erro ao guardar ${key} no Storage:`, error);
    }
  }

  /**
   * Recupera um valor do Storage
   * @async
   * @template T - Tipo genérico do valor a recuperar
   * @param {string} key - Chave do valor a recuperar
   * @returns {Promise<T | null>} Valor recuperado ou null se não existir
   */
  async get<T>(key: string): Promise<T | null> {
    await this.ensureReady();
    try {
      const value = await this.storage.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`Erro ao recuperar ${key} do Storage:`, error);
      return null;
    }
  }

  /**
   * Remove um valor do Storage
   * @async
   * @param {string} key - Chave do valor a remover
   * @returns {Promise<void>}
   */
  async remove(key: string): Promise<void> {
    await this.ensureReady();
    try {
      await this.storage.remove(key);
    } catch (error) {
      console.warn(`Erro ao remover ${key} do Storage:`, error);
    }
  }

  /**
   * Limpa todos os dados do Storage
   * @async
   * @returns {Promise<void>}
   */
  async clear(): Promise<void> {
    await this.ensureReady();
    try {
      await this.storage.clear();
    } catch (error) {
      console.warn('Erro ao limpar Storage:', error);
    }
  }
}
