import { Injectable, computed, signal } from '@angular/core';
import { Product } from './products.service';

export interface CartItem {
  product: Product;
  imageUrl: string;
  imagePosition: { x: number; y: number };
  imageScale: number;
  imageRotation: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  addItem(item: CartItem): void {
    this._items.update((current) => [...current, item]);
  }

  updateQuantity(index: number, quantity: number): void {
    if (quantity < 1) {
      return;
    }

    this._items.update((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, quantity } : item)),
    );
  }

  removeItem(index: number): void {
    this._items.update((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  clear(): void {
    this._items.set([]);
  }
}
