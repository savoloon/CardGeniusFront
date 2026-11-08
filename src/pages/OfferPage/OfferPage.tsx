import LegalDocument from '../../components/legal/LegalDocument';
import { offerEn, offerRu } from '../../content/legal/offer';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OfferPage() {
  const { locale, t } = useLanguage();
  const doc = locale === 'en' ? offerEn : offerRu;

  return <LegalDocument doc={doc} siblingTo="/privacy" siblingLabel={t('legal.toPrivacy')} />;
}
