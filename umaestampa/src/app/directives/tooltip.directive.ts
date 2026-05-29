import { Directive, ElementRef, OnInit, inject, input as inputFn } from '@angular/core';

/**
 * Diretiva para exibir tooltips em elementos
 *
 * Usa o atributo title nativo do HTML para exibir tooltips
 * Funciona em desktop (hover) e mobile (long press)
 *
 * @example
 * <input type="email" appTooltip="Insira um email válido (ex: user@example.pt)" />
 * <button appTooltip="Clique para confirmar a encomenda">Confirmar</button>
 *
 * @selector [appTooltip]
 * @attribute appTooltip - Mensagem de ajuda a exibir
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnInit {
  private readonly elementRef = inject(ElementRef);

  // Input: mensagem do tooltip
  tooltipMessage = inputFn.required<string>({ alias: 'appTooltip' });

  constructor() {
    // Garantir que o elemento tem cursor pointer para melhor UX
    const el = this.elementRef.nativeElement as HTMLElement;
    if (el.tagName !== 'BUTTON' && el.tagName !== 'ION-BUTTON') {
      el.style.cursor = 'help';
    }
  }

  ngOnInit(): void {
    // Aplicar o título nativo do HTML
    const message = this.tooltipMessage();
    if (message) {
      const el = this.elementRef.nativeElement as HTMLElement;
      el.setAttribute('title', message);
    }
  }
}

