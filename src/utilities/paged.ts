/**
 * Normalize list vs paged envelope shapes from the Gap Reply.
 * Flat: `{ success, data: T[] }`
 * Paged: `{ success, data: { totalRecords, pageNumber, pageSize, data: T[] } }`
 */
export type PagedEnvelope<T> = {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  data: T[];
};

const EMPTY_ITEMS: never[] = [];

export function unwrapListOrPage<T>(
  response: unknown,
): { items: T[]; page: PagedEnvelope<T> | null } {
  if (!response || typeof response !== 'object') {
    return { items: EMPTY_ITEMS as T[], page: null };
  }
  const root = response as { data?: unknown };
  const data = root.data;
  if (Array.isArray(data)) {
    return { items: data as T[], page: null };
  }
  if (data && typeof data === 'object' && Array.isArray((data as PagedEnvelope<T>).data)) {
    const page = data as PagedEnvelope<T>;
    return {
      items: page.data,
      page: {
        totalRecords: Number(page.totalRecords) || page.data.length,
        pageNumber: Number(page.pageNumber) || 1,
        pageSize: Number(page.pageSize) || page.data.length,
        data: page.data,
      },
    };
  }
  return { items: EMPTY_ITEMS as T[], page: null };
}
