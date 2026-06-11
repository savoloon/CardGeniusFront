import { memo } from 'react';
import type { ProcessMode } from '../../../services/api';
import { Input } from '../../ui';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ProcessOptions.module.css';

interface ProcessOptionsProps {
  mode: ProcessMode;
  variants: number;
  prompt: string;
  productName: string;
  productDescription: string;
  onVariantsChange: (n: number) => void;
  onPromptChange: (s: string) => void;
  onProductNameChange: (s: string) => void;
  onProductDescriptionChange: (s: string) => void;
  /** Show product fields when infographic or card texts generation is enabled */
  showProductFields?: boolean;
  /** Show batch size controls for card text generation */
  showTextBatchOptions?: boolean;
  batchSizeTitle?: number;
  batchSizeDescription?: number;
  onBatchSizeTitleChange?: (n: number) => void;
  onBatchSizeDescriptionChange?: (n: number) => void;
  disabled?: boolean;
  /** Hide the built-in section heading when wrapped in an accordion */
  hideSectionTitle?: boolean;
  className?: string;
  /** Tighter spacing and side-by-side fields for dashboard layout */
  compact?: boolean;
}

const VARIANT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function ProcessOptionsInner({
  mode,
  variants,
  prompt,
  productName,
  productDescription,
  onVariantsChange,
  onPromptChange,
  onProductNameChange,
  onProductDescriptionChange,
  showProductFields = false,
  showTextBatchOptions = false,
  batchSizeTitle = 1,
  batchSizeDescription = 1,
  onBatchSizeTitleChange,
  onBatchSizeDescriptionChange,
  disabled,
  hideSectionTitle,
  className,
  compact,
}: ProcessOptionsProps) {
  const { t } = useLanguage();

  const needsVariants =
    mode === 'generate_background' ||
    mode === 'generate_exposure' ||
    mode === 'generate_exposition_by_request' ||
    mode === 'generate_infographic';
  const needsPrompt = mode === 'generate_exposition_by_request' || mode === 'generate_infographic';
  const needsProductFields = showProductFields || mode === 'generate_infographic';

  const hasAnyOptions =
    needsVariants || needsPrompt || needsProductFields || showTextBatchOptions;

  return (
    <div className={[styles.wrapper, compact && styles.wrapperCompact, className].filter(Boolean).join(' ')}>
      {!hideSectionTitle && (
        <h3 className={styles.sectionTitle}>{t('dashboard.stepParams')}</h3>
      )}
      {!hasAnyOptions && (
        <p className={styles.noParams}>{t('dashboard.noParamsForMode')}</p>
      )}
      {hasAnyOptions && (
        <div className={styles.fields}>
          {/* Поле промпта: для «Экспозиция по промпту» и опционально для инфографики */}
          {needsPrompt && (
            <div className={`${styles.fieldBlock} ${mode === 'generate_exposition_by_request' ? styles.promptRequired : ''}`}>
              <label className={styles.label} htmlFor="process-prompt">
                {t('dashboard.promptLabel')}
              </label>
              <textarea
                id="process-prompt"
                className={styles.textarea}
                placeholder={t('dashboard.promptPlaceholder')}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={disabled}
                rows={2}
                aria-required={mode === 'generate_exposition_by_request'}
              />
              <p className={styles.hint}>{t('dashboard.promptHint')}</p>
            </div>
          )}
          {/* Варианты (количество) */}
          {needsVariants && (
            <div className={styles.field}>
              <label className={styles.label}>{t('dashboard.variantsLabel')}</label>
              <div className={styles.variants} role="group" aria-label={t('dashboard.variantsLabel')}>
                {VARIANT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.variantBtn} ${variants === n ? styles.active : ''}`}
                    onClick={() => !disabled && onVariantsChange(n)}
                    disabled={disabled}
                    aria-pressed={variants === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          {needsProductFields && (
            <div className={styles.productFieldsRow}>
              <div className={styles.fieldBlock}>
                <Input
                  label={t('dashboard.productNameLabel')}
                  placeholder={t('dashboard.productNamePlaceholder')}
                  value={productName}
                  onChange={(e) => onProductNameChange(e.target.value)}
                  disabled={disabled}
                  className={styles.nameField}
                />
              </div>
              <div className={styles.fieldBlock}>
                <label className={styles.label} htmlFor="process-product-desc">
                  {t('dashboard.productDescriptionLabel')}
                </label>
                <textarea
                  id="process-product-desc"
                  className={styles.textarea}
                  placeholder={t('dashboard.productDescriptionPlaceholder')}
                  value={productDescription}
                  onChange={(e) => onProductDescriptionChange(e.target.value)}
                  disabled={disabled}
                  rows={2}
                />
              </div>
            </div>
          )}
          {showTextBatchOptions && onBatchSizeTitleChange && onBatchSizeDescriptionChange && (
            <div className={styles.batchRow}>
              <label className={styles.batchLabel}>
                <span>{t('dashboard.batchSizeTitleLabel')}</span>
                <select
                  value={batchSizeTitle}
                  onChange={(e) => onBatchSizeTitleChange(Number(e.target.value))}
                  disabled={disabled}
                  className={styles.batchSelect}
                >
                  {VARIANT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.batchLabel}>
                <span>{t('dashboard.batchSizeDescriptionLabel')}</span>
                <select
                  value={batchSizeDescription}
                  onChange={(e) => onBatchSizeDescriptionChange(Number(e.target.value))}
                  disabled={disabled}
                  className={styles.batchSelect}
                >
                  {VARIANT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ProcessOptionsInner);
