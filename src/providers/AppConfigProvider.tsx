import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { Linking } from 'react-native';

import {
  useGetAppConfigQuery,
  type AppConfigData,
} from '../store/api/new/appConfigApi';

export type AppConfigView = AppConfigData & {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** Opens tel: when supportPhone is non-null. */
  openSupportPhone: () => void;
  /** Opens wa.me when supportWhatsApp is non-null. */
  openSupportWhatsApp: () => void;
  /** Opens mailto: when supportEmail is non-null. */
  openSupportEmail: () => void;
  hasAnySupportContact: boolean;
};

const EMPTY: AppConfigData = {
  razorpayKeyId: null,
  siteUrl: null,
  supportPhone: null,
  supportWhatsApp: null,
  supportEmail: null,
};

const AppConfigContext = createContext<AppConfigView | null>(null);

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, refetch } = useGetAppConfigQuery();

  const value = useMemo<AppConfigView>(() => {
    const cfg = data ?? EMPTY;
    const phone = cfg.supportPhone?.trim() || null;
    const whatsapp = cfg.supportWhatsApp?.trim() || null;
    const email = cfg.supportEmail?.trim() || null;

    return {
      razorpayKeyId: cfg.razorpayKeyId?.trim() || null,
      siteUrl: cfg.siteUrl?.trim() || null,
      supportPhone: phone,
      supportWhatsApp: whatsapp,
      supportEmail: email,
      isLoading,
      isError,
      refetch: () => {
        void refetch();
      },
      openSupportPhone: () => {
        if (!phone) return;
        void Linking.openURL(`tel:${phone}`);
      },
      openSupportWhatsApp: () => {
        if (!whatsapp) return;
        const id = digitsOnly(whatsapp);
        if (!id) return;
        void Linking.openURL(`https://wa.me/${id}`);
      },
      openSupportEmail: () => {
        if (!email) return;
        void Linking.openURL(`mailto:${email}`);
      },
      hasAnySupportContact: Boolean(phone || whatsapp || email),
    };
  }, [data, isError, isLoading, refetch]);

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig(): AppConfigView {
  const ctx = useContext(AppConfigContext);
  if (!ctx) {
    // Safe fallback when used outside provider (e.g. tests).
    return {
      ...EMPTY,
      isLoading: false,
      isError: false,
      refetch: () => undefined,
      openSupportPhone: () => undefined,
      openSupportWhatsApp: () => undefined,
      openSupportEmail: () => undefined,
      hasAnySupportContact: false,
    };
  }
  return ctx;
}
