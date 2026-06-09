import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Product } from './products.service';
import { StorageService, STORAGE_KEYS } from './storage.service';

export interface SavedDesign {
  id: string;
  userId: string;
  product: Product;
  imageUrl: string;
  imagePosition: { x: number; y: number };
  imageScale: number;
  imageRotation: number;
  savedAt: Date;
}

export interface SaveDesignInput {
  product: Product;
  imageUrl: string;
  imagePosition: { x: number; y: number };
  imageScale: number;
  imageRotation: number;
}

@Injectable({ providedIn: 'root' })
export class DesignsService {
  private readonly storageService = inject(StorageService);
  private readonly authService = inject(AuthService);

  private readonly _designs = signal<SavedDesign[]>([]);

  readonly designs = this._designs.asReadonly();

  readonly designCount = computed(() => this._designs().length);

  constructor() {
    this.loadDesignsForCurrentUser();
  }

  private getDesignStorageKey(userId: string): string {
    return `${STORAGE_KEYS.SAVED_DESIGNS}:${userId}`;
  }

  private async loadDesignsForCurrentUser(): Promise<void> {
    try {
      const user = this.authService.user;
      if (!user) {
        this._designs.set([]);
        return;
      }

      const storageKey = this.getDesignStorageKey(user.id);
      const savedDesigns = await this.storageService.get<SavedDesign[]>(storageKey);

      if (savedDesigns && Array.isArray(savedDesigns)) {
        this._designs.set(
          savedDesigns.map((design) => ({
            ...design,
            savedAt: new Date(design.savedAt),
          })),
        );
      } else {
        this._designs.set([]);
      }
    } catch (error) {
      console.warn('Erro ao carregar designs guardados:', error);
      this._designs.set([]);
    }
  }

  async saveDesign(design: SaveDesignInput): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      console.warn('Utilizador não autenticado. Design não foi guardado.');
      return;
    }

    const savedDesign: SavedDesign = {
      id: `design_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      product: design.product,
      imageUrl: design.imageUrl,
      imagePosition: design.imagePosition,
      imageScale: design.imageScale,
      imageRotation: design.imageRotation,
      savedAt: new Date(),
    };

    this._designs.update((current) => [savedDesign, ...current]);
    await this.saveDesignsForCurrentUser();
  }

  async updateDesign(designId: string, input: SaveDesignInput): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      console.warn('Utilizador não autenticado. Design não foi atualizado.');
      return;
    }

    this._designs.update((current) =>
      current.map((design) =>
        design.id === designId
          ? {
              ...design,
              product: input.product,
              imageUrl: input.imageUrl,
              imagePosition: input.imagePosition,
              imageScale: input.imageScale,
              imageRotation: input.imageRotation,
              savedAt: new Date(),
            }
          : design,
      ),
    );

    await this.saveDesignsForCurrentUser();
  }

  async removeDesign(designId: string): Promise<void> {
    this._designs.update((current) => current.filter((design) => design.id !== designId));
    await this.saveDesignsForCurrentUser();
  }

  async refreshDesigns(): Promise<void> {
    await this.loadDesignsForCurrentUser();
  }

  async clearDesigns(): Promise<void> {
    this._designs.set([]);
    const user = this.authService.user;
    if (user) {
      await this.storageService.remove(this.getDesignStorageKey(user.id));
    }
  }

  private async saveDesignsForCurrentUser(): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      console.warn('Utilizador não autenticado. Designs não foram guardados.');
      return;
    }

    const storageKey = this.getDesignStorageKey(user.id);
    await this.storageService.set(storageKey, this._designs());
  }
}
