import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { brushOutline, cartOutline, personOutline } from 'ionicons/icons';
import { CartService } from '../../services/cart.service';
import { Product, ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonToolbar,
  ],
})
export class CatalogPage {
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);

  readonly products: Product[] = this.productsService.getAll();
  readonly cartCount = this.cartService.count;

  constructor() {
    addIcons({ brushOutline, cartOutline, personOutline });
  }

  goToProduct(product: Product): void {
    this.router.navigate(['/customizer', product.id]);
  }
}
