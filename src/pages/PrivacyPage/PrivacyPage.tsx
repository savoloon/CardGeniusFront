import LegalDocument from '../../components/legal/LegalDocument';
import { privacyEn, privacyRu } from '../../content/legal/privacy';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PrivacyPage() {
  const { locale, t } = useLanguage();
  const doc = locale === 'en' ? privacyEn : privacyRu;

  return <LegalDocument doc={doc} siblingTo="/offer" siblingLabel={t('legal.toOffer')} />;
}