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

  product: Product | undefined;
  uploadedImage: string | null = null;
  imagePosition = { x: 50, y: 50 };
  imageScale = 100;
  imageRotation = 0;
  isDragging = false;

  constructor() {
    addIcons({ add, cartOutline, cloudUploadOutline, refreshOutline, remove });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.product = id ? this.productsService.getById(id) : undefined;

    if (!this.product) {
      this.router.navigate(['/catalog']);
    }
  }

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

  onPointerDown(event: PointerEvent): void {
    if (!this.uploadedImage || !this.previewArea) {
      return;
    }

    this.isDragging = true;
    this.previewArea.nativeElement.setPointerCapture(event.pointerId);
    this.updateImagePosition(event);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    this.updateImagePosition(event);
  }

  onPointerUp(event: PointerEvent): void {
    this.isDragging = false;
    this.previewArea?.nativeElement.releasePointerCapture(event.pointerId);
  }

  resetAdjustments(): void {
    this.imagePosition = { x: 50, y: 50 };
    this.imageScale = 100;
    this.imageRotation = 0;
  }

  async addToCart(): Promise<void> {
    if (!this.product || !this.uploadedImage) {
      return;
    }

    this.cartService.addItem({
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
