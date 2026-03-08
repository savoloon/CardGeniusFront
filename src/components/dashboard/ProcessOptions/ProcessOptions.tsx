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
  disabled?: boolean;
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
  disabled,
}: ProcessOptionsProps) {
  const { t } = useLanguage();

  const needsVariants =
    mode === 'generate_background' ||
    mode === 'generate_exposure' ||
    mode === 'generate_exposition_by_request' ||
    mode === 'generate_infographic';
  const needsPrompt = mode === 'generate_exposition_by_request' || mode === 'generate_infographic';
  const needsInfographicFields = mode === 'generate_infographic';

  const hasAnyOptions = needsVariants || needsPrompt || needsInfographicFields;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>{t('dashboard.stepParams')}</h3>
      {!hasAnyOptions && (
        <p className={styles.noParams}>{t('dashboard.noParamsForMode')}</p>
      )}
      {hasAnyOptions && (
        <div className={styles.fields}>
          {/* Поле промпта: для «Экспозиция по промпту» и опционально для инфографики */}
          {needsPrompt && (
            <div className={`${styles.fieldBlock} ${mode === 'generate_exposition_by_request' ? styles.promptRequired : ''}`}>
              <Input
                label={t('dashboard.promptLabel')}
                placeholder={t('dashboard.promptPlaceholder')}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={disabled}
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
          {/* Инфографика: название и описание товара */}
          {needsInfographicFields && (
            <>
              <div className={styles.fieldBlock}>
                <Input
                  label={t('dashboard.productNameLabel')}
                  placeholder={t('dashboard.productNamePlaceholder')}
                  value={productName}
                  onChange={(e) => onProductNameChange(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className={styles.fieldBlock}>
                <Input
                  label={t('dashboard.productDescriptionLabel')}
                  placeholder={t('dashboard.productDescriptionPlaceholder')}
                  value={productDescription}
                  onChange={(e) => onProductDescriptionChange(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ProcessOptionsInner);
