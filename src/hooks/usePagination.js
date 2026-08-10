import { useState, useMemo, useEffect } from "react";

export function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // If filtering/searching makes the current page invalid,
  // automatically move back to the last available page.
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  function goToPage(p) {
    const nextPage = Math.min(
      Math.max(1, Number(p)),
      totalPages
    );

    setPage(nextPage);
  }

  return {
    pageItems,
    page: safePage,
    totalPages,
    totalItems: items.length,
    goToPage,

    rangeStart:
      items.length === 0
        ? 0
        : (safePage - 1) * pageSize + 1,

    rangeEnd: Math.min(
      safePage * pageSize,
      items.length
    ),
  };
}