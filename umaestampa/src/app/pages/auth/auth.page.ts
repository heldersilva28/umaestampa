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
import { AuthService } from '../../services/auth.service';

/**
 * Página de Autenticação
 * Fornece interface para login e registo de utilizadores
 * Inclui validações básicas e feedback visual com toast notifications
 * @component
 * @example
 * <app-auth></app-auth>
 */
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
  private readonly authService = inject(AuthService);

  // Controla qual aba está selecionada (login ou registo)
  activeTab = 'login';

  // Campos do formulário de login
  loginEmail = '';
  loginPassword = '';

  // Campos do formulário de registo
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  // Controla a visibilidade da password
  showPassword = false;

  // Flag para indicar se está a processar um pedido
  isLoading = false;

  /**
   * Construtor - Registra os ícones a utilizar no template
   * @constructor
   */
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

  /**
   * Processa o login do utilizador
   * Valida os campos, autentica e redireciona para o catálogo
   * @async
   * @returns {Promise<void>}
   */
  async login(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) {
      await this.showToast('Preencha todos os campos.', 'warning');
      return;
    }

    this.isLoading = true;
    await this.delay(800);

    try {
      await this.authService.login(this.loginEmail, this.loginPassword);
      await this.showToast('Bem-vindo à UmaEstampa.', 'success');
      this.router.navigate(['/catalog']);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao fazer login.';
      await this.showToast(msg, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Processa o registo de um novo utilizador
   * Valida todos os campos e confirma que as passwords correspondem
   * @async
   * @returns {Promise<void>}
   */
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

    try {
      await this.authService.register(this.registerEmail, this.registerName, this.registerPassword);
      await this.showToast('Conta criada com sucesso.', 'success');
      this.router.navigate(['/catalog']);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar conta.';
      await this.showToast(msg, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Exibe uma notificação toast ao utilizador
   * @private
   * @async
   * @param {string} message - Mensagem a exibir
   * @param {string} color - Cor da notificação (success, warning, danger, etc)
   * @returns {Promise<void>}
   */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  /**
   * Função auxiliar para aguardar um tempo especificado
   * Utiliza window.setTimeout para criar um delay
   * @private
   * @param {number} ms - Milissegundos a aguardar
   * @returns {Promise<void>}
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
