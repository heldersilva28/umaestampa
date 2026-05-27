import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  IonTextarea,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  businessOutline,
  cardOutline,
  cartOutline,
  checkmarkCircle,
  colorPaletteOutline,
  personOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrdersService, Order } from '../../services/orders.service';

/**
 * Página de Checkout
 * Coleta informações de envio e pagamento do utilizador
 * Permite finalizar a compra e gera um ID de pedido único
 * Guarda o pedido no histórico de encomendas
 * Requer autenticação para aceder a esta página
 * @component
 * @example
 * <app-checkout></app-checkout>
 */
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonSpinner,
    IonTextarea,
    IonToolbar,
  ],
})
export class CheckoutPage implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly authService = inject(AuthService);

  // Itens do carrinho
  readonly items = this.cartService.items;
  readonly cartCount = this.cartService.count;
  readonly subtotal = this.cartService.subtotal;

  // Envio gratuito no checkout
  readonly shipping = computed(() => 0);

  // Total = subtotal + envio (neste caso, subtotal)
  readonly total = computed(() => (this.items().length === 0 ? 0 : this.subtotal() + this.shipping()));

  // Flag: indica se o pedido foi colocado com sucesso
  orderPlaced = false;

  // ID único do pedido gerado
  orderId = '';

  // Flag: indica se a requisição de checkout está em progresso
  isLoading = false;

  /**
   * Dados de formulário para checkout
   * @property {string} name - Nome completo do cliente
   * @property {string} email - Email do cliente
   * @property {string} phone - Número de telefone
   * @property {string} address - Endereço de entrega
   * @property {string} city - Cidade
   * @property {string} postalCode - Código postal
   * @property {string} notes - Observações adicionais
   * @property {string} paymentMethod - Método de pagamento (card ou transfer)
   */
  formData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'card',
  };

  /**
   * Construtor - Registra os ícones a utilizar no template
   * @constructor
   */
  constructor() {
    addIcons({
      arrowBackOutline,
      businessOutline,
      cardOutline,
      cartOutline,
      checkmarkCircle,
      colorPaletteOutline,
      personOutline,
      phonePortraitOutline,
    });
  }

  /**
   * Inicializa a página
   * Valida autenticação e redireciona para login se necessário
   * Preenche dados de utilizador se autenticado
   * @returns {void}
   */
  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth']);
      return;
    }

    // Preenche alguns dados do utilizador autenticado
    const user = this.authService.user;
    if (user) {
      this.formData.name = user.name;
      this.formData.email = user.email;
    }
  }

  /**
   * Processa o pedido
   * Valida o formulário, simula o processamento e gera um ID de pedido
   * Guarda o pedido no histórico de encomendas
   * @async
   * @returns {Promise<void>}
   */
  async placeOrder(): Promise<void> {
    if (this.items().length === 0) {
      await this.showToast('O carrinho está vazio.', 'warning');
      return;
    }

    const { name, email, address, city, postalCode } = this.formData;
    if (!name || !email || !address || !city || !postalCode) {
      await this.showToast('Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    // Simula o processamento do pedido no backend
    this.isLoading = true;
    await this.delay(1000);
    this.isLoading = false;

    // Gera ID único: "UE" + últimos 6 dígitos do timestamp
    this.orderId = `UE${Date.now().toString().slice(-6)}`;
    this.orderPlaced = true;

    // Cria o objeto da encomenda com todos os detalhes
    const newOrder: Order = {
      id: this.orderId,
      userId: this.authService.user?.id || '', // O OrdersService validará isto
      date: new Date(),
      total: this.total(),
      status: 'Pendente',
      name: this.formData.name,
      email: this.formData.email,
      phone: this.formData.phone,
      address: this.formData.address,
      city: this.formData.city,
      postalCode: this.formData.postalCode,
      items: this.items(),
    };

    // Guarda a encomenda no histórico
    await this.ordersService.addOrder(newOrder);

    // Limpa o carrinho após confirmação do pedido
    await this.cartService.clear();
  }

  /**
   * Navega de volta para o catálogo
   * @returns {void}
   */
  goToCatalog(): void {
    this.router.navigate(['/catalog']);
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
      color,
      duration: 2000,
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
