import { useMemo } from 'react';

import { useLocalization } from '../localization/i18n';
import { useGetPatientDashboardQuery } from '../store/api/new/patientDashboardApi';
import { useAppSelector } from '../store/hooks';
import { buildPatientDashboard } from '../utilities/patientDashboard';

/** Home-tab cards and charts from the same APIs as the web patient dashboard. */
export function usePatientDashboard() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { language } = useLocalization();
  const query = useGetPatientDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });

  const model = useMemo(
    () => (query.data ? buildPatientDashboard(query.data, language) : null),
    [query.data, language],
  );

  return {
    active: isAuthenticated,
    model,
    isLoading: isAuthenticated && query.isLoading,
    refresh: () => query.refetch(),
  };
}
