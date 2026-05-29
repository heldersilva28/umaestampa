import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, helpCircleOutline, searchOutline } from 'ionicons/icons';
import { HelpService, FAQItem, Tutorial } from '../services/help.service';

/**
 * Modal de Ajuda
 *
 * Componente standalone que exibe FAQs, tutoriais e tooltips.
 * Inclui busca em FAQs e navegação por abas.
 *
 * @component
 * @example
 * const modal = await modalController.create({
 *   component: HelpModalComponent,
 *   cssClass: 'help-modal'
 * });
 * await modal.present();
 */
@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss'],
})
export class HelpModalComponent implements OnInit {
  private readonly helpService = inject(HelpService);
  private readonly modalController = inject(ModalController);

  // Aba ativa: 'faqs', 'tutorials'
  activeTab = signal<'faqs' | 'tutorials'>('faqs');

  // Search term para filtrar FAQs
  searchTerm = signal('');

  // Todos os FAQs (atualiza quando HelpService carrega dados)
  allFAQs = signal<FAQItem[]>([]);

  // Todos os tutoriais (atualiza quando HelpService carrega dados)
  allTutorials = signal<Tutorial[]>([]);

  // FAQs filtradas (baseadas em search term)
  filteredFAQs = signal<FAQItem[]>([]);

  // FAQ selecionado para exibir detalhes
  selectedFAQ = signal<FAQItem | null>(null);

  // Tutorial selecionado para exibir detalhes
  selectedTutorial = signal<Tutorial | null>(null);

  constructor() {
    addIcons({ closeOutline, helpCircleOutline, searchOutline });
    // Effect: Reagir quando HelpService carrega FAQs e tutoriais
    effect(() => {
      const allFaqs = this.helpService.getAllFAQs();
      console.log('Help modal: FAQs loaded', allFaqs.length);
      this.allFAQs.set(allFaqs);
      this.filteredFAQs.set(allFaqs);

      const allTutorials = this.helpService.getAllTutorials();
      console.log('Help modal: Tutorials loaded', allTutorials.length);
      this.allTutorials.set(allTutorials);
    });
  }

  /**
   * Inicializar
   */
  ngOnInit(): void {
    // O effect no constructor já cuida de carregar os dados
  }

  /**
   * Atualizar tab ativa
   */
  onTabChange(tab: unknown): void {
    const selectedTab = tab as 'faqs' | 'tutorials';
    this.activeTab.set(selectedTab);
    this.selectedFAQ.set(null);
    this.selectedTutorial.set(null);
  }

  /**
   * Buscar em FAQs
   */
  onSearch(term: unknown): void {
    const searchTerm = (term || '') as string;
    this.searchTerm.set(searchTerm);

    if (!searchTerm || searchTerm.trim().length === 0) {
      this.filteredFAQs.set(this.allFAQs());
    } else {
      const searchResults = this.helpService.searchFAQ(searchTerm);
      this.filteredFAQs.set(searchResults);

      // Desselecionar FAQ se não estiver nos resultados
      const selected = this.selectedFAQ();
      if (selected && !searchResults.includes(selected)) {
        this.selectedFAQ.set(null);
      }
    }
  }

  /**
   * Selecionar FAQ para ver detalhes
   */
  selectFAQ(faq: FAQItem): void {
    this.selectedFAQ.set(this.selectedFAQ()?.id === faq.id ? null : faq);
  }

  /**
   * Selecionar tutorial para ver detalhes
   */
  selectTutorial(tutorial: Tutorial): void {
    this.selectedTutorial.set(
      this.selectedTutorial()?.id === tutorial.id ? null : tutorial
    );
  }

  /**
   * Fechar modal
   */
  closeModal(): void {
    this.modalController.dismiss();
  }
}
