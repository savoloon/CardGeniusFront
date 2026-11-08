import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import LandingHeader from '../../components/layout/LandingHeader';
import SiteFooter from '../../components/layout/SiteFooter';
import { LandingBackground } from '../../components/landing';
import {
  HeroSection,
  StatsSection,
  PainsSection,
  SolutionSection,
  CasesSection,
  ToolsSection,
  TrustSection,
  PricingSection,
  AccessRoadmapSection,
  FinalCTASection,
  GrantorsSection,
} from '../../components/landing';
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
        <PainsSection />
        <SolutionSection />
        <CasesSection />
        <ToolsSection />
        <TrustSection />
        <PricingSection />
        <AccessRoadmapSection />
        <FinalCTASection />
        <GrantorsSection />
      </main>
      <SiteFooter />
    </>
  );
}
