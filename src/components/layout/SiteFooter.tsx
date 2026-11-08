import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { COMPANY } from '../../constants/company';
import BrandLogo from '../brand/BrandLogo';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logoLink} aria-label="Card Genius AI">
            <BrandLogo variant="footer" />
          </Link>
          <p className={styles.copy}>{t('landing.footerCopy', { year })}</p>
        </div>

        <nav className={styles.col} aria-label={t('footer.documents')}>
          <p className={styles.colTitle}>{t('footer.documents')}</p>
          <div className={styles.links}>
            <Link to="/offer">{t('footer.offer')}</Link>
            <Link to="/privacy">{t('footer.privacy')}</Link>
            <a href="/licenses/OFL.txt" target="_blank" rel="noreferrer">
              {t('common.fontLicenses')}
            </a>
          </div>
        </nav>

        <div className={styles.col}>
          <p className={styles.colTitle}>{t('footer.company')}</p>
          <p className={styles.legalName}>{COMPANY.name}</p>
          <p className={styles.meta}>
            <span>{t('footer.inn')}</span> {COMPANY.inn}
          </p>
          <p className={styles.meta}>
            <span>{t('footer.ogrn')}</span> {COMPANY.ogrn}
          </p>
          <Link className={styles.more} to="/about">
            {t('footer.about')}
          </Link>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>{t('footer.contacts')}</p>
          <address className={styles.address}>
            <a href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phoneDisplay}</a>
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            <span>{COMPANY.address}</span>
          </address>
          <Link className={styles.more} to="/contacts">
            {t('footer.contactsPage')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
