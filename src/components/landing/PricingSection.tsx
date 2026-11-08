import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getPublicPlans, type PublicPlan } from '../../services/api';
import styles from './PricingSection.module.css';

type LoadState = 'loading' | 'ready' | 'error';

function pluralForm(count: number): 'one' | 'few' | 'many' {
  const abs = Math.abs(Math.trunc(count)) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'many';
  if (last === 1) return 'one';
  if (last >= 2 && last <= 4) return 'few';
  return 'many';
}

function formatPrice(value: number, locale: string): string {
  const hasFraction = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(value);
}

function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ru-RU').format(value);
}

export default function PricingSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { t, locale } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    getPublicPlans()
      .then((res) => {
        if (cancelled) return;
        setPlans(res.success && res.data?.plans ? res.data.plans : []);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ctaTo = isAuthenticated ? '/dashboard' : '/register';

  return (
    <section className={styles.section} id="pricing" ref={ref}>
      <div className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
        <h2>{t('landing.pricingTitle')}</h2>
        <p className={styles.subtitle}>{t('landing.pricingSubtitle')}</p>
      </div>

      {state === 'loading' && <p className={styles.status}>{t('landing.pricingLoading')}</p>}
      {state === 'error' && (
        <p className={styles.status} role="alert">
          {t('landing.pricingError')}
        </p>
      )}
      {state === 'ready' && plans.length === 0 && (
        <p className={styles.status}>{t('landing.pricingEmpty')}</p>
      )}

      {state === 'ready' && plans.length > 0 && (
        <div className={`${styles.grid} ${isVisible ? styles.visible : ''}`}>
          {plans.map((plan, index) => {
            const price = Number(plan.priceNew) || 0;
            const oldPrice = Number(plan.priceOld) || 0;
            const hasDiscount = oldPrice > price;
            const discount = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : 0;
            const isFree = price === 0;
            const form = pluralForm(plan.limit);
            const formKey = form === 'one' ? 'One' : form === 'few' ? 'Few' : 'Many';
            const unitKey = plan.countByTasks ? 'planTasks' : 'planDownloads';

            return (
              <article
                key={plan.id}
                className={`${styles.card} ${hasDiscount ? styles.cardHighlighted : ''}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className={styles.badgeRow}>
                  {(isFree || discount > 0) && (
                    <div className={styles.badge}>
                      {isFree
                        ? t('landing.pricingFree')
                        : t('landing.pricingDiscount', { percent: discount })}
                    </div>
                  )}
                </div>
                <h3 className={styles.name}>{plan.name}</h3>
                <div className={styles.price}>
                  {hasDiscount && (
                    <span className={styles.priceOld}>
                      <span className={styles.srOnly}>
                        {t('landing.pricingOldPrice', { price: formatPrice(oldPrice, locale) })}
                      </span>
                      <span aria-hidden>{formatPrice(oldPrice, locale)}</span>
                    </span>
                  )}
                  <span className={styles.priceValue}>{formatPrice(price, locale)}</span>
                </div>
                <div className={styles.limit}>
                  <span className={styles.limitValue}>{formatCount(plan.limit, locale)}</span>
                  <span className={styles.limitCaption}>{t(`landing.${unitKey}${formKey}`)}</span>
                </div>
                <Link to={ctaTo}>
                  <Button variant={hasDiscount || isFree ? 'primary' : 'outline'} fullWidth className={styles.cta}>
                    {isFree ? t('landing.pricingCtaFree') : t('landing.pricingCta')}
                  </Button>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
