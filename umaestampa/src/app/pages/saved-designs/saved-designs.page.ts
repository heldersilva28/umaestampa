import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cartOutline, bookmarkOutline, imagesOutline, pencilOutline, trashOutline } from 'ionicons/icons';
import { HeaderComponent } from '../../components/header.component';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CustomizerDraftService } from '../../services/customizer-draft.service';
import { DesignsService, SavedDesign } from '../../services/designs.service';

@Component({
  selector: 'app-saved-designs',
  templateUrl: './saved-designs.page.html',
  styleUrls: ['./saved-designs.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, IonButton, IonContent, IonIcon],
})
export class SavedDesignsPage implements OnInit {
  private readonly designsService = inject(DesignsService);
  private readonly alertService = inject(AlertService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly draftService = inject(CustomizerDraftService);
  private readonly router = inject(Router);

  readonly designs = this.designsService.designs;
  readonly designCount = this.designsService.designCount;

  constructor() {
    addIcons({ arrowBackOutline, bookmarkOutline, cartOutline, imagesOutline, pencilOutline, trashOutline });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth']);
      return;
    }

    this.designsService.refreshDesigns();
  }

  previewTransform(design: SavedDesign): string {
    return `translate(-50%, -50%) scale(${design.imageScale / 100}) rotate(${design.imageRotation}deg)`;
  }

  async editDesign(design: SavedDesign): Promise<void> {
    await this.draftService.saveDraft({
      productId: design.product.id,
      imageUrl: design.imageUrl,
      imagePosition: design.imagePosition,
      imageScale: design.imageScale,
      imageRotation: design.imageRotation,
    });

    this.router.navigate(['/customizer', design.product.id]);
  }

  async addDesignToCart(design: SavedDesign): Promise<void> {
    await this.draftService.saveDraft({
      productId: design.product.id,
      imageUrl: design.imageUrl,
      imagePosition: design.imagePosition,
      imageScale: design.imageScale,
      imageRotation: design.imageRotation,
    });

    await this.cartService.addItem({
      product: design.product,
      imageUrl: design.imageUrl,
      imagePosition: design.imagePosition,
      imageScale: design.imageScale,
      imageRotation: design.imageRotation,
      quantity: 1,
    });

    this.router.navigate(['/cart']);
  }

  async removeDesign(designId: string): Promise<void> {
    const design = this.designs().find((item) => item.id === designId);
    if (!design) {
      return;
    }

    const confirmed = await this.alertService.confirm({
      title: 'Remover design?',
      message: `Tem a certeza que quer remover "${design.product.name}" dos designs guardados?`,
      okText: 'Remover',
      cancelText: 'Cancelar',
    });

    if (!confirmed) {
      return;
    }

    await this.designsService.removeDesign(designId);
  }
}