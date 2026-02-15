/**
 * Правила пароля (должны совпадать с бэкендом).
 * Минимум 8 символов, цифра, буква, спецсимвол.
 */

export interface PasswordCheck {
  id: string;
  labelKey: string;
  params?: Record<string, string | number>;
  passed: boolean;
}

const MIN_LENGTH = 8;

export function getPasswordChecks(
  password: string,
  currentPassword?: string
): PasswordCheck[] {
  const checks: PasswordCheck[] = [
    {
      id: 'minLength',
      labelKey: 'validation.minLength',
      params: { n: MIN_LENGTH },
      passed: password.length >= MIN_LENGTH,
    },
    {
      id: 'digit',
      labelKey: 'validation.hasDigit',
      passed: /\d/.test(password),
    },
    {
      id: 'letter',
      labelKey: 'validation.hasLetter',
      passed: /[a-zA-Zа-яА-Я]/.test(password),
    },
    {
      id: 'special',
      labelKey: 'validation.hasSpecial',
      passed: /[^a-zA-Zа-яА-Я0-9]/.test(password),
    },
  ];

  if (currentPassword !== undefined && currentPassword !== '') {
    checks.push({
      id: 'notSame',
      labelKey: 'validation.notSameAsCurrent',
      passed: password !== currentPassword,
    });
  }

  return checks;
}

export function allPasswordChecksPass(
  password: string,
  currentPassword?: string
): boolean {
  const checks = getPasswordChecks(password, currentPassword);
  return checks.every((c) => c.passed);
}

export const PASSWORD_MIN_LENGTH = MIN_LENGTH;
