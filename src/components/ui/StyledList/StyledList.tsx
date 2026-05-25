import { memo, type ReactNode } from 'react';
import styles from './StyledList.module.css';

interface StyledListProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

function StyledList<T>({
  items,
  keyExtractor,
  renderItem,
  className = '',
}: StyledListProps<T>) {
  return (
    <ul className={`${styles.list} ${className}`}>
      {items.map((item, idx) => (
        <li key={keyExtractor(item, idx)} className={styles.item}>
          {renderItem(item, idx)}
        </li>
      ))}
    </ul>
  );
}

export default memo(StyledList) as typeof StyledList;
