import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  businessOutline,
  cardOutline,
  cartOutline,
  checkmarkCircle,
  colorPaletteOutline,
  helpCircleOutline,
  personOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrdersService, Order } from '../../services/orders.service';
import { ToastService } from '../../services/toast.service';
import { ValidationService } from '../../services/validation.service';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { HelpModalComponent } from '../../components/help-modal.component';

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
    TooltipDirective,
  ],
})
export class CheckoutPage implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly validationService = inject(ValidationService);
  private readonly authService = inject(AuthService);
  private readonly modalController = inject(ModalController);

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
  isLoading = signal(false);

  // Erros de validação por campo
  errors = signal<Record<string, string>>({});

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
      helpCircleOutline,
      personOutline,
      phonePortraitOutline,
    });
  }

  /**
   * Inicializa a página
   * Valida autenticação e redireciona para login se necessário
   * Preenche dados de utilizador se autenticado
   * Carrega dados salvos do Storage em caso de erro anterior
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
   * Valida campo individual em tempo real
   * Exibe erro inline se inválido
   * @param fieldName - Nome do campo a validar
   */
  validateField(fieldName: keyof typeof this.formData): void {
    const value = this.formData[fieldName];
    const currentErrors = { ...this.errors() };
    let validationResult: { isValid: boolean; error?: string } = { isValid: true };

    switch (fieldName) {
      case 'name':
        validationResult = this.validationService.validateName(value as string);
        break;
      case 'email':
        validationResult = this.validationService.validateEmail(value as string);
        break;
      case 'phone':
        validationResult = this.validationService.validatePhone(value as string);
        break;
      case 'address':
        validationResult = this.validationService.validateAddress(value as string);
        break;
      case 'city':
        validationResult = this.validationService.validateCity(value as string);
        break;
      case 'postalCode':
        validationResult = this.validationService.validatePostalCode(value as string);
        break;
    }

    if (validationResult.isValid) {
      delete currentErrors[fieldName];
    } else {
      currentErrors[fieldName] = validationResult.error || 'Campo inválido';
    }

    this.errors.set(currentErrors);
  }

  /**
   * Verifica se o formulário é válido
   * @returns true se todos os campos obrigatórios são válidos
   */
  isFormValid(): boolean {
    const validation = this.validationService.validateCheckoutForm(this.formData);
    return validation.isValid;
  }

  /**
   * Processa o pedido
   * Valida o formulário, simula o processamento e gera um ID de pedido
   * Guarda o pedido no histórico de encomendas
   * @async
   * @returns {Promise<void>}
   */
  async placeOrder(): Promise<void> {
    try {
      if (this.items().length === 0) {
        await this.toastService.warning('O carrinho está vazio.');
        return;
      }

      // Validar formulário completo
      const validation = this.validationService.validateCheckoutForm(this.formData);
      if (!validation.isValid) {
        this.errors.set(validation.errors);
        await this.toastService.error(
          `Preencha corretamente os campos assinalados. ${Object.values(validation.errors)[0]}`
        );
        return;
      }

      this.isLoading.set(true);

      // Simula o processamento do pedido no backend
      await this.delay(1500);

      // Gera ID único: "UE" + últimos 6 dígitos do timestamp
      this.orderId = `UE${Date.now().toString().slice(-6)}`;

      // Cria o objeto da encomenda com todos os detalhes
      const newOrder: Order = {
        id: this.orderId,
        userId: this.authService.user?.id || '',
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

      // Limpa erros
      this.errors.set({});

      // Exibe confirmação
      this.orderPlaced = true;
      await this.toastService.success('Encomenda confirmada com sucesso!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      await this.toastService.error(
        `Falha ao confirmar encomenda: ${errorMessage}. Tente novamente.`
      );
      console.error('Erro ao processar encomenda:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Abre o modal de ajuda
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

  /**
   * Navega de volta para o catálogo
   * @returns {void}
   */
  goToCatalog(): void {
    this.router.navigate(['/catalog']);
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
