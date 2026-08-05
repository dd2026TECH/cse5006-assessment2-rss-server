import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export type Crumb = {
  label: string;
  href?: string; // the current page (last crumb) has no href
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className={styles.current}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className={styles.separator}>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
