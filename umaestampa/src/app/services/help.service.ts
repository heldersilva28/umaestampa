import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Interface para tooltips
 */
export interface Tooltips {
  imageUpload: string;
  imagePosition: string;
  imageScale: string;
  imageRotation: string;
  addToCart: string;
  checkout: string;
  paymentMethod: string;
  shipping: string;
  [key: string]: string;
}

/**
 * Interface para item FAQ
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Interface para tutorial
 */
export interface Tutorial {
  id: string;
  title: string;
  steps: string[];
}

/**
 * Interface de conteúdo de ajuda
 */
export interface HelpContent {
  tooltips: Tooltips;
  faq: FAQItem[];
  tutorials: Tutorial[];
}

/**
 * Serviço para carregar e fornecer conteúdo de ajuda
 *
 * Carrega tooltips, FAQs e tutoriais do ficheiro help.json
 * Fornece métodos para aceder a informações de ajuda contextual.
 *
 * @example
 * // Obter tooltip
 * const tip = this.helpService.getTooltip('imageUpload');
 *
 * // Obter FAQ por ID
 * const faq = this.helpService.getFAQById('how-to-customize');
 *
 * // Obter todo o conteúdo
 * const allHelp = this.helpService.helpContent();
 */
@Injectable({
  providedIn: 'root',
})
export class HelpService {
  private readonly http = inject(HttpClient);

  // Signal para armazenar o conteúdo de ajuda carregado
  private readonly helpContentSignal = signal<HelpContent | null>(null);

  // Signal para rastrear loading state
  private readonly isLoading = signal(true);

  constructor() {
    this.loadHelpContent();
  }

  /**
   * Carrega o conteúdo de ajuda do ficheiro JSON
   */
  private loadHelpContent(): void {
    this.http.get<{ help: HelpContent }>('/assets/help.json').subscribe({
      next: (data) => {
        console.log('Help content loaded:', data);
        this.helpContentSignal.set(data.help);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Falha ao carregar conteúdo de ajuda:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Obter tooltip por chave
   */
  getTooltip(key: string): string | undefined {
    const content = this.helpContentSignal();
    if (!content) return undefined;
    return content.tooltips[key];
  }

  /**
   * Obter FAQ por ID
   */
  getFAQById(id: string): FAQItem | undefined {
    const content = this.helpContentSignal();
    if (!content) return undefined;
    return content.faq.find((item) => item.id === id);
  }

  /**
   * Obter todos os FAQs
   */
  getAllFAQs(): FAQItem[] {
    const content = this.helpContentSignal();
    return content?.faq || [];
  }

  /**
   * Buscar FAQ por termo
   */
  searchFAQ(term: string): FAQItem[] {
    const content = this.helpContentSignal();
    if (!content) return [];
    const lowerTerm = term.toLowerCase();
    return content.faq.filter(
      (item) =>
        item.question.toLowerCase().includes(lowerTerm) ||
        item.answer.toLowerCase().includes(lowerTerm),
    );
  }

  /**
   * Obter tutorial por ID
   */
  getTutorialById(id: string): Tutorial | undefined {
    const content = this.helpContentSignal();
    if (!content) return undefined;
    return content.tutorials.find((tutorial) => tutorial.id === id);
  }

  /**
   * Obter todos os tutoriais
   */
  getAllTutorials(): Tutorial[] {
    const content = this.helpContentSignal();
    return content?.tutorials || [];
  }

  /**
   * Obter todo o conteúdo de ajuda
   */
  getHelpContent(): HelpContent | null {
    return this.helpContentSignal();
  }

  /**
   * Sinal para acesso direto ao conteúdo (read-only)
   */
  get helpContent() {
    return this.helpContentSignal.asReadonly();
  }

  /**
   * Obter estado de loading
   */
  get loading() {
    return this.isLoading.asReadonly();
  }
}
