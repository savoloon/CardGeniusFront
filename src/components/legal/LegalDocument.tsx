import { useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import { COMPANY } from '../../constants/company';
import type { LegalDoc } from '../../content/legal/types';
import styles from './LegalDocument.module.css';

interface LegalDocumentProps {
  doc: LegalDoc;
  siblingTo: string;
  siblingLabel: string;
}

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = new RegExp(LINK_RE);
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const label = match[1];
    const href = match[2];
    if (href.startsWith('/')) {
      nodes.push(
        <Link key={`${match.index}-${href}`} to={href}>
          {label}
        </Link>
      );
    } else {
      nodes.push(
        <a key={`${match.index}-${href}`} href={href}>
          {label}
        </a>
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

export default function LegalDocument({ doc, siblingTo, siblingLabel }: LegalDocumentProps) {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== 'default';

  useEffect(() => {
    window.scrollTo(0, 0);
    const previous = document.title;
    document.title = `${doc.title} — Card Genius AI`;
    return () => {
      document.title = previous;
    };
  }, [doc.title]);

  const goBack = () => {
    if (canGoBack) navigate(-1);
    else navigate('/');
  };

  const backLabel = canGoBack ? t('legal.back') : t('legal.home');

  return (
    <article className={styles.page}>
      <div className={styles.toolbar}>
        <Button type="button" variant="outline" className={styles.backBtn} onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Button>
      </div>

      <header className={styles.header}>
        <p className={styles.edition}>{doc.edition}</p>
        <h1 className={styles.title}>{doc.title}</h1>
        <p className={styles.lead}>{doc.lead}</p>
        {locale === 'en' ? <p className={styles.notice}>{t('legal.bindingNote')}</p> : null}
      </header>

      <nav className={styles.toc} aria-label={t('legal.contents')}>
        <p className={styles.tocTitle}>{t('legal.contents')}</p>
        <ol>
          {doc.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      {doc.sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`} className={styles.sectionTitle}>
            {section.title}
          </h2>
          {section.blocks.map((block, index) => {
            if (block.type === 'list') {
              return (
                <ul key={index} className={styles.list}>
                  {(block.items ?? []).map((item) => (
                    <li key={item}>
                      <RichText text={item} />
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'note') {
              return (
                <p key={index} className={styles.note}>
                  <RichText text={block.text ?? ''} />
                </p>
              );
            }
            return (
              <p key={index}>
                <RichText text={block.text ?? ''} />
              </p>
            );
          })}
        </section>
      ))}

      <section className={styles.requisites} aria-labelledby="legal-requisites-title">
        <h2 id="legal-requisites-title" className={styles.sectionTitle}>
          {t('legal.requisitesTitle')}
        </h2>
        <dl className={styles.facts}>
          <div>
            <dt>{t('legal.companyName')}</dt>
            <dd>{COMPANY.name}</dd>
          </div>
          <div>
            <dt>{t('legal.inn')}</dt>
            <dd>{COMPANY.inn}</dd>
          </div>
          <div>
            <dt>{t('legal.ogrn')}</dt>
            <dd>{COMPANY.ogrn}</dd>
          </div>
          <div>
            <dt>{t('legal.address')}</dt>
            <dd>{COMPANY.address}</dd>
          </div>
          <div>
            <dt>{t('legal.phone')}</dt>
            <dd>
              <a href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phoneDisplay}</a>
            </dd>
          </div>
          <div>
            <dt>{t('legal.email')}</dt>
            <dd>
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </dd>
          </div>
        </dl>
      </section>

      <div className={styles.actions}>
        <Button type="button" variant="outline" className={styles.backBtn} onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Button>
        <Link className={styles.actionLink} to={siblingTo}>
          {siblingLabel}
        </Link>
        <Link className={styles.actionLink} to="/contacts">
          {t('legal.contactsLink')}
        </Link>
      </div>
    </article>
  );
}
