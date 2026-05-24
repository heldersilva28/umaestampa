import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
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
import { CartService } from '../../services/cart.service';

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
export class CheckoutPage {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  readonly items = this.cartService.items;
  readonly cartCount = this.cartService.count;
  readonly subtotal = this.cartService.subtotal;
  readonly shipping = computed(() => 0);
  readonly total = computed(() => (this.items().length === 0 ? 0 : this.subtotal() + this.shipping()));

  orderPlaced = false;
  orderId = '';
  isLoading = false;

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

    this.isLoading = true;
    await this.delay(1000);
    this.isLoading = false;

    this.orderId = `UE${Date.now().toString().slice(-6)}`;
    this.orderPlaced = true;
    this.cartService.clear();
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
