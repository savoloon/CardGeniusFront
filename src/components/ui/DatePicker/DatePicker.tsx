import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function toDateParts(value: string): { y: number; m: number; d: number } | null {
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return { y: parts[0], m: parts[1], d: parts[2] };
}

function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePicker({ label, value, onChange }: DatePickerProps) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => {
    const parsed = toDateParts(value);
    return parsed ? new Date(parsed.y, parsed.m - 1, parsed.d) : null;
  }, [value]);
  const today = useMemo(() => new Date(), []);
  const initialView = selectedDate ?? today;
  const [viewDate, setViewDate] = useState(
    new Date(initialView.getFullYear(), initialView.getMonth(), 1)
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const localeCode = locale === 'en' ? 'en-US' : 'ru-RU';
  const todayLabel = locale === 'en' ? 'Today' : 'Сегодня';
  const clearLabel = locale === 'en' ? 'Clear' : 'Очистить';
  const prevMonthAria = locale === 'en' ? 'Previous month' : 'Предыдущий месяц';
  const nextMonthAria = locale === 'en' ? 'Next month' : 'Следующий месяц';
  const monthLabel = new Intl.DateTimeFormat(localeCode, {
    month: 'long',
    year: 'numeric',
  }).format(viewDate);
  const weekdayFmt = new Intl.DateTimeFormat(localeCode, { weekday: 'short' });
  const weekdays = Array.from({ length: 7 }).map((_, i) =>
    weekdayFmt.format(new Date(2024, 0, i + 1))
  );

  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startWeekday);
  const days = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const formattedValue = selectedDate
    ? new Intl.DateTimeFormat(localeCode, { dateStyle: 'medium' }).format(selectedDate)
    : '—';

  return (
    <div className={styles.root} ref={rootRef}>
      <span className={styles.label}>{label}</span>
      <button type="button" className={styles.fieldBtn} onClick={() => setOpen((v) => !v)}>
        {formattedValue}
      </button>
      {open && (
        <div className={styles.popover} role="dialog" aria-label={label}>
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              aria-label={prevMonthAria}
            >
              ‹
            </button>
            <span className={styles.month}>{monthLabel}</span>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              aria-label={nextMonthAria}
            >
              ›
            </button>
          </div>
          <div className={styles.weekdays}>
            {weekdays.map((w, i) => (
              <span key={`${w}-${i}`}>{w}</span>
            ))}
          </div>
          <div className={styles.grid}>
            {days.map((d) => {
              const sameMonth = d.getMonth() === viewDate.getMonth();
              const iso = toIsoLocal(d);
              const isSelected = value === iso;
              const isToday = toIsoLocal(today) === iso;
              return (
                <button
                  type="button"
                  key={iso}
                  className={`${styles.day} ${sameMonth ? '' : styles.outside} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.footerBtn}
              onClick={() => {
                onChange(toIsoLocal(today));
                setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                setOpen(false);
              }}
            >
              {todayLabel}
            </button>
            <button
              type="button"
              className={styles.footerBtn}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              {clearLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
