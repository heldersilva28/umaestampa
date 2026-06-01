import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonBadge, IonButton, IonHeader, IonIcon, IonToolbar, ModalController, PopoverController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, colorPaletteOutline, helpCircleOutline, personOutline } from 'ionicons/icons';
import { AuthPopupComponent } from './auth-popup.component';
import { HelpModalComponent } from './help-modal.component';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

/**
 * Componente de Header Reutilizável
 * Exibido em todas as páginas da aplicação
 * Contém logo, botão do carrinho e autenticação
 * @component
 */
@Component({
  selector: 'app-header',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="shop-header">
        <div class="shop-header-inner">
          <!-- Logo -->
          <div class="brand-lockup">
            <div class="brand-mark">
              <ion-icon name="color-palette-outline"></ion-icon>
            </div>
            <div class="min-w-0">
              <p class="brand-title">UmaEstampa</p>
              <p class="brand-subtitle">Personalize os seus artigos</p>
            </div>
          </div>

          <!-- Carrinho -->
          <div class="relative shrink-0">
            <ion-button fill="solid" routerLink="/cart" aria-label="Abrir carrinho" class="nav-icon-button light">
              <ion-icon name="cart-outline" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-badge *ngIf="cartCount() > 0" class="cart-count-badge">{{ cartCount() }}</ion-badge>
          </div>

          <!-- Ajuda -->
          <div class="relative shrink-0">
            <ion-button fill="solid" (click)="openHelp()" aria-label="Abrir ajuda" class="nav-icon-button dark">
              <ion-icon name="help-circle-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>

          <!-- Botão de autenticação -->
          <ion-button
            fill="solid"
            aria-label="Menu de utilizador"
            class="nav-icon-button dark"
            (click)="isAuthenticated() ? openAuthPopover($event) : router.navigate(['/auth'])"
          >
            <ion-icon name="person-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>
  `,
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonButton, IonIcon, IonBadge],
})
export class HeaderComponent {
  readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly popoverCtrl = inject(PopoverController);
  private readonly modalController = inject(ModalController);

  // Signal do número de itens no carrinho
  readonly cartCount = this.cartService.count;

  // Estado de autenticação reativo
  readonly isAuthenticated = this.authService.isAuthenticated$;

  /**
   * Construtor - Registra os ícones a utilizar
   * @constructor
   */
  constructor() {
    addIcons({ cartOutline, colorPaletteOutline, helpCircleOutline, personOutline });
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
