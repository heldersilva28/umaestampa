import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRange,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cartOutline, cloudUploadOutline, refreshOutline, remove } from 'ionicons/icons';
import { CartService } from '../../services/cart.service';
import { Product, ProductsService } from '../../services/products.service';

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
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonRange,
    IonTitle,
    IonToolbar,
  ],
})
export class CustomizerPage implements OnInit {
  @ViewChild('previewArea') previewArea?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly toastCtrl = inject(ToastController);

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

  /**
   * Construtor - Registra os ícones a utilizar no template
   * @constructor
   */
  constructor() {
    addIcons({ add, cartOutline, cloudUploadOutline, refreshOutline, remove });
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
   * Converte a imagem para formato Data URL para pré-visualização
   * @param {Event} event - Evento do input de ficheiro
   * @returns {void}
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      this.uploadedImage = readerEvent.target?.result as string;
      this.resetAdjustments();
    };
    reader.readAsDataURL(file);
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
      return;
    }

    await this.cartService.addItem({
      product: this.product,
      imageUrl: this.uploadedImage,
      imagePosition: this.imagePosition,
      imageScale: this.imageScale,
      imageRotation: this.imageRotation,
      quantity: 1,
    });

    const toast = await this.toastCtrl.create({
      message: `${this.product.name} adicionado ao carrinho.`,
      duration: 1800,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
    this.router.navigate(['/cart']);
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
