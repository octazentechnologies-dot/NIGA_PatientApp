import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountView } from './AccountView';
import { HealthRecordsView } from './HealthRecordsView';
import { MedicinesView } from './MedicinesView';
import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { DoctorFiltersSheet } from '../components/DoctorFiltersSheet';
import { EmptyDoctorsIllustration } from '../components/EmptyDoctorsIllustration';
import { NotificationBell } from '../components/NotificationBell';
import { PatientTabBar, usePatientTabScrollInset } from '../components/PatientTabBar';
import { Screen } from '../components/Screen';
import { StatusBarBleed } from '../components/StatusBarBleed';
import { WhoForMemberSheet } from '../components/WhoForMemberSheet';
import { DEFAULT_DOCTOR_FILTERS } from '../models/search';
import { useAndroidStatusBarBackground } from '../utilities/useAndroidPageStatusBar';
import {
  CONSULT_NOW_AVAILABLE_DOCTORS,
  CONSULT_NOW_WAIT_MAX,
  CONSULT_NOW_WAIT_MIN,
} from '../config/consultNow';
import { images } from '../config/images';
import type { HomeViewModel } from '../controllers/useHomeController';
import type { TranslationKey } from '../localization/types';
import type { PublicDoctor } from '../store/api/new/doctorsApi';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { formatWeekday, resolveApiUrl } from '../utilities/formatters';
import { scaleFont } from '../utilities/scale';

function getDoctorPhotoUrl(photoPath: string | null | undefined): string | null {
  return resolveApiUrl(photoPath ?? null);
}

function getDoctorInitials(name: string): string {
  if (!name) return 'DR';
  const clean = name.replace(/^dr\.?\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (clean.slice(0, 2) || 'DR').toUpperCase();
}

function formatDoctorDisplayName(name: string): string {
  if (!name) return 'Doctor';
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith('dr.') || trimmed.toLowerCase().startsWith('dr ')) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
}

function DoctorCard({
  doctor,
  t,
  onBook,
  onInstantConsult,
}: {
  doctor: PublicDoctor;
  t: (key: TranslationKey) => string;
  onBook: () => void;
  onInstantConsult: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getDoctorPhotoUrl(doctor.photoUrl ?? doctor.photoPath);
  const initials = getDoctorInitials(doctor.displayName);
  const formattedName = formatDoctorDisplayName(doctor.displayName);
  const isOnline = doctor.isOnline;
  const isVerified = doctor.isVerified || doctor.verified;

  return (
    <View style={styles.docCard}>
      <View style={styles.docCardTop}>
        <View style={styles.docAvatarWrap}>
          {photoUrl && !imgError ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.docAvatarImg}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.docAvatarInitials}>
              <AppText
                variant="titleMd"
                color={colors.primary}
                languageOverride="en"
                weightOverride="600"
              >
                {initials}
              </AppText>
            </View>
          )}
          {isOnline ? <View style={styles.docAvatarOnlineBadge} /> : null}
        </View>

        <View style={styles.docInfoCol}>
          <View style={styles.docNameRow}>
            <AppText
              variant="titleMd"
              color={colors.ink}
              weightOverride="600"
              style={styles.docName}
              numberOfLines={2}
            >
              {formattedName}
            </AppText>
            {isVerified ? (
              <View style={styles.verifiedBadgeRow}>
                <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                <AppText variant="labelSm" color={colors.success} weightOverride="600">
                  {t('doctorsVerified')}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText
            variant="bodyMd"
            color={colors.muted}
            numberOfLines={2}
            style={styles.docSubtitle}
          >
            {[doctor.qualification, doctor.clinicName, doctor.city]
              .filter(Boolean)
              .join(' · ')}
          </AppText>

          {Boolean(doctor.rankingSummary) && (
            <View style={styles.rankingSummaryBadge}>
              <Ionicons name="shield-checkmark" size={13} color={colors.success} />
              <AppText
                variant="labelSm"
                color={colors.success}
                weightOverride="500"
                numberOfLines={1}
                style={styles.rankingSummaryText}
              >
                {doctor.rankingSummary}
              </AppText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.feesRow}>
        <View style={styles.feeCol}>
          <View style={styles.feeModeRow}>
            <Ionicons name="videocam-outline" size={14} color={colors.primary} />
            <AppText
              variant="labelSm"
              color={colors.muted}
              numberOfLines={1}
              style={styles.feeModeLabel}
            >
              {t('doctorsTeleFee')}
            </AppText>
          </View>
          <AppText
            variant="labelLg"
            color={colors.ink}
            weightOverride="600"
            style={styles.feePrice}
          >
            {doctor.consultFeeTele != null ? `₹${doctor.consultFeeTele}` : '—'}
          </AppText>
        </View>

        <View style={styles.feeDivider} />

        <View style={styles.feeCol}>
          <View style={styles.feeModeRow}>
            <Ionicons name="business-outline" size={14} color={colors.primary} />
            <AppText
              variant="labelSm"
              color={colors.muted}
              numberOfLines={1}
              style={styles.feeModeLabel}
            >
              {t('doctorsClinicFee')}
            </AppText>
          </View>
          <AppText
            variant="labelLg"
            color={colors.ink}
            weightOverride="600"
            style={styles.feePrice}
          >
            {doctor.consultFeeInClinic != null
              ? `₹${doctor.consultFeeInClinic}`
              : '—'}
          </AppText>
        </View>
      </View>

      {doctor.reviewCount > 0 && doctor.averageRating != null ? (
        <View style={styles.docNameRow}>
          <Ionicons name="star" size={14} color={colors.tertiaryContainer} />
          <AppText variant="labelSm" color={colors.ink} weightOverride="600">
            {doctor.averageRating.toFixed(1)}
          </AppText>
          <AppText variant="labelSm" color={colors.muted}>
            ({doctor.reviewCount})
          </AppText>
        </View>
      ) : null}

      <View style={styles.docActionsRow}>
        {isOnline ? (
          <Pressable
            accessibilityRole="button"
            onPress={onInstantConsult}
            style={({ pressed }) => [
              styles.instantConsultBtn,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="flash" size={14} color={colors.warning} />
            <AppText variant="labelMd" color={colors.warning} weightOverride="600">
              {t('homeInstantBadge')}
            </AppText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={onBook}
          style={({ pressed }) => [
            styles.bookDocBtn,
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="labelMd" color={colors.card} weightOverride="600">
            {t('doctorsBookAppointment')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const QUICK_ACTIONS: {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  labelKey: TranslationKey;
  badgeKey?: TranslationKey;
}[] = [
    { icon: 'stethoscope', labelKey: 'homeBookConsultation' },
    {
      icon: 'lightning-bolt',
      labelKey: 'homeInstantAdvice',
      badgeKey: 'homeInstantBadge',
    },
    { icon: 'file-document-outline', labelKey: 'homeMyPrescriptions' },
    { icon: 'bottle-tonic-plus-outline', labelKey: 'homeOrderMedicines' },
  ];

export function HomeView({
  language,
  t,
  greeting,
  selectedTab,
  selectedMemberLabel,
  memberPickerOpen,
  memberOptions,
  selectedMemberId,
  onSelectTab,
  onOpenSearch,
  onOpenMemberPicker,
  onCloseMemberPicker,
  onSelectMember,
  onAddMember,
  onSelectLanguage,
  onOpenNotifications,
  onJoinConsultation,
  onOpenConsultNow,
  onOpenHealthTip,
  onTrackOrder,
  appointments,
  completedMovedToastVisible,
  onDismissCompletedMovedToast,
  onOpenMyAppointmentsFromCompletedToast,
  onOpenAppointment,
  followUpPlanAvailable,
  onOpenFollowUpPlan,
  onOpenOrderMedicines,
  medicineOrderPlaced,
  onOpenOrderDetails,
  onOpenAccountRecords,
  publicDoctors = [],
  isDoctorsLoading = false,
  isDoctorsError = false,
  refetchDoctors,
  onOpenDoctorProfile,
  onOpenBooking,
  healthArticles = [],
  doctorsSearch = {},
  doctorsFilterCount = 0,
  onClearDoctorsSearch,
  onRemoveDoctorsCity,
  onRemoveDoctorsQuery,
  doctorsFiltersOpen = false,
  doctorsFilterDraft = DEFAULT_DOCTOR_FILTERS,
  doctorsFilterMatchingCount = 0,
  doctorsDatePickerOpen = false,
  doctorsFilterCustomDate = new Date(),
  doctorsCityOptions = [],
  doctorsQualificationOptions = [],
  onOpenDoctorsFilters,
  onCloseDoctorsFilters,
  onResetDoctorsFilterDraft,
  onClearDoctorsFilters,
  onApplyDoctorsFilters,
  onToggleDoctorsCareNeed,
  onToggleDoctorsMode,
  onToggleDoctorsAvailability,
  onChangeDoctorsFeeRange,
  onToggleDoctorsFilterLanguage,
  onToggleDoctorsGender,
  onToggleDoctorsRecognized,
  onToggleDoctorsFocusCert,
  onChangeDoctorsLocationQuery,
  onToggleDoctorsCity,
  onToggleDoctorsCurrentLocation,
  onOpenDoctorsDatePicker,
  onCloseDoctorsDatePicker,
  onSelectDoctorsCustomDate,
  onOpenBookWithHelp,
  account,
  notificationCount,
}: HomeViewModel & { notificationCount: number }) {
  const insets = useSafeAreaInsets();
  const tabScrollInset = usePatientTabScrollInset();
  const [doctorFilter, setDoctorFilter] = useState<'all' | 'online'>('all');

  const displayedDoctors =
    doctorFilter === 'online'
      ? publicDoctors.filter((doc) => doc.isOnline)
      : publicDoctors;

  const bookedAppointments = appointments.filter(
    (a) =>
      a.id !== 'seed-followup-chat' &&
      (a.status === 'confirmed' || a.status === 'waiting_acceptance'),
  );

  useAndroidStatusBarBackground(colors.card);

  return (
    <Screen edges={['left', 'right']} style={styles.root}>
      <StatusBarBleed color={colors.card} />
      {completedMovedToastVisible ? (
        <View
          style={[
            styles.completedMovedToast,
            { top: Math.max(insets.top, spacing.sm) + spacing.xs },
          ]}
          accessibilityLiveRegion="polite"
        >
          <AppText
            variant="bodyMd"
            color={colors.onPrimaryContainer}
            style={styles.completedMovedToastText}
          >
            {t('homeBookingMovedToAccount')}
          </AppText>
          <View style={styles.completedMovedToastActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onOpenMyAppointmentsFromCompletedToast}
              style={styles.completedMovedToastCta}
              hitSlop={8}
            >
              <AppText variant="labelSm" color={colors.primaryOutline}>
                {t('homeBookingMovedToAccountAction')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={onDismissCompletedMovedToast}
              hitSlop={12}
              style={styles.completedMovedToastDismiss}
            >
              <Ionicons name="close" size={18} color={colors.onPrimaryContainer} />
            </Pressable>
          </View>
        </View>
      ) : null}
      {selectedTab === 'home' ? (
        <View style={styles.homeTab}>
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(insets.top, spacing.sm) + spacing.sm },
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerCopy}>
                <AppText
                  variant="titleMd"
                  color={colors.ink}
                  style={styles.greeting}
                >
                  {greeting}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={onOpenMemberPicker}
                  style={styles.forWhomChip}
                >
                  <AppText variant="labelSm" color={colors.onSurface}>
                    {`${t('homeForPrefix')}: ${selectedMemberLabel}`}
                  </AppText>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={colors.onSurface}
                  />
                </Pressable>
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('languageLabel')}
                  onPress={() =>
                    onSelectLanguage(language === 'en' ? 'mr' : 'en')
                  }
                  style={styles.languageButton}
                >
                  <AppText
                    variant="labelMd"
                    color={colors.onSurface}
                    languageOverride={language === 'en' ? 'en' : 'mr'}
                  >
                    {language === 'en' ? 'EN' : 'मराठी'}
                  </AppText>
                </Pressable>
                <NotificationBell
                  count={notificationCount}
                  label={t('homeNotifications')}
                  onPress={onOpenNotifications}
                />
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('homeSearchPlaceholder')}
              onPress={onOpenSearch}
              style={styles.searchWrap}
            >
              <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
              <AppText
                variant="bodyMd"
                color={colors.onSurfaceVariant}
                style={styles.searchPlaceholder}
                numberOfLines={1}
              >
                {t('homeSearchPlaceholder')}
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            style={styles.homeBody}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: tabScrollInset }}
          >
            <View style={styles.body}>
              {bookedAppointments.length > 0 ? (
                <View style={styles.bookingsSection}>
                  <AppText variant="headlineMd" color={colors.ink}>
                    {t('homeMyBookings')}
                  </AppText>
                  {bookedAppointments.map((appointment) => {
                    const canJoin =
                      appointment.mode === 'video' ||
                      appointment.mode === 'audio';
                    const isClinic = appointment.mode === 'clinic';
                    const doctorName = appointment.doctorNameKey
                      ? t(appointment.doctorNameKey)
                      : t('homeDoctorName');
                    const locale = language === 'mr' ? 'mr-IN' : 'en-IN';
                    const weekday =
                      formatWeekday(appointment.startsAt, locale) ??
                      formatWeekday(appointment.dateLine, locale) ??
                      '';
                    const modeIcon =
                      appointment.mode === 'video'
                        ? 'videocam-outline'
                        : appointment.mode === 'audio'
                          ? 'call-outline'
                          : appointment.mode === 'chat'
                            ? 'chatbubble-outline'
                            : 'storefront-outline';
                    const modeSubtitle = isClinic
                      ? t('homeBookingClinicVisit')
                      : t('homeBookingOnlineConsult');
                    const modeShortLabel =
                      appointment.mode === 'audio'
                        ? t('bookAudio')
                        : appointment.mode === 'chat'
                          ? t('bookChat')
                          : appointment.mode === 'clinic'
                            ? t('bookClinic')
                            : t('bookVideo');
                    return (
                      <Pressable
                        key={appointment.id}
                        accessibilityRole="button"
                        accessibilityLabel={doctorName}
                        onPress={() => onOpenAppointment(appointment.id)}
                        style={styles.consultCard}
                      >
                        <View style={styles.doctorRow}>
                          <View style={styles.flex}>
                            <View style={styles.nameRow}>
                              <AppText
                                variant="titleMd"
                                color={colors.ink}
                                style={styles.doctorName}
                                numberOfLines={2}
                                raw
                              >
                                {doctorName}
                              </AppText>
                              <Ionicons
                                name="shield-checkmark"
                                size={16}
                                color={colors.primary}
                                accessibilityLabel={t('homeVerified')}
                              />
                            </View>
                            <AppText
                              variant="bodyMd"
                              color={colors.onSurfaceVariant}
                              numberOfLines={2}
                            >
                              {appointment.credentialsKey
                                ? t(appointment.credentialsKey)
                                : t('homeDoctorQualification')}
                            </AppText>
                            {appointment.patientLabel ? (
                              <AppText
                                variant="labelSm"
                                color={colors.onSurfaceVariant}
                                numberOfLines={1}
                                raw
                              >
                                {`${t('homeForPrefix')}: ${appointment.patientLabel}`}
                              </AppText>
                            ) : null}
                          </View>
                          <View style={styles.doctorInitials}>
                            <AppText
                              variant="titleMd"
                              color={colors.onPrimaryContainer}
                              weightOverride="600"
                              languageOverride="en"
                            >
                              {appointment.doctorInitials || 'DR'}
                            </AppText>
                          </View>
                        </View>

                        <View style={styles.bookingMetaRow}>
                          <View style={[styles.bookingMetaTile, styles.dateTile]}>
                            <View style={styles.metaIconBubble}>
                              <Ionicons
                                name="calendar-outline"
                                size={16}
                                color={colors.primary}
                              />
                            </View>
                            <View style={styles.bookingMetaCopy}>
                              <AppText
                                variant="labelSm"
                                color={colors.onSurfaceVariant}
                                numberOfLines={1}
                              >
                                {t('homeBookingAppointmentDate')}
                              </AppText>
                              <AppText
                                variant="bodyMd"
                                color={colors.ink}
                                weightOverride="600"
                                numberOfLines={2}
                                raw
                              >
                                {appointment.dateLine ||
                                  appointment.whenLabel ||
                                  t('homeConsultDate')}
                              </AppText>
                              {weekday ? (
                                <AppText
                                  variant="labelSm"
                                  color={colors.onSurfaceVariant}
                                  numberOfLines={1}
                                  raw
                                >
                                  {weekday}
                                </AppText>
                              ) : null}
                            </View>
                          </View>
                          <View
                            style={[
                              styles.bookingMetaTile,
                              isClinic ? styles.clinicTypeTile : styles.typeTile,
                            ]}
                          >
                            <View style={styles.metaIconBubble}>
                              <Ionicons
                                name={modeIcon}
                                size={16}
                                color={colors.primary}
                              />
                            </View>
                            <View style={styles.bookingMetaCopy}>
                              <AppText
                                variant="labelSm"
                                color={colors.onSurfaceVariant}
                                numberOfLines={1}
                              >
                                {t('homeBookingConsultationType')}
                              </AppText>
                              <AppText
                                variant="bodyMd"
                                color={colors.ink}
                                weightOverride="600"
                                numberOfLines={1}
                              >
                                {modeShortLabel}
                              </AppText>
                              <AppText
                                variant="labelSm"
                                color={colors.onSurfaceVariant}
                                numberOfLines={2}
                              >
                                {modeSubtitle}
                              </AppText>
                            </View>
                          </View>
                        </View>

                        {appointment.timeLine ? (
                          <View style={styles.timeStrip}>
                            <View style={styles.metaIconBubble}>
                              <Ionicons
                                name="time-outline"
                                size={16}
                                color={colors.primary}
                              />
                            </View>
                            <View style={styles.bookingMetaCopy}>
                              <AppText
                                variant="labelSm"
                                color={colors.onSurfaceVariant}
                                numberOfLines={1}
                              >
                                {t('homeBookingConsultationTime')}
                              </AppText>
                              <AppText
                                variant="bodyMd"
                                color={colors.ink}
                                weightOverride="600"
                                numberOfLines={1}
                                raw
                              >
                                {appointment.timeLine}
                              </AppText>
                            </View>
                          </View>
                        ) : null}

                        {canJoin ? (
                          <AppButton
                            label={t('homeJoinConsultation')}
                            onPress={() => onJoinConsultation(appointment.id)}
                            icon={
                              <Ionicons
                                name="arrow-forward"
                                size={18}
                                color={colors.onPrimary}
                              />
                            }
                            iconPosition="end"
                            style={styles.joinButton}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {followUpPlanAvailable ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onOpenFollowUpPlan}
                  style={styles.followUpCard}
                >
                  <View style={styles.followUpIcon}>
                    <Ionicons name="clipboard-outline" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="titleMd" color={colors.ink}>
                      {t('homeFollowUpCardTitle')}
                    </AppText>
                    <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                      {t('homeFollowUpCardMeta')}
                    </AppText>
                  </View>
                  <AppText variant="labelMd" color={colors.primary} weightOverride="600">
                    {t('homeFollowUpCardAction')}
                  </AppText>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={onOpenConsultNow}
                style={styles.instantCard}
              >
                <View style={styles.instantDecorCircle} />
                <View style={styles.instantHead}>
                  <View style={styles.instantIcon}>
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.instantTitleRow}>
                      <AppText variant="titleMd" color={colors.ink} weightOverride="600">
                        {t('homeInstantAdvice')}
                      </AppText>
                      <View style={styles.instantPill}>
                        <AppText
                          variant="labelSm"
                          color={colors.warning}
                          weightOverride="600"
                        >
                          {t('homeInstantBadge')}
                        </AppText>
                      </View>
                    </View>
                    <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                      {t('homeInstantCardWait')
                        .replace(
                          '{count}',
                          language === 'mr'
                            ? '१४'
                            : String(CONSULT_NOW_AVAILABLE_DOCTORS),
                        )
                        .replace(
                          '{min}',
                          language === 'mr' ? '४' : String(CONSULT_NOW_WAIT_MIN),
                        )
                        .replace(
                          '{max}',
                          language === 'mr' ? '८' : String(CONSULT_NOW_WAIT_MAX),
                        )}
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={colors.warning}
                  />
                </View>
              </Pressable>

              <AppText variant="headlineMd" color={colors.ink}>
                {t('homeQuickActions')}
              </AppText>
              <View style={styles.quickGrid}>
                {QUICK_ACTIONS.map((action) => (
                  <Pressable
                    key={action.labelKey}
                    accessibilityRole="button"
                    onPress={
                      action.labelKey === 'homeInstantAdvice'
                        ? onOpenConsultNow
                        : action.labelKey === 'homeBookConsultation'
                          ? onOpenSearch
                          : action.labelKey === 'homeMyPrescriptions'
                            ? () => onOpenAccountRecords('prescriptions')
                            : action.labelKey === 'homeOrderMedicines'
                              ? onOpenOrderMedicines
                              : undefined
                    }
                    style={styles.quickCard}
                  >
                    <View style={styles.quickDecorCircle} />
                    {action.badgeKey ? (
                      <View style={styles.quickBadge}>
                        <AppText
                          variant="labelSm"
                          color={colors.onPrimary}
                          weightOverride="600"
                          style={styles.badgeText}
                        >
                          {t(action.badgeKey)}
                        </AppText>
                      </View>
                    ) : null}
                    <View style={styles.quickIconWrap}>
                      <MaterialCommunityIcons
                        name={action.icon}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.quickFooter}>
                      <AppText
                        variant="titleMd"
                        color={colors.ink}
                        weightOverride="600"
                        style={styles.quickLabel}
                        numberOfLines={2}
                      >
                        {t(action.labelKey)}
                      </AppText>
                      <View
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        style={styles.quickArrowBtn}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>

              {healthArticles.length > 0 ? (
                <>
                  <AppText variant="headlineMd" color={colors.ink}>
                    {t('homeHealthTips')}
                  </AppText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tipRow}
                  >
                    {healthArticles.map((article) => (
                      <Pressable
                        key={article.id}
                        accessibilityRole="button"
                        onPress={() => onOpenHealthTip(article.id)}
                        style={styles.tipCard}
                      >
                        <View style={styles.tipHero}>
                          {article.imageUrl ? (
                            <Image
                              source={{ uri: article.imageUrl }}
                              resizeMode="cover"
                              style={styles.tipHeroImage}
                            />
                          ) : (
                            <>
                              <View style={styles.tipDecorCircleLeft} />
                              <View style={styles.tipDecorCircleRight} />
                              <View style={styles.tipDecorDots}>
                                {Array.from({ length: 15 }).map((_, index) => (
                                  <View
                                    key={`tip-dot-${article.id}-${index}`}
                                    style={styles.tipDecorDot}
                                  />
                                ))}
                              </View>
                              <Ionicons
                                name="newspaper-outline"
                                size={36}
                                color={colors.primary}
                              />
                            </>
                          )}
                        </View>
                        {article.subtitle ? (
                          <View style={styles.tipChip}>
                            <AppText
                              variant="labelSm"
                              color={colors.primary}
                              weightOverride="600"
                              numberOfLines={1}
                              raw
                            >
                              {article.subtitle}
                            </AppText>
                          </View>
                        ) : null}
                        <View style={styles.tipFooter}>
                          <AppText
                            variant="titleMd"
                            color={colors.ink}
                            numberOfLines={2}
                            style={styles.tipTitle}
                            raw
                          >
                            {article.title}
                          </AppText>
                          <View
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            style={styles.tipArrowBtn}
                          >
                            <Ionicons
                              name="arrow-forward"
                              size={18}
                              color={colors.primary}
                            />
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </View>
          </ScrollView>
        </View>
      ) : selectedTab === 'doctors' ? (
        <View style={styles.doctorsTab}>
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(insets.top, spacing.sm) + spacing.sm },
            ]}
          >
            <View style={styles.doctorsHeaderTop}>
              <AppText
                variant="titleMd"
                color={colors.ink}
                style={[styles.greeting, styles.flex]}
              >
                {t('homeTabDoctors')}
              </AppText>
              <View style={styles.headerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('languageLabel')}
                  onPress={() =>
                    onSelectLanguage(language === 'en' ? 'mr' : 'en')
                  }
                  style={styles.languageButton}
                >
                  <AppText
                    variant="labelMd"
                    color={colors.onSurface}
                    languageOverride={language === 'en' ? 'en' : 'mr'}
                  >
                    {language === 'en' ? 'EN' : 'मराठी'}
                  </AppText>
                </Pressable>
                <NotificationBell
                  count={notificationCount}
                  label={t('homeNotifications')}
                  onPress={onOpenNotifications}
                />
              </View>
            </View>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              {t('doctorsTabSubtitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('homeSearchPlaceholder')}
              onPress={onOpenSearch}
              style={styles.searchWrap}
            >
              <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
              <AppText
                variant="bodyMd"
                color={
                  doctorsSearch.q || doctorsSearch.city
                    ? colors.onSurface
                    : colors.onSurfaceVariant
                }
                style={styles.searchPlaceholder}
                numberOfLines={1}
                raw={Boolean(doctorsSearch.q || doctorsSearch.city)}
              >
                {doctorsSearch.q?.trim() ||
                  doctorsSearch.city?.trim() ||
                  t('homeSearchPlaceholder')}
              </AppText>
            </Pressable>
            <ScrollView
              horizontal
              bounces={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.doctorsBadgeRow}
            >
              <Pressable
                accessibilityRole="button"
                onPress={onOpenDoctorsFilters}
                style={styles.doctorsToolButton}
              >
                <Ionicons name="filter" size={18} color={colors.ink} />
                <AppText variant="labelMd" color={colors.ink}>
                  {`${t('searchAllFilters')} (${doctorsFilterCount})`}
                </AppText>
              </Pressable>
              {doctorsSearch.city?.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onRemoveDoctorsCity}
                  style={styles.doctorsActiveChip}
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={colors.ink}
                  />
                  <AppText variant="labelMd" color={colors.ink} raw>
                    {doctorsSearch.city.trim()}
                  </AppText>
                  <Ionicons name="close" size={14} color={colors.ink} />
                </Pressable>
              ) : null}
              {doctorsSearch.q?.trim() &&
                doctorsSearch.q.trim() !== doctorsSearch.city?.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onRemoveDoctorsQuery}
                  style={styles.doctorsActiveChip}
                >
                  <AppText
                    variant="labelMd"
                    color={colors.ink}
                    raw
                    numberOfLines={1}
                  >
                    {doctorsSearch.q.trim()}
                  </AppText>
                  <Ionicons name="close" size={14} color={colors.ink} />
                </Pressable>
              ) : null}
            </ScrollView>
          </View>

          <ScrollView
            style={styles.doctorsBody}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isDoctorsLoading}
                onRefresh={refetchDoctors}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={[
              styles.bookingsList,
              displayedDoctors.length === 0 && !isDoctorsLoading
                ? styles.doctorsEmptyScroll
                : null,
              { paddingBottom: tabScrollInset },
            ]}
          >
            {displayedDoctors.length > 0 || isDoctorsLoading ? (
              <View style={styles.availableDoctorsSectionHead}>
                <View style={styles.availableDoctorsTitleRow}>
                  <AppText
                    variant="headlineMd"
                    color={colors.ink}
                    weightOverride="600"
                  >
                    {t('doctorsAvailableTitle')}
                  </AppText>
                  {publicDoctors.length > 0 ? (
                    <AppText variant="bodyMd" color={colors.muted}>
                      {`${publicDoctors.length} verified doctors`}
                    </AppText>
                  ) : null}
                </View>

                <View style={styles.doctorFilterPills}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setDoctorFilter('all')}
                    style={[
                      styles.filterPill,
                      doctorFilter === 'all' && styles.filterPillActive,
                    ]}
                  >
                    <AppText
                      variant="labelMd"
                      color={
                        doctorFilter === 'all' ? colors.primary : colors.muted
                      }
                      weightOverride={doctorFilter === 'all' ? '600' : '500'}
                    >
                      {`${t('doctorsFilterAll')} (${publicDoctors.length})`}
                    </AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setDoctorFilter('online')}
                    style={[
                      styles.filterPill,
                      doctorFilter === 'online' && styles.filterPillActive,
                    ]}
                  >
                    <View style={styles.onlineDot} />
                    <AppText
                      variant="labelMd"
                      color={
                        doctorFilter === 'online'
                          ? colors.primary
                          : colors.muted
                      }
                      weightOverride={
                        doctorFilter === 'online' ? '600' : '500'
                      }
                    >
                      {`${t('doctorsFilterOnline')} (${publicDoctors.filter((d) => d.isOnline).length})`}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {isDoctorsLoading && publicDoctors.length === 0 ? (
              <View style={styles.doctorLoadingWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                  {t('loading')}
                </AppText>
              </View>
            ) : isDoctorsError && publicDoctors.length === 0 ? (
              <View style={styles.doctorErrorWrap}>
                <Ionicons
                  name="alert-circle-outline"
                  size={40}
                  color={colors.error}
                />
                <AppText variant="bodyMd" color={colors.ink}>
                  {t('genericError')}
                </AppText>
                <AppButton
                  label={t('doctorsRetry')}
                  onPress={refetchDoctors}
                  variant="secondary"
                />
              </View>
            ) : displayedDoctors.length === 0 ? (
              <View style={styles.doctorsSearchEmpty}>
                <View style={styles.doctorsEmptyArt}>
                  <EmptyDoctorsIllustration />
                </View>
                <AppText
                  variant="titleMd"
                  color={colors.ink}
                  style={styles.centerText}
                >
                  {t('searchResultsEmptyTitle')}
                </AppText>
                <AppText
                  variant="bodyMd"
                  color={colors.muted}
                  style={styles.doctorsEmptyBody}
                >
                  {t('searchResultsEmptyBody')}
                </AppText>
                <View style={styles.doctorsEmptyActions}>
                  <AppButton
                    label={t('searchResultsClearFilters')}
                    textVariant="titleMd"
                    onPress={onClearDoctorsSearch}
                    style={styles.doctorsEmptyButton}
                  />
                  <AppButton
                    label={t('searchResultsBookAssistance')}
                    variant="secondary"
                    textVariant="titleMd"
                    onPress={onOpenBookWithHelp}
                    style={styles.doctorsEmptyButton}
                  />
                </View>
                <AppText
                  variant="bodyMd"
                  color={colors.muted}
                  style={styles.centerText}
                >
                  {t('searchResultsHelplinePrefix')}
                  <AppText
                    variant="labelMd"
                    color={colors.primary}
                    style={styles.helplineLink}
                    onPress={() => Linking.openURL('tel:104')}
                  >
                    {t('searchResultsHelplineNumber')}
                  </AppText>
                </AppText>
              </View>
            ) : (
              displayedDoctors.map((doc) => (
                <DoctorCard
                  key={doc.doctorId}
                  doctor={doc}
                  t={t}
                  onBook={() => onOpenDoctorProfile(String(doc.doctorId))}
                  onInstantConsult={onOpenConsultNow}
                />
              ))
            )}
          </ScrollView>
        </View>
      ) : selectedTab === 'records' ? (
        <HealthRecordsView
          onOpenFollowUpPlan={onOpenFollowUpPlan}
          onOpenOrderMedicines={onOpenOrderMedicines}
          onOpenNotifications={onOpenNotifications}
          onAddMember={onAddMember}
          notificationCount={notificationCount}
        />
      ) : selectedTab === 'medicines' ? (
        <MedicinesView
          onBookFollowUp={onOpenSearch}
          onSeePrescriptions={() => onSelectTab('records')}
          onTrackOrder={onTrackOrder}
          onOrderRx={() => onOpenOrderMedicines()}
          onOpenPastOrder={onOpenOrderDetails}
          onOpenNotifications={onOpenNotifications}
          notificationCount={notificationCount}
          forceHasOrders={medicineOrderPlaced}
        />
      ) : selectedTab === 'account' ? (
        <AccountView {...account} />
      ) : (
        <View
          style={[
            styles.placeholder,
            { paddingTop: Math.max(insets.top, spacing.lg) },
          ]}
        >
          <Ionicons
            name="construct-outline"
            size={40}
            color={colors.onSurfaceVariant}
          />
          <AppText variant="titleMd" color={colors.onSurface}>
            {t('homeTabAccount')}
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
            {t('homeComingSoon')}
          </AppText>
        </View>
      )}

      <PatientTabBar
        selectedTab={selectedTab}
        t={t}
        onSelectTab={onSelectTab}
      />

      <WhoForMemberSheet
        visible={memberPickerOpen}
        members={memberOptions}
        selectedMemberId={selectedMemberId}
        t={t}
        language={language}
        onClose={onCloseMemberPicker}
        onSelectMember={onSelectMember}
        onAddMember={onAddMember}
      />

      <DoctorFiltersSheet
        language={language}
        t={t}
        visible={doctorsFiltersOpen}
        draft={doctorsFilterDraft}
        matchingCount={doctorsFilterMatchingCount}
        datePickerOpen={doctorsDatePickerOpen}
        customDate={
          Number.isNaN(doctorsFilterCustomDate.getTime())
            ? new Date()
            : doctorsFilterCustomDate
        }
        cityOptions={doctorsCityOptions}
        qualificationOptions={doctorsQualificationOptions}
        onClose={onCloseDoctorsFilters}
        onReset={onResetDoctorsFilterDraft}
        onClear={onClearDoctorsFilters}
        onApply={onApplyDoctorsFilters}
        onToggleCareNeed={onToggleDoctorsCareNeed}
        onToggleMode={onToggleDoctorsMode}
        onToggleAvailability={onToggleDoctorsAvailability}
        onChangeFeeRange={onChangeDoctorsFeeRange}
        onToggleLanguage={onToggleDoctorsFilterLanguage}
        onToggleGender={onToggleDoctorsGender}
        onToggleRecognized={onToggleDoctorsRecognized}
        onToggleFocusCert={onToggleDoctorsFocusCert}
        onChangeLocationQuery={onChangeDoctorsLocationQuery}
        onToggleCity={onToggleDoctorsCity}
        onToggleCurrentLocation={onToggleDoctorsCurrentLocation}
        onOpenDatePicker={onOpenDoctorsDatePicker}
        onCloseDatePicker={onCloseDoctorsDatePicker}
        onSelectCustomDate={onSelectDoctorsCustomDate}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  completedMovedToast: {
    position: 'absolute',
    alignSelf: 'center',
    left: spacing.gutter,
    right: spacing.gutter,
    zIndex: 99,
    gap: spacing.sm,
    borderRadius: radii.default,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.primaryFixedDim,
  },
  completedMovedToastText: {
    flexShrink: 1,
  },
  completedMovedToastActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 48,
  },
  completedMovedToastCta: {
    minHeight: 48,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  completedMovedToastDismiss: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.card,
    borderBottomLeftRadius: radii.default,
    borderBottomRightRadius: radii.default,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  greeting: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(26),
  },
  forWhomChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageButton: {
    minHeight: 36,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.default,
    borderTopRightRadius: radii.default,
    borderBottomLeftRadius: radii.default,
    borderBottomRightRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  searchPlaceholder: {
    flex: 1,
  },
  doctorsBadgeRow: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  doctorsToolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    minHeight: 40,
  },
  doctorsActiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 180,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingLeft: 12,
    paddingRight: spacing.sm,
    paddingVertical: 6,
    minHeight: 40,
  },
  doctorsEmptyScroll: {
    flexGrow: 1,
  },
  doctorsSearchEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  doctorsEmptyArt: {
    width: 208,
    height: 208,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  doctorsEmptyBody: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  doctorsEmptyActions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  doctorsEmptyButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: radii.button,
  },
  centerText: {
    textAlign: 'center',
  },
  helplineLink: {
    textDecorationLine: 'underline',
  },
  body: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  bookingsSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  consultCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  doctorInitials: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followUpCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 72,
  },
  followUpIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  doctorName: {
    flexShrink: 1,
  },
  bookingMetaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  bookingMetaTile: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  bookingMetaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  dateTile: {
    backgroundColor: colors.primaryContainer,
  },
  typeTile: {
    backgroundColor: colors.tertiaryFixed,
  },
  clinicTypeTile: {
    backgroundColor: colors.surfaceContainer,
  },
  metaIconBubble: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  joinButton: {
    minHeight: 48,
    width: '100%',
  },
  instantCard: {
    backgroundColor: colors.warningContainer,
    borderWidth: 1,
    borderColor: colors.tertiaryContainer,
    borderRadius: radii.default,
    padding: spacing.md,
    overflow: 'hidden',
  },
  instantDecorCircle: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.tertiaryContainer,
    opacity: 0.35,
    right: -28,
    bottom: -36,
  },
  instantHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instantIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 2,
  },
  instantPill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.tertiaryContainer,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    flexGrow: 1,
    minHeight: 128,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    overflow: 'hidden',
  },
  quickDecorCircle: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer,
    opacity: 0.45,
    top: -24,
    right: -20,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: colors.ink,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 14,
  },
  quickFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    minHeight: 48,
  },
  quickLabel: {
    flex: 1,
    minWidth: 0,
  },
  quickArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  tipCard: {
    width: 280,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.card,
  },
  tipHero: {
    width: '100%',
    height: 120,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryContainer,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipHeroImage: {
    ...StyleSheet.absoluteFill,
  },
  tipDecorCircleLeft: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.secondaryContainer,
    opacity: 0.55,
    left: -28,
    top: -24,
  },
  tipDecorCircleRight: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryContainer,
    opacity: 0.45,
    right: -18,
    bottom: -22,
  },
  tipDecorDots: {
    position: 'absolute',
    right: 18,
    top: 28,
    width: 36,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tipDecorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryFixedDim,
  },
  tipChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tipFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  tipTitle: {
    flex: 1,
    minWidth: 0,
  },
  tipArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTab: {
    flex: 1,
  },
  homeBody: {
    flex: 1,
  },
  doctorsTab: {
    flex: 1,
    backgroundColor: colors.page,
  },
  doctorsHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  doctorsBody: {
    flex: 1,
  },
  bookingsList: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  bookingsEmpty: {
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    padding: spacing.md,
  },
  bookingCard: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 10,
    backgroundColor: colors.card,
  },
  bookingHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bookingAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningContainer,
    borderWidth: 1,
    borderColor: colors.tertiaryContainer,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  confirmedBadge: {
    backgroundColor: colors.successContainer,
    borderColor: colors.successContainer,
  },
  pressed: {
    opacity: 0.88,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  flex: {
    flex: 1,
  },
  availableDoctorsSectionHead: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  availableDoctorsTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  doctorFilterPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterPillActive: {
    backgroundColor: colors.successContainer,
    borderColor: colors.primary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  doctorLoadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  doctorErrorWrap: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.errorContainer,
  },
  docCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  docCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  docAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    position: 'relative',
    flexShrink: 0,
  },
  docAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  docAvatarInitials: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.successContainer,
    borderWidth: 1,
    borderColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  docInfoCol: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 3,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  docName: {
    flex: 1,
    flexShrink: 1,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successContainer,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.successContainer,
    flexShrink: 0,
  },
  docSubtitle: {
    marginTop: 1,
    lineHeight: 18,
    flexShrink: 1,
    width: '100%',
  },
  rankingSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.successContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.successContainer,
    marginTop: 3,
    maxWidth: '100%',
    alignSelf: 'flex-start',
  },
  rankingSummaryText: {
    flex: 1,
    flexShrink: 1,
  },
  feesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.page,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  feeCol: {
    flex: 1,
    gap: 3,
  },
  feeModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  feeModeLabel: {
    flexShrink: 1,
  },
  feePrice: {
    paddingLeft: 19,
  },
  feeDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: 10,
  },
  docActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  instantConsultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.warningContainer,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.tertiaryContainer,
  },
  bookDocBtn: {
    flex: 1,
    height: 42,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
