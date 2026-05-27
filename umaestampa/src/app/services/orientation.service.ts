import { Injectable } from '@angular/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

/**
 * Serviço para gerenciar a orientação da tela do dispositivo
 * Utiliza o plugin Capacitor ScreenOrientation para bloquear a app em portrait
 * Previne rotações não desejadas e melhora a experiência do utilizador
 * 
 * Nota: Apenas funciona em ambiente mobile/Capacitor.
 * Em desenvolvimento (browser), o serviço silenciosamente falha (esperado)
 * @class OrientationService
 */
@Injectable({ providedIn: 'root' })
export class OrientationService {
  private isAvailable = false;

  /**
   * Construtor do OrientationService
   * Inicializa o serviço tentando bloquear a orientação em portrait
   * Se o Capacitor não estiver disponível (browser dev), continua normalmente
   * @constructor
   */
  constructor() {
    this.initOrientation();
  }

  /**
   * Inicializa o controlo de orientação
   * Tenta bloquear em portrait, mas não falha em desenvolvimento
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async initOrientation(): Promise<void> {
    try {
      // Tenta bloquear a orientação em portrait
      await this.lockPortraitMode();
      this.isAvailable = true;
    } catch (error) {
      // Em desenvolvimento (browser), o ScreenOrientation não está disponível
      // Isto é esperado e não afeta a funcionalidade da app
      this.isAvailable = false;
    }
  }

  /**
   * Bloqueia a orientação da tela em modo portrait (vertical)
   * Previne que a aplicação rode para landscape (horizontal)
   * Útil para manter a consistência da UI em aplicações móveis
   * @async
   * @returns {Promise<void>}
   */
  async lockPortraitMode(): Promise<void> {
    try {
      await ScreenOrientation.lock({ orientation: 'portrait' });
    } catch (error) {
      // Silenciosamente falha - esperado em browser development
      // Em produção (mobile), isto funcionará corretamente
    }
  }

  /**
   * Desbloqueia a orientação da tela
   * Permite que o dispositivo rode livremente baseado no acelerómetro
   * @async
   * @returns {Promise<void>}
   */
  async unlockOrientation(): Promise<void> {
    try {
      await ScreenOrientation.unlock();
    } catch (error) {
      // Silenciosamente falha - esperado em browser development
    }
  }

  /**
   * Verifica se o serviço de orientação está disponível
   * @returns {boolean} True se ScreenOrientation está disponível
   */
  isOrientationAvailable(): boolean {
    return this.isAvailable;
  }
}
