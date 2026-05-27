import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Interface para representar um produto na aplicação
 * @interface Product
 * @property {string} id - Identificador único do produto
 * @property {string} name - Nome do produto
 * @property {string} description - Descrição detalhada do produto
 * @property {number} price - Preço do produto em euros
 * @property {string} image - URL da imagem do produto
 * @property {string} category - Categoria do produto (ex: Acessórios, Vestuário, Casa)
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

/**
 * Serviço para gerenciar produtos da aplicação
 * Responsável por carregar produtos do ficheiro JSON e fornecer métodos de acesso aos dados
 * @class ProductsService
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  // Signal para armazenar a lista de produtos reativa
  readonly products$ = signal<Product[]>([]);

  /**
   * Construtor do serviço ProductsService
   * @constructor
   * @param {HttpClient} http - Cliente HTTP para fazer requisições
   */
  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  /**
   * Carrega produtos do ficheiro JSON (assets/products.json)
   * Utiliza HttpClient para fazer uma requisição GET ao ficheiro de configuração
   * @private
   * @async
   * @returns {Promise<void>}
   */
  private async loadProducts(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<Product[]>('/assets/products.json'));
      this.products$.set(data);
    } catch (error) {
      console.error('Erro ao carregar produtos do JSON:', error);
      this.products$.set([]);
    }
  }

  /**
   * Obtém todos os produtos
   * @returns {Product[]} Array com todos os produtos carregados
   */
  getAll(): Product[] {
    return this.products$();
  }

  /**
   * Procura um produto pelo ID
   * @param {string} id - ID do produto a procurar
   * @returns {Product | undefined} Produto encontrado ou undefined se não existir
   */
  getById(id: string): Product | undefined {
    return this.products$().find((product) => product.id === id);
  }
}
