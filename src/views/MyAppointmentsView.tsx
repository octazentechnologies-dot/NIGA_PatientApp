import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

export type MyAppointmentsViewProps = {
  appointments: BookedAppointment[];
  onBack: () => void;
  onOpenAppointment: (id: string) => void;
  onBookNew: () => void;
};

export function MyAppointmentsView({
  appointments,
  onBack,
  onOpenAppointment,
  onBookNew,
}: MyAppointmentsViewProps) {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={22} color="#1F1F1F" />
          </Pressable>
          <AppText variant="headlineMd" color="#1F1F1F" style={styles.flex}>
            {t('accountAppointments')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 32 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        {appointments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color="#DDDFE2" />
            <AppText variant="titleMd" color="#1F1F1F" style={styles.center}>
              {t('doctorsNoBookings')}
            </AppText>
            <AppButton label={t('payHistBookConsultation')} onPress={onBookNew} />
          </View>
        ) : (
          appointments.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => onOpenAppointment(item.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardHead}>
                <View style={styles.avatar}>
                  <AppText variant="titleMd" color={colors.primary} languageOverride="en">
                    {item.doctorInitials}
                  </AppText>
                </View>
                <View style={styles.flex}>
                  <AppText variant="titleMd" color="#1F1F1F">
                    {t(item.doctorNameKey)}
                  </AppText>
                  <AppText variant="bodyMd" color="#595959">
                    {`${t('payStatusHomeopath')} · ${t(item.experienceKey)}`}
                  </AppText>
                  <View
                    style={[
                      styles.badge,
                      item.status === 'confirmed'
                        ? styles.badgeOk
                        : styles.badgeWait,
                    ]}
                  >
                    <AppText
                      variant="labelSm"
                      color={item.status === 'confirmed' ? '#0F7A4E' : '#8A5109'}
                      weightOverride="600"
                    >
                      {t(
                        item.status === 'confirmed'
                          ? 'doctorsConfirmed'
                          : 'doctorsWaitingAcceptance',
                      )}
                    </AppText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#595959" />
              </View>
              <MetaRow icon="calendar-outline" text={item.whenLabel} />
              <MetaRow
                icon={
                  item.mode === 'audio'
                    ? 'call-outline'
                    : item.mode === 'clinic'
                      ? 'business-outline'
                      : item.mode === 'chat'
                        ? 'chatbubble-outline'
                        : 'videocam-outline'
                }
                text={item.modeConsultLabel}
              />
              <MetaRow icon="person-outline" text={item.patientLabel} />
              <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                {t('myAptTapToManage')}
              </AppText>
            </Pressable>
          ))
        )}

        {appointments.length > 0 ? (
          <AppButton
            variant="secondary"
            label={t('payHistBookConsultation')}
            onPress={onBookNew}
            icon={<Ionicons name="add" size={18} color={colors.button} />}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function MetaRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <AppText variant="bodyMd" color="#1F1F1F" style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDFE2',
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
    textAlign: 'left',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  empty: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: '#DDDFE2',
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: '#E6F5FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeOk: {
    backgroundColor: '#E9F5EF',
  },
  badgeWait: {
    backgroundColor: '#FCF3E4',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.buttonHeight / 2,
  },
});
