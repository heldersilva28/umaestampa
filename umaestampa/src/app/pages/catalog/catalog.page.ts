import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  ModalController,
  PopoverController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { brushOutline, cartOutline, colorPaletteOutline, helpCircleOutline, personOutline } from 'ionicons/icons';
import { AuthPopupComponent } from '../../components/auth-popup.component';
import { HelpModalComponent } from '../../components/help-modal.component';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductsService } from '../../services/products.service';

/**
 * Página do Catálogo
 * Exibe a lista de produtos disponíveis para personalização
 * Permite navegação para a página de customização e carrinho
 * Inclui popover de autenticação quando utilizador está logado
 * @component
 * @example
 * <app-catalog></app-catalog>
 */
@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonToolbar,
    HelpModalComponent,
  ],
})
export class CatalogPage {
  readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly popoverCtrl = inject(PopoverController);
  private readonly modalController = inject(ModalController);

  // Expõe o signal de produtos do serviço para o template
  readonly products = this.productsService.products$;

  // Signal que indica o número de itens no carrinho
  readonly cartCount = this.cartService.count;

  // Estado de autenticação reativo
  readonly isAuthenticated = this.authService.isAuthenticated$;

  /**
   * Construtor - Registra os ícones utilizar no template
   * @constructor
   */
  constructor() {
    addIcons({ brushOutline, cartOutline, colorPaletteOutline, helpCircleOutline, personOutline });
  }

  /**
   * Navega para a página de customização do produto selecionado
   * @param {Product} product - Produto selecionado
   */
  goToProduct(product: Product): void {
    this.router.navigate(['/customizer', product.id]);
  }

  /**
   * Abre o popover de autenticação
   * @async
   * @param {Event} event - Evento do clique
   * @returns {Promise<void>}
   */
  async openAuthPopover(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: AuthPopupComponent,
      event,
      translucent: true,
      cssClass: 'auth-popover',
    });
    await popover.present();
  }

  /**
   * Abre o modal de ajuda com FAQs e tutoriais
   * @async
   * @returns {Promise<void>}
   */
  async openHelp(): Promise<void> {
    const modal = await this.modalController.create({
      component: HelpModalComponent,
      cssClass: 'help-modal',
    });
    await modal.present();
  }
}

