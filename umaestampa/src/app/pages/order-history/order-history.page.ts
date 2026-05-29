import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bagOutline, checkmarkDoneOutline, helpCircleOutline, timeOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { Order, OrdersService } from '../../services/orders.service';
import { HelpModalComponent } from '../../components/help-modal.component';
import { OrderStatusBadgeComponent } from '../../components/order-status-badge.component';

/**
 * Página de Histórico de Encomendas
 * Exibe a lista de pedidos anteriores do utilizador autenticado
 * Mostra detalhes de cada encomenda (ID, data, total, status, itens, endereço)
 * Apenas exibe as encomendas do utilizador que está logado
 * @component
 * @example
 * <app-order-history></app-order-history>
 */
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    OrderStatusBadgeComponent,
  ],
})
export class OrderHistoryPage implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly modalController = inject(ModalController);

  // Array reativo de encomendas do utilizador autenticado
  readonly orders = this.ordersService.orders;

  // Número total de encomendas
  readonly orderCount = this.ordersService.orderCount;

  // Valor total gasto em todas as encomendas
  readonly totalSpent = this.ordersService.totalSpent;

  /**
   * Construtor - Registra os ícones a utilizar no template
   * @constructor
   */
  constructor() {
    addIcons({
      arrowBackOutline,
      bagOutline,
      checkmarkDoneOutline,
      helpCircleOutline,
      timeOutline,
    });
  }

  /**
   * Inicializa a página
   * Valida autenticação e protege o acesso
   * @returns {void}
   */
  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth']);
      return;
    }

    // Recarrega as encomendas quando entra na página
    this.ordersService.refreshOrders();
  }

  /**
   * Formata uma data para string legível
   * Exemplo: "27 de Maio de 2026"
   * @param {Date} date - Data a formatar
   * @returns {string} Data formatada em português
   */
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('pt-PT', options);
  }

  /**
   * Retorna a cor do status da encomenda
   * Diferentes cores para diferentes estados
   * @param {string} status - Status da encomenda
   * @returns {string} Cor da classe (success, warning, danger, etc)
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'warning';
      case 'enviado':
        return 'primary';
      case 'entregue':
        return 'success';
      case 'cancelado':
        return 'danger';
      default:
        return 'medium';
    }
  }

  /**
   * Calcula o subtotal de uma encomenda (soma de todos os itens)
   * @param {Order} order - Encomenda a calcular
   * @returns {number} Subtotal da encomenda
   */
  subtotalByOrder(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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
