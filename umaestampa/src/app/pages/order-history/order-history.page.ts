import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bagOutline,
  callOutline,
  chevronForwardOutline,
  closeOutline,
  locationOutline,
  mailOutline,
  timeOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header.component';
import { AuthService } from '../../services/auth.service';
import { Order, OrdersService } from '../../services/orders.service';
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
    HeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    OrderStatusBadgeComponent,
  ],
})
export class OrderHistoryPage implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Array reativo de encomendas do utilizador autenticado
  readonly orders = this.ordersService.orders;

  // Número total de encomendas
  readonly orderCount = this.ordersService.orderCount;

  // Valor total gasto em todas as encomendas
  readonly totalSpent = this.ordersService.totalSpent;

  readonly processingStatus = 'Em processamento';
  selectedOrder: Order | null = null;

  /**
   * Construtor - Registra os ícones a utilizar no template
   * @constructor
   */
  constructor() {
    addIcons({
      bagOutline,
      callOutline,
      chevronForwardOutline,
      closeOutline,
      locationOutline,
      mailOutline,
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
   * Calcula o subtotal de uma encomenda (soma de todos os itens)
   * @param {Order} order - Encomenda a calcular
   * @returns {number} Subtotal da encomenda
   */
  subtotalByOrder(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  /**
   * Calcula o custo de envio: €4.99 por defeito, grátis acima de €50
   * @param {Order} order - Encomenda a calcular
   * @returns {number} Custo de envio
   */
  shippingByOrder(order: Order): number {
    const subtotal = this.subtotalByOrder(order);
    return subtotal >= 50 ? 0 : 4.99;
  }

  /**
   * Soma as quantidades de todos os itens da encomenda
   * @param order Encomenda a resumir
   * @returns número total de artigos
   */
  itemCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Retorna os primeiros produtos para mostrar no card compacto
   * @param order Encomenda a resumir
   * @returns lista curta de nomes
   */
  compactItemNames(order: Order): string {
    const names = order.items.slice(0, 2).map((item) => item.product.name);
    const extraCount = Math.max(0, order.items.length - names.length);
    return extraCount > 0 ? `${names.join(', ')} +${extraCount}` : names.join(', ');
  }

  /**
   * Abre o detalhe completo da encomenda
   * @param order Encomenda selecionada
   */
  openOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  /**
   * Fecha o detalhe completo da encomenda
   */
  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
}
