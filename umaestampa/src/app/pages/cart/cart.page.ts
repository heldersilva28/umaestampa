import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  arrowForwardOutline,
  bagOutline,
  remove,
  trashOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header.component';
import { CartService } from '../../services/cart.service';
import { CustomizerDraftService } from '../../services/customizer-draft.service';
import { ToastService } from '../../services/toast.service';

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
    HeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
  ],
})
export class CartPage {
  private readonly cartService = inject(CartService);
  private readonly draftService = inject(CustomizerDraftService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastService = inject(ToastService);

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
      arrowBackOutline,
      arrowForwardOutline,
      bagOutline,
      remove,
      trashOutline,
    });
  }

  async returnToCustomizer(): Promise<void> {
    const draft = await this.draftService.getDraft();
    if (draft) {
      this.router.navigate(['/customizer', draft.productId]);
      return;
    }

    const firstItem = this.items()[0];
    if (!firstItem) {
      this.router.navigate(['/catalog']);
      return;
    }

    await this.draftService.saveDraft({
      productId: firstItem.product.id,
      imageUrl: firstItem.imageUrl,
      imagePosition: firstItem.imagePosition,
      imageScale: firstItem.imageScale,
      imageRotation: firstItem.imageRotation,
    });

    this.router.navigate(['/customizer', firstItem.product.id]);
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
   * Remove um item do carrinho com confirmação
   * Exibe alerta pedindo confirmação antes de remover
   * @async
   * @param {number} index - Índice do item a remover
   * @returns {Promise<void>}
   */
  async removeItem(index: number): Promise<void> {
    const item = this.items()[index];
    if (!item) return;

    const alert = await this.alertController.create({
      header: 'Remover do Carrinho?',
      message: `Tem a certeza que deseja remover "${item.product.name}" do carrinho?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Nada a fazer
          },
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: async () => {
            await this.cartService.removeItem(index);
            await this.toastService.success(`${item.product.name} removido do carrinho`);
          },
        },
      ],
    });

    await alert.present();
  }

}
