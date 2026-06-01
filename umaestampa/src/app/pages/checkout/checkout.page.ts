import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  businessOutline,
  cardOutline,
  checkmarkCircle,
  phonePortraitOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header.component';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrdersService, Order } from '../../services/orders.service';
import { ToastService } from '../../services/toast.service';
import { ValidationService } from '../../services/validation.service';
import { TooltipDirective } from '../../directives/tooltip.directive';

type CheckoutStep = 1 | 2 | 3;

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
    HeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonSpinner,
    IonTextarea,
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

  // Itens do carrinho
  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;

  // Envio: €4.99 por defeito, grátis acima de €50
  readonly shipping = computed(() => {
    const subtotalValue = this.subtotal();
    return subtotalValue >= 50 ? 0 : 4.99;
  });

  // Total = subtotal + envio
  readonly total = computed(() => (this.items().length === 0 ? 0 : this.subtotal() + this.shipping()));

  // Flag: indica se o pedido foi colocado com sucesso
  orderPlaced = false;

  // ID único do pedido gerado
  orderId = '';

  // Flag: indica se a requisição de checkout está em progresso
  isLoading = signal(false);

  // Erros de validação por campo
  errors = signal<Record<string, string>>({});

  // Passo atual do checkout: 1 dados, 2 pagamento, 3 resumo
  currentStep = signal<CheckoutStep>(1);

  readonly checkoutSteps: Array<{ value: CheckoutStep; label: string }> = [
    { value: 1, label: 'Dados' },
    { value: 2, label: 'Pagamento' },
    { value: 3, label: 'Resumo' },
  ];

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
      checkmarkCircle,
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
    
    // Inicializa com prefixo +351 se não tiver telefone
    if (!this.formData.phone) {
      this.formData.phone = '+351';
    }
  }

  /**
   * Formata o código postal automaticamente com "-" após 4 dígitos
   * Permite apenas 7 dígitos + 1 "-" (total 8 caracteres)
   * @param value - Valor do código postal
   */
  formatPostalCode(value: string | null | undefined): void {
    if (!value) return;
    
    // Remove tudo exceto dígitos
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limita a 7 dígitos
    const limitedDigits = digitsOnly.substring(0, 7);
    
    // Formata com "-" após 4 dígitos
    if (limitedDigits.length <= 4) {
      this.formData.postalCode = limitedDigits;
    } else {
      this.formData.postalCode = limitedDigits.substring(0, 4) + '-' + limitedDigits.substring(4);
    }
  }

  /**
   * Formata o telefone mantendo apenas o prefixo +351
   * @param value - Valor do telefone
   */
  formatPhone(value: string | null | undefined): void {
    if (!value) return;
    if (!value.startsWith('+351')) {
      this.formData.phone = '+351' + value.replace(/[^\d]/g, '');
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
   * Avança no checkout, validando os dados obrigatórios no primeiro passo
   * @returns {Promise<void>}
   */
  async nextStep(): Promise<void> {
    if (this.currentStep() === 1 && !this.validateCustomerAndAddress()) {
      await this.toastService.error('Preencha corretamente os dados de contacto e morada.');
      return;
    }

    if (this.currentStep() === 1) {
      this.currentStep.set(2);
      return;
    }

    if (this.currentStep() === 2) {
      this.currentStep.set(3);
    }
  }

  /**
   * Volta um passo no checkout
   * @returns {void}
   */
  previousStep(): void {
    if (this.currentStep() === 3) {
      this.currentStep.set(2);
      return;
    }

    if (this.currentStep() === 2) {
      this.currentStep.set(1);
    }
  }

  /**
   * Permite navegar para passos anteriores ou para o próximo passo validável
   * @param step Passo pretendido
   * @returns {Promise<void>}
   */
  async goToStep(step: CheckoutStep): Promise<void> {
    if (step === this.currentStep()) {
      return;
    }

    if (step < this.currentStep()) {
      this.currentStep.set(step);
      return;
    }

    if (step > (this.currentStep() + 1)) {
      return;
    }

    if (step === 2) {
      await this.nextStep();
      return;
    }

    if (step === 3) {
      this.currentStep.set(3);
    }
  }

  /**
   * Indica se um passo já foi completado para estilização da barra
   * @param step Passo do checkout
   * @returns true se o passo já ficou para trás
   */
  isStepComplete(step: CheckoutStep): boolean {
    return step < this.currentStep();
  }

  /**
   * Texto legível do método de pagamento selecionado
   * @returns Nome do método de pagamento
   */
  paymentMethodLabel(): string {
    switch (this.formData.paymentMethod) {
      case 'mbway':
        return 'MB WAY';
      case 'transfer':
        return 'Transferência Bancária';
      default:
        return 'Cartão de Crédito/Débito';
    }
  }

  private validateCustomerAndAddress(): boolean {
    const validation = this.validationService.validateCheckoutForm(this.formData);
    this.errors.set(validation.errors);
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

      if (!this.validateCustomerAndAddress()) {
        await this.toastService.error(
          `Preencha corretamente os campos assinalados. ${Object.values(this.errors())[0]}`
        );
        this.currentStep.set(1);
        return;
      }

      this.currentStep.set(3);

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
        status: 'Em processamento',
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
