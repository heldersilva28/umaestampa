import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, arrowForwardOutline, bagOutline, remove, trashOutline } from 'ionicons/icons';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
  ],
})
export class CartPage {
  private readonly cartService = inject(CartService);

  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly shipping = computed(() => (this.subtotal() > 50 ? 0 : 4.99));
  readonly total = computed(() => this.subtotal() + this.shipping());

  constructor() {
    addIcons({ add, arrowForwardOutline, bagOutline, remove, trashOutline });
  }

  updateQuantity(index: number, quantity: number): void {
    this.cartService.updateQuantity(index, quantity);
  }

  removeItem(index: number): void {
    this.cartService.removeItem(index);
  }
}
