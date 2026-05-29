import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

/**
 * Tipo de notificação toast
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Configuração de toast
 */
export interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number;
  position?: 'top' | 'middle' | 'bottom';
  buttons?: Array<{
    text: string;
    handler?: () => void;
  }>;
}

/**
 * Serviço centralizado para notificações toast
 * 
 * Fornece interface consistente para exibir mensagens de sucesso, erro, aviso e informação.
 * Utiliza Ionic ToastController para renderização nativa.
 * 
 * @example
 * this.toastService.success('Imagem carregada com sucesso!');
 * this.toastService.error('Falha ao carregar imagem. Tente novamente.');
 * this.toastService.warning('A imagem pode perder qualidade na impressão.');
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  /**
   * Exibir notificação de sucesso
   */
  async success(message: string, duration = 3000): Promise<void> {
    await this.show({
      type: 'success',
      message,
      duration,
      position: 'bottom',
    });
  }

  /**
   * Exibir notificação de erro
   */
  async error(message: string, duration = 4000): Promise<void> {
    await this.show({
      type: 'error',
      message,
      duration,
      position: 'bottom',
    });
  }

  /**
   * Exibir notificação de aviso
   */
  async warning(message: string, duration = 3500): Promise<void> {
    await this.show({
      type: 'warning',
      message,
      duration,
      position: 'bottom',
    });
  }

  /**
   * Exibir notificação de informação
   */
  async info(message: string, duration = 3000): Promise<void> {
    await this.show({
      type: 'info',
      message,
      duration,
      position: 'bottom',
    });
  }

  /**
   * Exibir toast com configuração completa
   */
  async show(config: ToastConfig): Promise<void> {
    const toast = await this.toastController.create({
      message: config.message,
      duration: config.duration || 3000,
      position: config.position || 'bottom',
      color: this.getColorForType(config.type),
      icon: this.getIconForType(config.type),
      buttons: config.buttons,
      cssClass: `toast-${config.type}`,
    });

    await toast.present();
  }

  /**
   * Obter cor de acordo com tipo de toast
   */
  private getColorForType(type: ToastType): string {
    const colorMap: Record<ToastType, string> = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'primary',
    };
    return colorMap[type];
  }

  /**
   * Obter ícone de acordo com tipo de toast
   */
  private getIconForType(type: ToastType): string {
    const iconMap: Record<ToastType, string> = {
      success: 'checkmark-circle',
      error: 'alert-circle',
      warning: 'warning',
      info: 'information-circle',
    };
    return iconMap[type];
  }
}
