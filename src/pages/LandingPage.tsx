import { useSmoothScroll } from '../hooks/useSmoothScroll';
import LandingHeader from '../components/layout/LandingHeader';
import { LandingBackground } from '../components/landing';
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
} from '../components/landing';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  useSmoothScroll();

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
            <span className={styles.logo}>◇ Card Genius AI</span>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Card Genius AI. Карточки товаров для маркетплейсов.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
