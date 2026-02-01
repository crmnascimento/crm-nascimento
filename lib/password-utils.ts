
import bcrypt from 'bcryptjs';

// Validação de complexidade de senha
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // Verificar comprimento mínimo
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  // Verificar se tem pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  // Verificar se tem pelo menos um número
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  // Verificar se tem pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  // Determinar força da senha
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength = 'strong';
    } else if (password.length >= 10) {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

// Gerar senha temporária segura
export function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';
  
  let password = '';
  
  // Garantir pelo menos um de cada tipo
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Adicionar mais 6 caracteres aleatórios
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 0; i < 6; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Validar e-mail corporativo
export function validateCorporateEmail(email: string): boolean {
  const corporateDomain = '@nascimentoeadvogados.com.br';
  return email.toLowerCase().endsWith(corporateDomain);
}

// Obter strength color para UI
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}

// Obter strength text para UI
export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'Fraca';
    case 'medium':
      return 'Média';
    case 'strong':
      return 'Forte';
    default:
      return 'Indefinida';
  }
}
