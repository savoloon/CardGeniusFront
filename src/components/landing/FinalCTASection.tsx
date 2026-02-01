import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './FinalCTASection.module.css';

const GUARANTEES = [
  { icon: '🛡️', text: 'Без риска' },
  { icon: '🔒', text: 'Данные в безопасности' },
  { icon: '↩️', text: 'Отмена в любой момент' },
];

export default function FinalCTASection() {
  const [email, setEmail] = useState('');
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section className={styles.section} ref={ref}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <h2 className={styles.title}>
          Попробуйте Card Genius AI прямо сейчас
        </h2>
        <p className={styles.subtitle}>
          Первые 24 генерации - бесплатно. Никакой привязки карты.
        </p>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <Link to="/register">
            <Button type="button" variant="primary" className={styles.cta}>
              Создать карточку бесплатно
            </Button>
          </Link>
        </form>

        <div className={styles.guarantees}>
          {GUARANTEES.map((g, i) => (
            <span key={i} className={styles.guarantee}>
              <span className={styles.gIcon}>{g.icon}</span>
              {g.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
