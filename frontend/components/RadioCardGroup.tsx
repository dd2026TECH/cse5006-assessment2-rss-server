"use client";

import styles from "./RadioCardGroup.module.css";

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

// Generic card-style radio group used by the theme and feed-layout settings.
export default function RadioCardGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  note,
}: {
  legend: string;
  name: string;
  options: ReadonlyArray<RadioOption<T>>;
  value: T;
  onChange: (value: T) => void;
  note?: React.ReactNode;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map(({ value: optionValue, label, description }) => (
          <label
            key={optionValue}
            className={`${styles.option} ${
              value === optionValue ? styles.selected : ""
            }`}
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className={styles.radio}
            />
            <span className={styles.optionLabel}>{label}</span>
            <span className={styles.optionDescription}>{description}</span>
          </label>
        ))}
      </div>
      {note ? <p className={styles.note}>{note}</p> : null}
    </fieldset>
  );
}
