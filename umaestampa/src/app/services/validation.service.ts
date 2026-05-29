import { Injectable } from '@angular/core';

/**
 * Resultado de validação
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Serviço centralizado para validação de dados
 * 
 * Fornece métodos de validação reutilizáveis com mensagens de erro consistentes.
 * Utilizado em formulários para validação em tempo real.
 * 
 * @example
 * const emailResult = this.validationService.validateEmail('user@example.com');
 * if (!emailResult.isValid) {
 *   this.emailError = emailResult.error;
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  // Padrões de validação
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  private readonly POSTAL_CODE_PT_REGEX = /^\d{4}-\d{3}$/;
  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Validar campo obrigatório
   */
  validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        error: `${fieldName} é obrigatório.`,
      };
    }
    return { isValid: true };
  }

  /**
   * Validar email
   */
  validateEmail(email: string): ValidationResult {
    if (!email) {
      return {
        isValid: false,
        error: 'Email é obrigatório.',
      };
    }

    if (!this.EMAIL_REGEX.test(email)) {
      return {
        isValid: false,
        error: 'Email inválido. Verifique o formato.',
      };
    }

    return { isValid: true };
  }

  /**
   * Validar telefone português
   */
  validatePhone(phone: string): ValidationResult {
    if (!phone) {
      return {
        isValid: false,
        error: 'Telefone é obrigatório.',
      };
    }

    if (!this.PHONE_REGEX.test(phone)) {
      return {
        isValid: false,
        error: 'Telefone inválido. Use formato: +351 912 345 678',
      };
    }

    return { isValid: true };
  }

  /**
   * Validar código postal português (XXXX-XXX)
   */
  validatePostalCode(postalCode: string): ValidationResult {
    if (!postalCode) {
      return {
        isValid: false,
        error: 'Código postal é obrigatório.',
      };
    }

    if (!this.POSTAL_CODE_PT_REGEX.test(postalCode)) {
      return {
        isValid: false,
        error: 'Código postal inválido. Use formato: 1000-001',
      };
    }

    return { isValid: true };
  }

  /**
   * Validar tamanho de ficheiro
   */
  validateFileSize(file: File, maxSize = this.MAX_FILE_SIZE): ValidationResult {
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `Ficheiro demasiado grande. Máximo: ${maxMB}MB. Actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
      };
    }
    return { isValid: true };
  }

  /**
   * Validar tipo MIME de imagem
   */
  validateImageType(file: File): ValidationResult {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de ficheiro não suportado. Tipos válidos: JPG, PNG, WebP, GIF`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validar resolução mínima de imagem (retorna aviso se baixa resolução)
   */
  validateImageResolution(
    file: File,
    minWidth = 300,
    minHeight = 300
  ): Promise<ValidationResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          if (img.width < minWidth || img.height < minHeight) {
            return resolve({
              isValid: false,
              error: `Resolução baixa (${img.width}x${img.height}). Recomendado: ${minWidth}x${minHeight}px ou superior. A imagem pode perder qualidade na impressão.`,
            });
          }
          return resolve({ isValid: true });
        };

        img.onerror = () => {
          return resolve({
            isValid: false,
            error: 'Falha ao carregar imagem. Ficheiro corrompido?',
          });
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        return resolve({
          isValid: false,
          error: 'Falha ao ler ficheiro.',
        });
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validar senha/password
   */
  validatePassword(password: string): ValidationResult {
    if (!password) {
      return {
        isValid: false,
        error: 'Password é obrigatória.',
      };
    }

    if (password.length < this.MIN_PASSWORD_LENGTH) {
      return {
        isValid: false,
        error: `Password deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validar morada (não vazio)
   */
  validateAddress(address: string): ValidationResult {
    return this.validateRequired(address, 'Morada');
  }

  /**
   * Validar cidade (não vazio)
   */
  validateCity(city: string): ValidationResult {
    return this.validateRequired(city, 'Cidade');
  }

  /**
   * Validar nome (não vazio, mínimo 2 caracteres)
   */
  validateName(name: string): ValidationResult {
    const requiredCheck = this.validateRequired(name, 'Nome');
    if (!requiredCheck.isValid) {
      return requiredCheck;
    }

    if (name.trim().length < 2) {
      return {
        isValid: false,
        error: 'Nome deve ter pelo menos 2 caracteres.',
      };
    }

    return { isValid: true };
  }

  /**
   * Validar formulário completo de checkout
   */
  validateCheckoutForm(formData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    const nameCheck = this.validateName(formData.name || '');
    if (!nameCheck.isValid) errors['name'] = nameCheck.error!;

    const emailCheck = this.validateEmail(formData.email || '');
    if (!emailCheck.isValid) errors['email'] = emailCheck.error!;

    const phoneCheck = this.validatePhone(formData.phone || '');
    if (!phoneCheck.isValid) errors['phone'] = phoneCheck.error!;

    const addressCheck = this.validateAddress(formData.address || '');
    if (!addressCheck.isValid) errors['address'] = addressCheck.error!;

    const cityCheck = this.validateCity(formData.city || '');
    if (!cityCheck.isValid) errors['city'] = cityCheck.error!;

    const postalCodeCheck = this.validatePostalCode(formData.postalCode || '');
    if (!postalCodeCheck.isValid) errors['postalCode'] = postalCodeCheck.error!;

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
