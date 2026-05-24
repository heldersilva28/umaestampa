import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  brushOutline,
  colorPaletteOutline,
  cubeOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
  ],
})
export class AuthPage {
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  activeTab = 'login';
  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  showPassword = false;
  isLoading = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      brushOutline,
      colorPaletteOutline,
      cubeOutline,
      eyeOffOutline,
      eyeOutline,
      lockClosedOutline,
      mailOutline,
      personOutline,
      shieldCheckmarkOutline,
    });
  }

  async login(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) {
      await this.showToast('Preencha todos os campos.', 'warning');
      return;
    }

    this.isLoading = true;
    await this.delay(800);
    this.isLoading = false;
    await this.showToast('Bem-vindo à UmaEstampa.', 'success');
    this.router.navigate(['/catalog']);
  }

  async register(): Promise<void> {
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      await this.showToast('Preencha todos os campos.', 'warning');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      await this.showToast('As passwords não coincidem.', 'danger');
      return;
    }

    this.isLoading = true;
    await this.delay(800);
    this.isLoading = false;
    await this.showToast('Conta criada com sucesso.', 'success');
    this.router.navigate(['/catalog']);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
