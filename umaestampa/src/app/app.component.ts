import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { OrientationService } from './services/orientation.service';

/**
 * Componente raiz da aplicação
 * Fornece a estrutura base e inicializa serviços globais
 * Injeta OrientationService para bloquear a tela em portrait
 * @component
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  // Injeta o serviço de orientação para inicializar o bloqueio da tela
  private readonly orientationService = inject(OrientationService);
}
