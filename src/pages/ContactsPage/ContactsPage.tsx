import { Link } from 'react-router-dom';
import StaticPage from '../../components/layout/StaticPage';
import styles from '../../components/layout/StaticPage.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { COMPANY } from '../../constants/company';

export default function ContactsPage() {
  const { t } = useLanguage();

  return (
    <StaticPage title={t('legal.contactsTitle')} lead={t('legal.contactsLead')}>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>{t('legal.phone')}</dt>
          <dd>
            <a href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phoneDisplay}</a>
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>{t('legal.email')}</dt>
          <dd>
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>{t('legal.address')}</dt>
          <dd>{COMPANY.address}</dd>
        </div>
      </dl>
      <p className={styles.cross}>
        <Link to="/about">{t('legal.aboutLink')}</Link>
      </p>
    </StaticPage>
  );
}
