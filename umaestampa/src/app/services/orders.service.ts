import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { AuthService } from './auth.service';

/**
 * Interface que representa uma encomenda (pedido)
 * Contém informações completas do pedido do utilizador
 * @interface Order
 * @property {string} id - ID único da encomenda (formato: UE + timestamp)
 * @property {string} userId - ID do utilizador que fez a encomenda
 * @property {Date} date - Data de criação da encomenda
 * @property {number} total - Valor total da encomenda
 * @property {string} status - Estado do pedido (pendente, enviado, entregue, etc)
 * @property {string} name - Nome do cliente
 * @property {string} email - Email do cliente
 * @property {string} phone - Número de telefone do cliente
 * @property {string} address - Endereço de entrega
 * @property {string} city - Cidade de entrega
 * @property {string} postalCode - Código postal
 * @property {Array<any>} items - Itens encomendados
 */
export interface Order {
  id: string;
  userId: string;
  date: Date;
  total: number;
  status: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  items: Array<any>;
}

/**
 * Serviço para gerenciar o histórico de encomendas do utilizador
 * Responsável por guardar, recuperar e exibir pedidos associados a um utilizador
 * Utiliza Storage para persistência de dados por utilizador
 * @class OrdersService
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly storageService = inject(StorageService);
  private readonly authService = inject(AuthService);

  // Signal privado que armazena a lista de encomendas do utilizador atual
  private readonly _orders = signal<Order[]>([]);

  // Signal público em modo read-only (não pode ser modificado diretamente)
  readonly orders = this._orders.asReadonly();

  // Signal calculado: número total de encomendas
  readonly orderCount = computed(() => this._orders().length);

  // Signal calculado: valor total gasto em todas as encomendas
  readonly totalSpent = computed(() =>
    this._orders().reduce((sum, order) => sum + order.total, 0),
  );

  /**
   * Construtor do OrdersService
   * Carrega o histórico de encomendas do utilizador atual do Storage ao inicializar
   * @constructor
   */
  constructor() {
    this.loadOrdersForCurrentUser();
  }

  /**
   * Gera a chave de Storage para um utilizador específico
   * @private
   * @param {string} userId - ID do utilizador
   * @returns {string} Chave de Storage específica do utilizador
   */
  private getOrderStorageKey(userId: string): string {
    return `${STORAGE_KEYS.ORDER_HISTORY}:${userId}`;
  }

  /**
   * Carrega o histórico de encomendas do utilizador atual do Storage
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async loadOrdersForCurrentUser(): Promise<void> {
    try {
      const user = this.authService.user;
      if (!user) {
        this._orders.set([]);
        return;
      }

      const storageKey = this.getOrderStorageKey(user.id);
      const savedOrders = await this.storageService.get<Order[]>(storageKey);
      if (savedOrders && Array.isArray(savedOrders)) {
        // Converte strings de data de volta para objetos Date
        const ordersWithDates = savedOrders.map((order) => ({
          ...order,
          date: new Date(order.date),
        }));
        this._orders.set(ordersWithDates);
      } else {
        this._orders.set([]);
      }
    } catch (error) {
      console.warn('Erro ao carregar histórico de encomendas:', error);
      this._orders.set([]);
    }
  }

  /**
   * Adiciona uma nova encomenda ao histórico do utilizador atual
   * Guarda automaticamente no Storage
   * @async
   * @param {Order} order - Encomenda a adicionar
   * @returns {Promise<void>}
   */
  async addOrder(order: Order): Promise<void> {
    // Valida que o utilizador está autenticado
    const user = this.authService.user;
    if (!user) {
      console.warn('Utilizador não autenticado. Encomenda não foi guardada.');
      return;
    }

    // Adiciona dados controlados pela app à encomenda
    order.userId = user.id;
    order.status = 'Em processamento';

    this._orders.update((current) => [...current, order]);
    await this.saveOrdersForCurrentUser();
  }

  /**
   * Remove uma encomenda do histórico pelo ID
   * @async
   * @param {string} orderId - ID da encomenda a remover
   * @returns {Promise<void>}
   */
  async removeOrder(orderId: string): Promise<void> {
    this._orders.update((current) => current.filter((order) => order.id !== orderId));
    await this.saveOrdersForCurrentUser();
  }

  /**
   * Obter uma encomenda pelo ID (apenas se pertencer ao utilizador atual)
   * @param {string} orderId - ID da encomenda
   * @returns {Order | undefined} Encomenda encontrada ou undefined
   */
  getOrder(orderId: string): Order | undefined {
    return this._orders().find((order) => order.id === orderId);
  }

  /**
   * Atualiza o status de uma encomenda
   * @async
   * @param {string} orderId - ID da encomenda
   * @param {string} newStatus - Novo status (pendente, enviado, entregue, etc)
   * @returns {Promise<void>}
   */
  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    this._orders.update((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    await this.saveOrdersForCurrentUser();
  }

  /**
   * Limpa todo o histórico de encomendas do utilizador atual
   * @async
   * @returns {Promise<void>}
   */
  async clearOrderHistory(): Promise<void> {
    this._orders.set([]);
    const user = this.authService.user;
    if (user) {
      await this.storageService.remove(this.getOrderStorageKey(user.id));
    }
  }

  /**
   * Guarda o histórico de encomendas do utilizador atual no Storage
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async saveOrdersForCurrentUser(): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      console.warn('Utilizador não autenticado. Encomendas não foram guardadas.');
      return;
    }

    const storageKey = this.getOrderStorageKey(user.id);
    await this.storageService.set(storageKey, this._orders());
  }

  /**
   * Recarrega as encomendas do utilizador atual
   * Útil quando o utilizador muda de conta
   * @async
   * @returns {Promise<void>}
   */
  async refreshOrders(): Promise<void> {
    await this.loadOrdersForCurrentUser();
  }
}
