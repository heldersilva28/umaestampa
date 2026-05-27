import { Injectable, computed, inject, signal } from '@angular/core';
import { Product } from './products.service';
import { StorageService, STORAGE_KEYS } from './storage.service';

/**
 * Interface que representa um item no carrinho
 * @interface CartItem
 * @property {Product} product - Dados do produto
 * @property {string} imageUrl - URL da imagem customizada
 * @property {{x: number; y: number}} imagePosition - Posição da imagem no produto (em %)
 * @property {number} imageScale - Escala da imagem (em %)
 * @property {number} imageRotation - Rotação da imagem (em graus)
 * @property {number} quantity - Quantidade de itens iguais no carrinho
 */
export interface CartItem {
  product: Product;
  imageUrl: string;
  imagePosition: { x: number; y: number };
  imageScale: number;
  imageRotation: number;
  quantity: number;
}

/**
 * Serviço responsável por gerenciar o carrinho de compras
 * Mantém uma lista reativa de itens e fornece operações de CRUD
 * Os dados do carrinho são persistidos usando Ionic Storage
 * @class CartService
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageService = inject(StorageService);

  // Signal privado que armazena a lista de itens do carrinho
  private readonly _items = signal<CartItem[]>([]);

  // Signal público em modo read-only (não pode ser modificado diretamente)
  readonly items = this._items.asReadonly();

  // Signal calculado: quantidade total de itens no carrinho
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));

  // Signal calculado: subtotal (preço total sem taxas de envio)
  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  /**
   * Construtor do CartService
   * Carrega o carrinho do Storage ao inicializar
   * @constructor
   */
  constructor() {
    this.loadCart();
  }

  /**
   * Carrega o carrinho do Storage
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async loadCart(): Promise<void> {
    const savedCart = await this.storageService.get<CartItem[]>(STORAGE_KEYS.CART_ITEMS);
    if (savedCart) {
      this._items.set(savedCart);
    }
  }

  /**
   * Adiciona um novo item ao carrinho
   * Se o carrinho contiver um item com o mesmo produto, apenas incrementa a quantidade
   * @async
   * @param {CartItem} item - Item a adicionar
   * @returns {Promise<void>}
   */
  async addItem(item: CartItem): Promise<void> {
    const existingItem = this._items().find((i) => i.product.id === item.product.id);
    if (existingItem) {
      this.updateQuantity(this._items().indexOf(existingItem), existingItem.quantity + 1);
    } else {
      this._items.update((current) => [...current, item]);
      await this.saveCart();
    }
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   * Remove o item se a quantidade for menor que 1
   * @async
   * @param {number} index - Índice do item no carrinho
   * @param {number} quantity - Nova quantidade
   * @returns {Promise<void>}
   */
  async updateQuantity(index: number, quantity: number): Promise<void> {
    if (quantity < 1) {
      this.removeItem(index);
      return;
    }

    this._items.update((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, quantity } : item)),
    );
    await this.saveCart();
  }

  /**
   * Remove um item do carrinho pelo índice
   * @async
   * @param {number} index - Índice do item a remover
   * @returns {Promise<void>}
   */
  async removeItem(index: number): Promise<void> {
    this._items.update((current) => current.filter((_, itemIndex) => itemIndex !== index));
    await this.saveCart();
  }

  /**
   * Limpa todos os itens do carrinho
   * @async
   * @returns {Promise<void>}
   */
  async clear(): Promise<void> {
    this._items.set([]);
    await this.storageService.remove(STORAGE_KEYS.CART_ITEMS);
  }

  /**
   * Guarda o carrinho atual no Storage
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async saveCart(): Promise<void> {
    await this.storageService.set(STORAGE_KEYS.CART_ITEMS, this._items());
  }
}
