import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { brushOutline } from 'ionicons/icons';
import { HeaderComponent } from '../../components/header.component';
import { Product, ProductsService } from '../../services/products.service';

/**
 * Página do Catálogo
 * Exibe a lista de produtos disponíveis para personalização
 * Permite navegação para a página de customização e carrinho
 * Inclui popover de autenticação quando utilizador está logado
 * @component
 * @example
 * <app-catalog></app-catalog>
 */
@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonIcon,
  ],
})
export class CatalogPage {
  readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  // Expõe o signal de produtos do serviço para o template
  readonly products = this.productsService.products$;

  /**
   * Construtor - Registra os ícones utilizar no template
   * @constructor
   */
  constructor() {
    addIcons({ brushOutline });
  }

  /**
   * Navega para a página de customização do produto selecionado
   * @param {Product} product - Produto selecionado
   */
  goToProduct(product: Product): void {
    this.router.navigate(['/customizer', product.id]);
  }

}
