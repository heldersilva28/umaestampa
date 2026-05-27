import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, PopoverController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, receiptOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

/**
 * Componente de Popup de Autenticação
 * Exibido como um dropdown quando o utilizador clica no botão de perfil
 * Mostra opções de navegação e logout
 * @component
 */
@Component({
  selector: 'app-auth-popup',
  template: `
    <ion-content class="ion-padding-0">
      <div class="auth-popup-content">
        <!-- Informações do utilizador -->
        <div class="user-info ion-padding">
          <p class="text-xs text-gray-500">Conectado como</p>
          <p class="text-sm font-bold">{{ currentUser?.name }}</p>
          <p class="text-xs text-gray-600">{{ currentUser?.email }}</p>
        </div>

        <!-- Botões de ação -->
        <div class="popup-actions">
          <ion-button
            expand="block"
            fill="clear"
            size="small"
            (click)="goToOrderHistory()"
            class="popup-button"
          >
            <ion-icon name="receipt-outline" slot="start"></ion-icon>
            Histórico de Encomendas
          </ion-button>

          <ion-button
            expand="block"
            fill="clear"
            size="small"
            color="danger"
            (click)="logout()"
            class="popup-button"
          >
            <ion-icon name="log-out-outline" slot="start"></ion-icon>
            Terminar Sessão
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['./auth-popup.component.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonIcon],
})
export class AuthPopupComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly popoverCtrl = inject(PopoverController);

  // Utilizador atualmente autenticado
  readonly currentUser = this.authService.user;

  /**
   * Construtor - Registra os ícones a utilizar
   * @constructor
   */
  constructor() {
    addIcons({ logOutOutline, receiptOutline });
  }

  /**
   * Navega para o histórico de encomendas e fecha o popover
   * @async
   * @returns {Promise<void>}
   */
  async goToOrderHistory(): Promise<void> {
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/order-history']);
  }

  /**
   * Termina a sessão do utilizador e fecha o popover
   * @async
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    await this.authService.logout();
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/auth']);
  }
}
