import { useTheme } from '../../contexts/ThemeContext';
import styles from './BrandLogo.module.css';

interface BrandLogoProps {
  variant?: 'header' | 'footer';
  alt?: string;
  className?: string;
}

export default function BrandLogo({
  variant = 'header',
  alt = 'Card Genius AI',
  className,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === 'light' ? '/logo-lockup-light.png' : '/logo-lockup-dark.png';
  const classNames = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      <img src={src} alt={alt} width={800} height={163} draggable={false} />
    </span>
  );
}
