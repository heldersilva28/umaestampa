import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  arrowForwardOutline,
  bagOutline,
  cartOutline,
  colorPaletteOutline,
  personOutline,
  remove,
  trashOutline,
} from 'ionicons/icons';
import { CartService } from '../../services/cart.service';

/**
 * Página do Carrinho de Compras
 * Exibe todos os itens adicionados ao carrinho
 * Permite modificar quantidades, remover itens e prosseguir para checkout
 * @component
 * @example
 * <app-cart></app-cart>
 */
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonToolbar,
  ],
})
export class CartPage {
  private readonly cartService = inject(CartService);

  // Lista reativa de itens do carrinho
  readonly items = this.cartService.items;

  // Quantidade total de itens
  readonly cartCount = this.cartService.count;

  // Subtotal (preço sem taxas de envio)
  readonly subtotal = this.cartService.subtotal;

  // Taxa de envio: gratuito se subtotal > 50€, caso contrário 4.99€
  readonly shipping = computed(() => (this.subtotal() > 50 ? 0 : 4.99));

  // Total a pagar: subtotal + taxa de envio
  readonly total = computed(() => this.subtotal() + this.shipping());

  /**
   * Construtor - Registra os ícones a utilizar no template
   * @constructor
   */
  constructor() {
    addIcons({
      add,
      arrowForwardOutline,
      bagOutline,
      cartOutline,
      colorPaletteOutline,
      personOutline,
      remove,
      trashOutline,
    });
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   * @param {number} index - Índice do item no array
   * @param {number} quantity - Nova quantidade
   * @returns {Promise<void>}
   */
  async updateQuantity(index: number, quantity: number): Promise<void> {
    await this.cartService.updateQuantity(index, quantity);
  }

  /**
   * Remove um item do carrinho
   * @async
   * @param {number} index - Índice do item a remover
   * @returns {Promise<void>}
   */
  async removeItem(index: number): Promise<void> {
    await this.cartService.removeItem(index);
  }
}
