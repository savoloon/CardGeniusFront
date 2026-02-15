import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import LandingHeader from '../../components/layout/LandingHeader';
import { LandingBackground } from '../../components/landing';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  HeroSection,
  StatsSection,
  VideoSection,
  PainsSection,
  SolutionSection,
  CasesSection,
  ToolsSection,
  TrustSection,
  PricingSection,
  FinalCTASection,
} from '../../components/landing';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  useSmoothScroll();
  const { t } = useLanguage();

  return (
    <>
      <LandingBackground />
      <LandingHeader />
      <main className={styles.main}>
        <HeroSection />
        <StatsSection />
        <VideoSection />
        <PainsSection />
        <SolutionSection />
        <CasesSection />
        <ToolsSection />
        <TrustSection />
        <PricingSection />
        <FinalCTASection />
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span className={styles.logo}>{t('landing.footerLogo')}</span>
            <p className={styles.copyright}>
              {t('landing.footerCopy', { year: new Date().getFullYear() })}
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
