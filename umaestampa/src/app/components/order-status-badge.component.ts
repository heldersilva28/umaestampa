import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  paperPlaneOutline,
  timerOutline,
  construct,
} from 'ionicons/icons';

/**
 * Tipo de status de encomenda
 */
export type OrderStatus = 'Em processamento' | 'Pendente' | 'Em produção' | 'Enviado' | 'Entregue' | string;

/**
 * Configuração de status (cor, ícone, label)
 */
interface StatusConfig {
  color: 'primary' | 'warning' | 'secondary' | 'success';
  icon: string;
  label: string;
}

/**
 * Componente para exibir estado de encomenda
 *
 * Mostra um badge com cor e ícone de acordo com o estado da encomenda.
 * Suporta estados: Em processamento, Pendente, Em produção, Enviado, Entregue
 *
 * @component
 * @example
 * <app-order-status-badge status="Enviado" />
 * <app-order-status-badge status="Entregue" size="large" />
 *
 * @input status - Estado da encomenda
 * @input size - Tamanho do badge (small, medium, large)
 */
@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './order-status-badge.component.html',
  styleUrls: ['./order-status-badge.component.scss'],
})
export class OrderStatusBadgeComponent {
  // Status da encomenda
  status = input.required<OrderStatus>();

  // Tamanho do badge
  size = input<'small' | 'medium' | 'large'>('medium');

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      paperPlaneOutline,
      timerOutline,
      construct,
    });
  }

  /**
   * Obter configuração de status
   */
  getStatusConfig(): StatusConfig {
    const configs: Record<OrderStatus, StatusConfig> = {
      Pendente: {
        color: 'primary',
        icon: 'timer-outline',
        label: 'Pendente',
      },
      'Em processamento': {
        color: 'warning',
        icon: 'timer-outline',
        label: 'Em processamento',
      },
      'Em produção': {
        color: 'warning',
        icon: 'construct',
        label: 'Em produção',
      },
      Enviado: {
        color: 'secondary',
        icon: 'paper-plane-outline',
        label: 'Enviado',
      },
      Entregue: {
        color: 'success',
        icon: 'checkmark-circle-outline',
        label: 'Entregue',
      },
    };

    return configs[this.status()] || configs['Em processamento'];
  }

  /**
   * Obter classe CSS de tamanho
   */
  getSizeClass(): string {
    return `badge-${this.size()}`;
  }
}
