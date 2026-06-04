import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, PopoverController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmarkOutline, logOutOutline, receiptOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-popup',
  template: `
    <ion-content class="ion-padding-0">
      <div class="auth-popup-content">

        <!-- USER INFO -->
        <div class="user-info">
          <p class="user-label">Conectado como</p>
          <p class="user-name">{{ currentUser?.name }}</p>
          <p class="user-email">{{ currentUser?.email }}</p>
        </div>

        <!-- ACTIONS -->
        <div class="popup-actions">

          <button class="action-button order-history" (click)="goToOrderHistory()">
            <ion-icon name="receipt-outline" class="button-icon"></ion-icon>
            <span>Histórico de Encomendas</span>
          </button>

          <button class="action-button saved-designs" (click)="goToSavedDesigns()">
            <ion-icon name="bookmark-outline" class="button-icon"></ion-icon>
            <span>Designs Guardados</span>
          </button>

          <div class="divider"></div>

          <button class="action-button danger" (click)="logout()">
            <ion-icon name="log-out-outline" class="button-icon"></ion-icon>
            <span>Terminar Sessão</span>
          </button>

        </div>

      </div>
    </ion-content>
  `,
  styleUrls: ['./auth-popup.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon],
})
export class AuthPopupComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly popoverCtrl = inject(PopoverController);

  readonly currentUser = this.authService.user;

  constructor() {
    addIcons({ bookmarkOutline, logOutOutline, receiptOutline });
  }

  async goToOrderHistory(): Promise<void> {
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/order-history']);
  }

  async goToSavedDesigns(): Promise<void> {
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/saved-designs']);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.popoverCtrl.dismiss();
    this.router.navigate(['/auth']);
  }
}