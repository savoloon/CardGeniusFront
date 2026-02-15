import { SmartCaptcha } from '@yandex/smart-captcha';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './CaptchaWidget.module.css';

const DEFAULT_SITE_KEY = import.meta.env.VITE_KEY_CAPTCHA ?? '';

export interface CaptchaWidgetProps {
  /** Токен капчи после успешного прохождения */
  onSuccess: (token: string) => void;
  /** Ключ сайта (по умолчанию из VITE_KEY_CAPTCHA) */
  sitekey?: string;
}

export default function CaptchaWidget({ onSuccess, sitekey = DEFAULT_SITE_KEY }: CaptchaWidgetProps) {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useLanguage();
  const captchaTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const captchaLang = locale === 'en' ? 'en' : 'ru';

  if (!sitekey) {
    return (
      <p className={styles.disabled}>
        {t('captcha.disabled')}
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <SmartCaptcha
        key={`${captchaTheme}-${captchaLang}`}
        sitekey={sitekey}
        theme={captchaTheme}
        language={captchaLang}
        onSuccess={onSuccess}
      />
    </div>
  );
}
