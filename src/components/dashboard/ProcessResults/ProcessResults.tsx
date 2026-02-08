import styles from './ProcessResults.module.css';

interface ProcessResultsProps {
  images: string[];
  onDownload?: (url: string, index: number) => void;
}

export default function ProcessResults({ images, onDownload }: ProcessResultsProps) {
  if (images.length === 0) return null;

  const handleDownload = (url: string, index: number) => {
    if (onDownload) {
      onDownload(url, index);
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `result-${index + 1}.png`;
      a.click();
    }
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Результат</h3>
      <div className={styles.grid}>
        {images.map((url, i) => (
          <div key={i} className={styles.item}>
            <img src={url} alt={`Результат ${i + 1}`} className={styles.img} />
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={() => handleDownload(url, i)}
            >
              Скачать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
