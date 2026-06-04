import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

export interface CustomizerDraft {
  productId: string;
  imageUrl: string;
  imagePosition: { x: number; y: number };
  imageScale: number;
  imageRotation: number;
}

const CUSTOMIZER_DRAFT_KEY = 'customizer_draft';

@Injectable({ providedIn: 'root' })
export class CustomizerDraftService {
  private readonly storageService = inject(StorageService);

  async saveDraft(draft: CustomizerDraft): Promise<void> {
    await this.storageService.set(CUSTOMIZER_DRAFT_KEY, draft);
  }

  async getDraft(): Promise<CustomizerDraft | null> {
    return await this.storageService.get<CustomizerDraft>(CUSTOMIZER_DRAFT_KEY);
  }

  async clearDraft(): Promise<void> {
    await this.storageService.remove(CUSTOMIZER_DRAFT_KEY);
  }
}