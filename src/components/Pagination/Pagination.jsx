import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../Icon/Icon';
import styles from './Pagination.module.css';

export function Pagination({ totalItems: totalItemsProp }) {
  const currentPage = useAppStore(s => s.currentPage);
  const perPage = useAppStore(s => s.perPage);
  const patients = useAppStore(s => s.patients);
  const searchQuery = useAppStore(s => s.searchQuery);
  const setCurrentPage = useAppStore(s => s.setCurrentPage);
  const setPerPage = useAppStore(s => s.setPerPage);

  const derivedTotal = useMemo(() => {
    if (!searchQuery.trim()) return patients.length;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.memberId?.toLowerCase().includes(q) ||
      p.initials?.toLowerCase().includes(q)
    ).length;
  }, [patients, searchQuery]);

  const totalItems = totalItemsProp ?? derivedTotal;

  const [goToInput, setGoToInput] = useState('');

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const goTo = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
  };

  const handleGoToPage = () => {
    const page = parseInt(goToInput, 10);
    if (!isNaN(page)) {
      goTo(page);
      setGoToInput('');
    }
  };

  const handleGoToKeyDown = (e) => {
    if (e.key === 'Enter') handleGoToPage();
  };

  // Build page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.btn}
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Icon name="solar:alt-arrow-left-linear" size={18} />
      </button>

      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
        ) : (
          <button
            key={p}
            className={`${styles.btn} ${p === currentPage ? styles.active : ''}`}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className={styles.btn}
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Icon name="solar:alt-arrow-right-linear" size={18} />
      </button>

      <select
        className={styles.perPage}
        value={perPage}
        onChange={handlePerPageChange}
      >
        <option value={10}>10 / Page</option>
        <option value={25}>25 / Page</option>
        <option value={50}>50 / Page</option>
      </select>

      <div className={styles.goToWrapper}>
        <input
          className={styles.goToInput}
          type="number"
          min={1}
          max={totalPages}
          placeholder="#"
          value={goToInput}
          onChange={(e) => setGoToInput(e.target.value)}
          onKeyDown={handleGoToKeyDown}
        />
        <button className={styles.goBtn} onClick={handleGoToPage}>
          Go to Page
        </button>
      </div>
    </div>
  );
}
