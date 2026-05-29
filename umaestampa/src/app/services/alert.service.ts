import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';

/**
 * Configuração de alerta
 */
export interface AlertConfig {
  title: string;
  message: string;
  okText?: string;
  cancelText?: string;
}

/**
 * Serviço centralizado para alertas e confirmações
 *
 * Fornece interface consistente para exibir diálogos de confirmação,
 * avisos e mensagens de alerta usando Ionic AlertController.
 *
 * @example
 * // Confirmação simples
 * const confirmed = await this.alertService.confirm({
 *   title: 'Remover item?',
 *   message: 'Tem a certeza que deseja remover este item?'
 * });
 *
 * // Aviso
 * await this.alertService.alert({
 *   title: 'Aviso',
 *   message: 'A ação não pode ser desfeita.'
 * });
 */
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly alertController = inject(AlertController);

  /**
   * Exibir alerta simples
   */
  async alert(config: AlertConfig): Promise<void> {
    const alert = await this.alertController.create({
      header: config.title,
      message: config.message,
      buttons: [{ text: config.okText || 'OK', role: 'confirm' }],
    });

    await alert.present();
  }

  /**
   * Exibir confirmação (OK/Cancelar)
   * Retorna true se utilizador clicou OK
   */
  async confirm(config: AlertConfig): Promise<boolean> {
    const alert = await this.alertController.create({
      header: config.title,
      message: config.message,
      buttons: [
        { text: config.cancelText || 'Cancelar', role: 'cancel', handler: () => false },
        { text: config.okText || 'Confirmar', role: 'confirm', handler: () => true },
      ],
    });

    const result = await alert.onDidDismiss();
    return result.role === 'confirm';
  }

  /**
   * Exibir alerta de erro
   */
  async error(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title || 'Erro',
      message,
      buttons: [{ text: 'Fechar', role: 'cancel' }],
      color: 'danger',
    });

    await alert.present();
  }

  /**
   * Exibir alerta de sucesso
   */
  async success(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title || 'Sucesso',
      message,
      buttons: [{ text: 'OK', role: 'confirm' }],
      color: 'success',
    });

    await alert.present();
  }

  /**
   * Exibir alerta de aviso
   */
  async warning(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title || 'Aviso',
      message,
      buttons: [{ text: 'OK', role: 'confirm' }],
      color: 'warning',
    });

    await alert.present();
  }
}
