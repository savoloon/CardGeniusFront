import { Link } from 'react-router-dom';
import StaticPage from '../../components/layout/StaticPage';
import styles from '../../components/layout/StaticPage.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { COMPANY } from '../../constants/company';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <StaticPage title={t('legal.aboutTitle')} lead={t('legal.aboutLead')}>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>{t('legal.companyName')}</dt>
          <dd>{COMPANY.name}</dd>
        </div>
        <div className={styles.fact}>
          <dt>{t('legal.inn')}</dt>
          <dd>{COMPANY.inn}</dd>
        </div>
        <div className={styles.fact}>
          <dt>{t('legal.ogrn')}</dt>
          <dd>{COMPANY.ogrn}</dd>
        </div>
      </dl>
      <p className={styles.cross}>
        <Link to="/contacts">{t('legal.contactsLink')}</Link>
      </p>
    </StaticPage>
  );
}
