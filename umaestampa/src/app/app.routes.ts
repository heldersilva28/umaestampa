import { Routes } from '@angular/router';

/**
 * Definição das rotas principais da aplicação UmaEstampa
 * Utiliza lazy loading com loadComponent para otimizar o carregamento
 * As rotas estão organizadas por funcionalidade (catálogo, customização, carrinho, etc)
 *
 * @example
 * - /catalog - Página de catálogo de produtos
 * - /customizer/:id - Página de customização de um produto específico
 * - /cart - Página do carrinho de compras
 * - /checkout - Página de finalização de compra
 * - /auth - Página de autenticação (login/registo)
 * - /order-history - Histórico de pedidos do utilizador
 */
export const routes: Routes = [
  // Rota padrão: redireciona para o catálogo
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },

  // Catálogo de produtos
  {
    path: 'catalog',
    loadComponent: () => import('./pages/catalog/catalog.page').then((m) => m.CatalogPage),
  },

  // Página de customização com parâmetro dinâmico (ID do produto)
  {
    path: 'customizer/:id',
    loadComponent: () =>
      import('./pages/customizer/customizer.page').then((m) => m.CustomizerPage),
  },

  // Carrinho de compras
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then((m) => m.CartPage),
  },

  // Checkout (finalização de compra)
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },

  // Autenticação (login/registo)
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then((m) => m.AuthPage),
  },

  // Histórico de pedidos
  {
    path: 'order-history',
    loadComponent: () =>
      import('./pages/order-history/order-history.page').then((m) => m.OrderHistoryPage),
  },
];
