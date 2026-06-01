import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonRange,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cartOutline, cloudUploadOutline, refreshOutline, remove } from 'ionicons/icons';
import { HeaderComponent } from '../../components/header.component';
import { CartService } from '../../services/cart.service';
import { Product, ProductsService } from '../../services/products.service';
import { ToastService } from '../../services/toast.service';
import { ValidationService } from '../../services/validation.service';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { arrowBackOutline } from 'ionicons/icons';

/**
 * Página de Customização de Produtos
 * Permite ao utilizador fazer upload de uma imagem e personalizá-la
 * Oferece controles para ajustar posição, escala e rotação da imagem
 * @component
 * @example
 * <app-customizer></app-customizer>
 */
@Component({
  selector: 'app-customizer',
  templateUrl: './customizer.page.html',
  styleUrls: ['./customizer.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonLabel,
    IonRange,
    IonSpinner,
    TooltipDirective,
  ],
})
export class CustomizerPage implements OnInit {
  @ViewChild('previewArea') previewArea?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly validationService = inject(ValidationService);

  // Produto atualmente sendo customizado
  product: Product | undefined;

  // Imagem carregada pelo utilizador em formato Data URL
  uploadedImage: string | null = null;

  // Posição da imagem no produto (em percentagem de 0-100)
  imagePosition = { x: 50, y: 50 };

  // Escala da imagem (em percentagem: 100% = tamanho original)
  imageScale = 100;

  // Rotação da imagem (em graus, 0-360)
  imageRotation = 0;

  // Flag para controlar se o utilizador está a arrastar a imagem
  isDragging = false;

  // Loading state durante upload e validação
  isLoading = signal(false);

  // Mensagem de aviso de resolução
  resolutionWarning = signal<string | null>(null);

  /**
   * Construtor - Registra os ícones a utilizar no template
   * @constructor
   */
constructor() {
  addIcons({
    add,
    cartOutline,
    cloudUploadOutline,
    refreshOutline,
    remove,
    arrowBackOutline
  });
}

  /**
   * Inicialização do componente
   * Carrega o produto baseado no parâmetro de rota 'id'
   * Se o produto não existir, redireciona para o catálogo
   * @returns {void}
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.product = id ? this.productsService.getById(id) : undefined;

    if (!this.product) {
      this.router.navigate(['/catalog']);
    }
  }

  /**
   * Manipula a seleção de ficheiro de imagem
   * Valida tipo de ficheiro, tamanho e resolução
   * Exibe feedback ao utilizador
   * @async
   * @param {Event} event - Evento do input de ficheiro
   * @returns {Promise<void>}
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      this.isLoading.set(true);
      this.resolutionWarning.set(null);

      // Validar tipo de ficheiro
      const typeCheck = this.validationService.validateImageType(file);
      if (!typeCheck.isValid) {
        await this.toastService.error(typeCheck.error!);
        this.isLoading.set(false);
        return;
      }

      // Validar tamanho de ficheiro
      const sizeCheck = this.validationService.validateFileSize(file);
      if (!sizeCheck.isValid) {
        await this.toastService.error(sizeCheck.error!);
        this.isLoading.set(false);
        return;
      }

      // Validar resolução de imagem
      const resolutionCheck = await this.validationService.validateImageResolution(file);
      if (!resolutionCheck.isValid) {
        // Mostrar como aviso, não erro
        this.resolutionWarning.set(resolutionCheck.error!);
        await this.toastService.warning(resolutionCheck.error!);
      }

      // Ler ficheiro se passou validações
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        this.uploadedImage = readerEvent.target?.result as string;
        this.resetAdjustments();
        this.isLoading.set(false);
        this.toastService.success('Imagem carregada com sucesso!');
      };
      reader.onerror = async () => {
        await this.toastService.error('Falha ao carregar imagem. Tente novamente.');
        this.isLoading.set(false);
      };

      reader.readAsDataURL(file);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      await this.toastService.error(`Erro ao validar imagem: ${errorMessage}`);
      this.isLoading.set(false);
    }
  }

  /**
   * Inicia o arrasto da imagem
   * Captura o ponteiro e começa a registar movimentos
   * @param {PointerEvent} event - Evento de pointer down
   * @returns {void}
   */
  onPointerDown(event: PointerEvent): void {
    if (!this.uploadedImage || !this.previewArea) {
      return;
    }

    this.isDragging = true;
    this.previewArea.nativeElement.setPointerCapture(event.pointerId);
    this.updateImagePosition(event);
  }

  /**
   * Atualiza a posição da imagem durante o arrasto
   * Apenas processa eventos se isDragging for true
   * @param {PointerEvent} event - Evento de pointer move
   * @returns {void}
   */
  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    this.updateImagePosition(event);
  }

  /**
   * Termina o arrasto da imagem
   * Liberta a captura do ponteiro
   * @param {PointerEvent} event - Evento de pointer up
   * @returns {void}
   */
  onPointerUp(event: PointerEvent): void {
    this.isDragging = false;
    this.previewArea?.nativeElement.releasePointerCapture(event.pointerId);
  }

  /**
   * Repõe todos os ajustes da imagem aos valores padrão
   * Position: centro (50,50), Scale: 100%, Rotation: 0º
   * @returns {void}
   */
  resetAdjustments(): void {
    this.imagePosition = { x: 50, y: 50 };
    this.imageScale = 100;
    this.imageRotation = 0;
  }

  /**
   * Adiciona o produto customizado ao carrinho
   * Valida que existe produto e imagem carregada
   * Exibe notificação de sucesso e redireciona para o carrinho
   * @async
   * @returns {Promise<void>}
   */
  async addToCart(): Promise<void> {
    if (!this.product || !this.uploadedImage) {
      await this.toastService.error('Por favor carregue uma imagem antes de adicionar ao carrinho.');
      return;
    }

    try {
      this.isLoading.set(true);

      await this.cartService.addItem({
        product: this.product,
        imageUrl: this.uploadedImage,
        imagePosition: this.imagePosition,
        imageScale: this.imageScale,
        imageRotation: this.imageRotation,
        quantity: 1,
      });

      await this.toastService.success(`${this.product.name} adicionado ao carrinho!`);
      this.router.navigate(['/cart']);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      await this.toastService.error(`Falha ao adicionar ao carrinho: ${errorMessage}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Calcula a posição atualizada da imagem baseada no evento de pointer
   * Mantém a imagem dentro dos limites (5%-95%) da área de pré-visualização
   * @private
   * @param {PointerEvent} event - Evento do pointer
   * @returns {void}
   */
  private updateImagePosition(event: PointerEvent): void {
    if (!this.previewArea) {
      return;
    }

    event.preventDefault();
    const rect = this.previewArea.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.imagePosition = {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  }

}
