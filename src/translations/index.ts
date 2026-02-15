export type Locale = 'ru' | 'en';

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey));
    } else if (typeof value === 'string') {
      result[fullKey] = value;
    }
  }
  return result;
}

const ru: Record<string, unknown> = {
  common: {
    login: 'Войти',
    register: 'Зарегистрироваться',
    profile: 'Профиль',
    admin: 'Админ',
    logout: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    panel: 'Панель',
    back: 'Назад',
    cancel: 'Отмена',
    save: 'Сохранить',
    next: 'Далее',
    themeLight: 'Включить светлую тему',
    themeDark: 'Включить тёмную тему',
    langEn: 'English',
    langRu: 'Русский',
  },
  layout: {
    tagline: 'Карточки товаров для Wildberries, Ozon, Яндекс.Маркет',
    menuHow: 'Как это работает',
    menuCases: 'Кейсы',
    menuTools: 'Возможности',
    menuPricing: 'Тарифы',
  },
  auth: {
    loginTitle: 'Вход',
    loginSubtitle: 'Войдите в аккаунт для управления карточками товаров',
    registerTitle: 'Регистрация',
    registerSubtitle: 'Создайте аккаунт для управления карточками товаров',
    emailRequired: 'Email обязателен',
    emailInvalid: 'Введите корректный email',
    passwordRequired: 'Пароль обязателен',
    confirmPassword: 'Подтвердите пароль',
    confirmPasswordPlaceholder: 'Повторите пароль',
    noAccount: 'Нет аккаунта?',
    hasAccount: 'Уже есть аккаунт?',
    loginSuccess: 'Вход выполнен! Добро пожаловать, {email}',
    registerSuccess: 'Регистрация успешна! Добро пожаловать, {email}',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    repeatNewPassword: 'Повторите новый пароль',
    changePassword: 'Сменить пароль',
    saveEmail: 'Сохранить email',
    savePassword: 'Сохранить пароль',
    newEmail: 'Новый email',
    passwordChanged: 'Пароль изменён',
    emailUpdated: 'Email обновлён',
    loginError: 'Ошибка входа',
    registerError: 'Ошибка регистрации',
    connectionError: 'Ошибка подключения к серверу',
    saveError: 'Ошибка сохранения',
    changePasswordError: 'Ошибка смены пароля',
  },
  validation: {
    requirementsLabel: 'Требования к паролю',
    passwordRequirements: 'Пароль не соответствует требованиям',
    passwordsMismatch: 'Пароли не совпадают',
    minLength: 'Не менее {n} символов',
    hasDigit: 'Есть цифра',
    hasLetter: 'Есть буква (латиница или кириллица)',
    hasSpecial: 'Есть спецсимвол (не буква и не цифра)',
    notSameAsCurrent: 'Новый пароль отличается от текущего',
  },
  captcha: {
    disabled: 'Капча не настроена (нет VITE_KEY_CAPTCHA)',
  },
  profile: {
    title: 'Профиль',
    subtitle: 'Email и смена пароля',
    email: 'Email',
  },
  admin: {
    title: 'Панель администратора',
    subtitle: 'Управление тарифами и пользователями',
    tabUsers: 'Пользователи',
    tabPlans: 'Тарифы',
    loading: 'Загрузка...',
    noUsers: 'Нет пользователей',
    noPlans: 'Нет тарифов. Добавьте тарифы в базе данных.',
    roleAdmin: 'Админ',
    roleUser: 'Пользователь',
    regDate: 'Дата регистрации',
    role: 'Роль',
    statusActive: 'Активен',
    statusInactive: 'Неактивен',
    price: 'Цена',
    name: 'Название',
    status: 'Статус',
    loadUsersError: 'Ошибка загрузки пользователей',
    loadPlansError: 'Ошибка загрузки тарифов',
  },
  dashboard: {
    title: 'Обработка изображений',
    subtitle: 'Загрузите изображение и выберите режим обработки. AI создаст результат в очереди.',
    process: 'Обработать',
    newImage: 'Новое изображение',
    emptyHint: 'Загрузите изображение и нажмите «Обработать»',
    uploadImage: 'Загрузите изображение',
    uploadImageError: 'Загрузите изображение',
  },
  landing: {
    heroEyebrow: 'AI для маркетплейсов',
    heroTitle: 'Вдохни жизнь в карточки товаров.',
    heroTitle2: 'Искусственный интеллект для продающих изображений.',
    heroSubtitle: 'Загрузите фото товара - получите десятки вариантов для Wildberries, Ozon, Яндекс.Маркет. Автоматическая обработка фона, AI-примерка и ретушь в одном сервисе.',
    heroCta: 'Создать первую карточку бесплатно',
    heroDemo: 'Смотреть демо (60 сек)',
    heroSecondary: 'Как это работает',
    footerLogo: '◇ Card Genius AI',
    footerCopy: '© {year} Card Genius AI. Карточки товаров для маркетплейсов.',
  },
  placeholders: {
    email: 'example@mail.com',
    password: 'Введите пароль',
    passwordMin: 'Минимум 8 символов, цифра, буква, спецсимвол',
    currentPassword: 'Введите текущий пароль',
    newPasswordHint: 'Минимум 8 символов, цифра, буква, спецсимвол',
    repeatPassword: 'Повторите пароль',
  },
};

const en: Record<string, unknown> = {
  common: {
    login: 'Log in',
    register: 'Sign up',
    profile: 'Profile',
    admin: 'Admin',
    logout: 'Log out',
    email: 'Email',
    password: 'Password',
    panel: 'Dashboard',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    next: 'Next',
    themeLight: 'Switch to light theme',
    themeDark: 'Switch to dark theme',
    langEn: 'English',
    langRu: 'Русский',
  },
  layout: {
    tagline: 'Product cards for Wildberries, Ozon, Yandex.Market',
    menuHow: 'How it works',
    menuCases: 'Cases',
    menuTools: 'Features',
    menuPricing: 'Pricing',
  },
  auth: {
    loginTitle: 'Log in',
    loginSubtitle: 'Sign in to manage your product cards',
    registerTitle: 'Sign up',
    registerSubtitle: 'Create an account to manage product cards',
    emailRequired: 'Email is required',
    emailInvalid: 'Enter a valid email',
    passwordRequired: 'Password is required',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat password',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loginSuccess: 'Welcome back, {email}!',
    registerSuccess: 'Registration successful. Welcome, {email}!',
    currentPassword: 'Current password',
    newPassword: 'New password',
    repeatNewPassword: 'Repeat new password',
    changePassword: 'Change password',
    saveEmail: 'Save email',
    savePassword: 'Save password',
    newEmail: 'New email',
    passwordChanged: 'Password changed',
    emailUpdated: 'Email updated',
    loginError: 'Login failed',
    registerError: 'Registration failed',
    connectionError: 'Server connection error',
    saveError: 'Save failed',
    changePasswordError: 'Failed to change password',
  },
  validation: {
    requirementsLabel: 'Password requirements',
    passwordRequirements: 'Password does not meet requirements',
    passwordsMismatch: 'Passwords do not match',
    minLength: 'At least {n} characters',
    hasDigit: 'Contains a digit',
    hasLetter: 'Contains a letter (Latin or Cyrillic)',
    hasSpecial: 'Contains a special character',
    notSameAsCurrent: 'New password differs from current',
  },
  captcha: {
    disabled: 'Captcha is not configured (missing VITE_KEY_CAPTCHA)',
  },
  profile: {
    title: 'Profile',
    subtitle: 'Email and password',
    email: 'Email',
  },
  admin: {
    title: 'Admin panel',
    subtitle: 'Manage plans and users',
    tabUsers: 'Users',
    tabPlans: 'Plans',
    loading: 'Loading...',
    noUsers: 'No users',
    noPlans: 'No plans. Add plans in the database.',
    roleAdmin: 'Admin',
    roleUser: 'User',
    regDate: 'Registration date',
    role: 'Role',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    price: 'Price',
    name: 'Name',
    status: 'Status',
    loadUsersError: 'Failed to load users',
    loadPlansError: 'Failed to load plans',
  },
  dashboard: {
    title: 'Image processing',
    subtitle: 'Upload an image and choose a processing mode. AI will queue the result.',
    process: 'Process',
    newImage: 'New image',
    emptyHint: 'Upload an image and click "Process"',
    uploadImage: 'Upload image',
    uploadImageError: 'Upload image',
  },
  landing: {
    heroEyebrow: 'AI for marketplaces',
    heroTitle: 'Bring product cards to life.',
    heroTitle2: 'AI for compelling product imagery.',
    heroSubtitle: 'Upload a product photo — get dozens of variants for Wildberries, Ozon, Yandex.Market. Auto background, AI try-on and retouch in one service.',
    heroCta: 'Create your first card free',
    heroDemo: 'Watch demo (60 sec)',
    heroSecondary: 'How it works',
    footerLogo: '◇ Card Genius AI',
    footerCopy: '© {year} Card Genius AI. Product cards for marketplaces.',
  },
  placeholders: {
    email: 'example@mail.com',
    password: 'Enter password',
    passwordMin: 'Min 8 characters, digit, letter, special character',
    currentPassword: 'Enter current password',
    newPasswordHint: 'Min 8 characters, digit, letter, special character',
    repeatPassword: 'Repeat password',
  },
};

const ruFlat = flatten(ru);
const enFlat = flatten(en);

const messages: Record<Locale, Record<string, string>> = {
  ru: ruFlat,
  en: enFlat,
};

export function getTranslation(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let text = messages[locale][key] ?? messages.ru[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export { ru, en };
