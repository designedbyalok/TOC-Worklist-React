import { Icon } from '../Icon/Icon';
import styles from './Pagination.module.css';

export function Pagination() {
  return (
    <div className={styles.pagination}>
      <button className={styles.btn}><Icon name="solar:alt-arrow-left-linear" size={18} /></button>
      <button className={`${styles.btn} ${styles.active}`}>1</button>
      <button className={styles.btn}>2</button>
      <button className={styles.btn}>3</button>
      <span className={styles.ellipsis}>…</span>
      <button className={styles.btn}>10</button>
      <button className={styles.btn}><Icon name="solar:alt-arrow-right-linear" size={18} /></button>
      <select className={styles.perPage}>
        <option>10 / Page</option>
        <option>25 / Page</option>
        <option>50 / Page</option>
      </select>
      <button className={styles.goBtn}>Go to Page</button>
    </div>
  );
}
