import { useState, useMemo } from 'react';

/**
 * useTableSort — generic hook for client-side table sorting.
 *
 * @param {Array} data      — array of row objects
 * @param {string} [defaultKey]  — initial sort column key
 * @param {string} [defaultDir='asc'] — 'asc' | 'desc'
 * @returns {{ sorted, sortKey, sortDir, requestSort, getSortIcon }}
 *
 * Usage:
 *   const { sorted, sortKey, sortDir, requestSort } = useTableSort(rows, 'name');
 *   <th onClick={() => requestSort('name')}>Name {getSortIcon('name')}</th>
 */
export function useTableSort(data, defaultKey = null, defaultDir = 'asc') {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const requestSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !data) return data || [];
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle nulls
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Detect type and compare
      // Numbers (including strings that look like numbers, percentages, currencies)
      const aNum = typeof aVal === 'number' ? aVal : parseFloat(String(aVal).replace(/[^0-9.\-]/g, ''));
      const bNum = typeof bVal === 'number' ? bVal : parseFloat(String(bVal).replace(/[^0-9.\-]/g, ''));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Booleans
      if (typeof aVal === 'boolean') {
        return sortDir === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
      }

      // Strings (case-insensitive)
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      const cmp = aStr.localeCompare(bStr);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, requestSort };
}
