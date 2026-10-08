import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { NotificationBell } from '../components/NotificationBell';
import { PatientTabBar, usePatientTabScrollInset } from '../components/PatientTabBar';
import { Screen } from '../components/Screen';
import { WhoForMemberSheet } from '../components/WhoForMemberSheet';
import { formatRupees } from '../config/appointmentSlots';
import { CARE_CATEGORIES } from '../config/careCategories';
import {
  CONSULT_NOW_AVAILABLE_DOCTORS,
  CONSULT_NOW_FEE_RUPEES,
  CONSULT_NOW_WAIT_MAX,
  CONSULT_NOW_WAIT_MIN,
} from '../config/consultNow';
import { getHomeHealthTips } from '../config/healthTips';
import { images } from '../config/images';
import type { HomeViewModel } from '../controllers/useHomeController';
import type { TranslationKey } from '../localization/types';
import type { PublicDoctor } from '../store/api/new/doctorsApi';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';

function getDoctorPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null;
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  const clean = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
  return `https://devapi2.homeocentrum.com/${clean}`;
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
  const photoUrl = getDoctorPhotoUrl(doctor.photoPath);
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
                weightOverride="700"
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
              color="#0F172A"
              weightOverride="700"
              style={styles.docName}
              numberOfLines={2}
            >
              {formattedName}
            </AppText>
            {isVerified ? (
              <View style={styles.verifiedBadgeRow}>
                <Ionicons name="checkmark-circle" size={13} color="#059669" />
                <AppText variant="labelSm" color="#059669" weightOverride="600">
                  {t('doctorsVerified')}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText
            variant="bodyMd"
            color="#64748B"
            numberOfLines={2}
            style={styles.docSubtitle}
          >
            {[doctor.qualification, doctor.clinicName, doctor.city]
              .filter(Boolean)
              .join(' · ')}
          </AppText>

          {Boolean(doctor.rankingSummary) && (
            <View style={styles.rankingSummaryBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#047857" />
              <AppText
                variant="labelSm"
                color="#047857"
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
              color="#64748B"
              numberOfLines={1}
              style={styles.feeModeLabel}
            >
              {t('doctorsTeleFee')}
            </AppText>
          </View>
          <AppText
            variant="labelLg"
            color="#0F172A"
            weightOverride="700"
            style={styles.feePrice}
          >
            {doctor.consultFeeTele ? `₹${doctor.consultFeeTele}` : '—'}
          </AppText>
        </View>

        <View style={styles.feeDivider} />

        <View style={styles.feeCol}>
          <View style={styles.feeModeRow}>
            <Ionicons name="business-outline" size={14} color={colors.primary} />
            <AppText
              variant="labelSm"
              color="#64748B"
              numberOfLines={1}
              style={styles.feeModeLabel}
            >
              {t('doctorsClinicFee')}
            </AppText>
          </View>
          <AppText
            variant="labelLg"
            color="#0F172A"
            weightOverride="700"
            style={styles.feePrice}
          >
            {doctor.consultFeeInClinic ? `₹${doctor.consultFeeInClinic}` : '—'}
          </AppText>
        </View>
      </View>

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
            <Ionicons name="flash" size={14} color="#B45309" />
            <AppText variant="labelMd" color="#92400E" weightOverride="700">
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
          <AppText variant="labelMd" color="#FFFFFF" weightOverride="700">
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
  onOpenAppointment,
  followUpPlanAvailable,
  onOpenFollowUpPlan,
  onOpenOrderMedicines,
  medicineOrderPlaced,
  onOpenOrderDetails,
  publicDoctors = [],
  isDoctorsLoading = false,
  isDoctorsError = false,
  refetchDoctors,
  onOpenDoctorProfile,
  onOpenBooking,
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

  return (
    <Screen edges={['left', 'right']} style={styles.root}>
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
                  color="#000000"
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
              <View style={styles.consultCard}>
                <View style={styles.consultTop}>
                  <View style={styles.doctorRow}>
                    <View style={styles.flex}>
                      <View style={styles.nameRow}>
                        <AppText
                          variant="titleMd"
                          color={colors.onSurface}
                          style={styles.doctorName}
                        >
                          {t('homeDoctorName')}
                        </AppText>
                        <View
                          accessibilityLabel={t('homeVerified')}
                          style={styles.verifiedBadge}
                        >
                          <Ionicons
                            name="shield-checkmark"
                            size={14}
                            color="#000000"
                          />
                        </View>
                      </View>
                      <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                        {t('homeDoctorQualification')}
                      </AppText>
                    </View>
                    <Image
                      source={images.doctorPortrait}
                      resizeMode="cover"
                      style={styles.doctorPhoto}
                    />
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.onSurfaceVariant}
                    />
                    <AppText variant="bodyMd" color={colors.onSurface}>
                      {t('homeConsultDate')}
                    </AppText>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="videocam-outline"
                      size={16}
                      color={colors.onSurfaceVariant}
                    />
                    <AppText variant="bodyMd" color={colors.onSurface}>
                      {t('homeConsultMode')}
                    </AppText>
                  </View>
                </View>

                <View style={styles.consultBottom}>
                  <View style={styles.startsBanner}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.onSurfaceVariant}
                    />
                    <AppText variant="bodyMd" color={colors.onSurface}>
                      {t('homeStartsIn')}
                    </AppText>
                  </View>

                  <AppButton
                    label={t('homeJoinConsultation')}
                    textVariant="titleMd"
                    onPress={onJoinConsultation}
                    style={styles.joinButton}
                  />
                </View>
              </View>

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
                    <AppText variant="titleMd" color="#1F1F1F">
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
                      <AppText variant="titleMd" color="#000000" style={styles.flex}>
                        {t('homeInstantAdvice')}
                      </AppText>
                      <View style={styles.instantPill}>
                        <AppText variant="labelSm" color="#8A5109" weightOverride="600">
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
                </View>
                <AppText variant="labelSm" color="#8A5109">
                  {t('homeInstantCardPaid').replace(
                    '{fee}',
                    formatRupees(CONSULT_NOW_FEE_RUPEES.video, language),
                  )}
                </AppText>
              </Pressable>

              <AppText variant="headlineMd" color={colors.onSurface}>
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
                          : undefined
                    }
                    style={styles.quickCard}
                  >
                    {action.badgeKey ? (
                      <View style={styles.quickBadge}>
                        <AppText
                          variant="labelSm"
                          color={colors.onPrimary}
                          style={styles.badgeText}
                        >
                          {t(action.badgeKey)}
                        </AppText>
                      </View>
                    ) : null}
                    <View style={styles.quickIconWrap}>
                      <MaterialCommunityIcons
                        name={action.icon}
                        size={26}
                        color={colors.primary}
                      />
                    </View>
                    <AppText
                      variant="bodyMd"
                      color={colors.onSurface}
                      style={styles.centerText}
                    >
                      {t(action.labelKey)}
                    </AppText>
                    {action.labelKey === 'homeInstantAdvice' ? (
                      <AppText
                        variant="labelSm"
                        color="#8A5109"
                        style={styles.centerText}
                      >
                        {formatRupees(CONSULT_NOW_FEE_RUPEES.video, language)}
                      </AppText>
                    ) : null}
                  </Pressable>
                ))}
              </View>

              <AppText variant="headlineMd" color={colors.onSurface}>
                {t('homeCareCategories')}
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CARE_CATEGORIES.map((category) => (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    style={styles.categoryItem}
                  >
                    <View style={styles.categoryIcon}>
                      <Image
                        source={category.image}
                        resizeMode="contain"
                        style={styles.categoryImage}
                      />
                    </View>
                    <AppText
                      variant="labelSm"
                      color={colors.onSurface}
                      style={styles.centerText}
                      numberOfLines={2}
                    >
                      {t(category.homeLabelKey)}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>

              <AppText variant="headlineMd" color={colors.onSurface}>
                {t('homeHealthTips')}
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tipRow}
              >
                {getHomeHealthTips().map((tip) => (
                  <Pressable
                    key={tip.id}
                    accessibilityRole="button"
                    onPress={() => onOpenHealthTip(tip.id)}
                    style={styles.tipCard}
                  >
                    <Image
                      source={tip.hero}
                      resizeMode="contain"
                      style={styles.tipImage}
                    />
                    <View style={styles.tipChip}>
                      <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                        {t(tip.categoryKey)}
                      </AppText>
                    </View>
                    <AppText
                      variant="titleMd"
                      color={colors.onSurface}
                      numberOfLines={3}
                      style={styles.tipTitle}
                    >
                      {t(tip.titleKey)}
                    </AppText>
                    <AppText variant="labelSm" color={colors.onSurfaceVariant} numberOfLines={2}>
                      {t('tipReviewedBy').replace('{name}', t(tip.reviewerKey))}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
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
                color="#1F1F1F"
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
                color={colors.onSurfaceVariant}
                style={styles.searchPlaceholder}
                numberOfLines={1}
              >
                {t('homeSearchPlaceholder')}
              </AppText>
            </Pressable>
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
              { paddingBottom: tabScrollInset },
            ]}
          >
            <View style={styles.availableDoctorsSectionHead}>
              <View style={styles.availableDoctorsTitleRow}>
                <AppText variant="headlineMd" color="#0F172A" weightOverride="700">
                  {t('doctorsAvailableTitle')}
                </AppText>
                {publicDoctors.length > 0 ? (
                  <AppText variant="bodyMd" color="#64748B">
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
                    color={doctorFilter === 'all' ? colors.primary : '#475569'}
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
                    color={doctorFilter === 'online' ? colors.primary : '#475569'}
                    weightOverride={doctorFilter === 'online' ? '600' : '500'}
                  >
                    {`${t('doctorsFilterOnline')} (${publicDoctors.filter((d) => d.isOnline).length})`}
                  </AppText>
                </Pressable>
              </View>
            </View>

            {isDoctorsLoading && publicDoctors.length === 0 ? (
              <View style={styles.doctorLoadingWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                  {t('loading')}
                </AppText>
              </View>
            ) : isDoctorsError && publicDoctors.length === 0 ? (
              <View style={styles.doctorErrorWrap}>
                <Ionicons name="alert-circle-outline" size={40} color="#E53935" />
                <AppText variant="bodyMd" color="#1F1F1F">
                  {t('genericError')}
                </AppText>
                <AppButton
                  label={t('doctorsRetry')}
                  onPress={refetchDoctors}
                  variant="secondary"
                />
              </View>
            ) : displayedDoctors.length === 0 ? (
              <View style={styles.bookingsEmpty}>
                <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                  {t('doctorsNoDoctors')}
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
        onClose={onCloseMemberPicker}
        onSelectMember={onSelectMember}
        onAddMember={onAddMember}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
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
    fontSize: scaleFont(22),
    lineHeight: scaleFont(28),
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
  body: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  consultCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginTop: spacing.md,
    minHeight: 280,
    justifyContent: 'space-between',
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
  consultTop: {
    gap: spacing.sm,
  },
  consultBottom: {
    gap: spacing.sm,
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
  verifiedBadge: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorPhoto: {
    width: 56,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  startsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  joinButton: {
    minHeight: 48,
    width: '100%',
    borderRadius: radii.button,
  },
  instantCard: {
    backgroundColor: '#FCF3E4',
    borderWidth: 1,
    borderColor: '#F2C14E',
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 8,
  },
  instantHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instantIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instantPill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#F2C14E',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    flexGrow: 1,
    minHeight: 112,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    overflow: 'hidden',
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.onSurface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 14,
  },
  centerText: {
    textAlign: 'center',
  },
  categoryRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  categoryItem: {
    width: 88,
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 36,
    height: 36,
    tintColor: colors.primary,
  },
  tipRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  tipCard: {
    width: 260,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.card,
  },
  tipImage: {
    width: '100%',
    height: 132,
    borderRadius: radii.sm,
    backgroundColor: colors.buttonFill,
  },
  tipChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.buttonFill,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tipTitle: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
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
    borderColor: '#DDDFE2',
    backgroundColor: colors.card,
    padding: spacing.md,
  },
  bookingCard: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
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
    backgroundColor: '#FCF3E4',
    borderWidth: 1,
    borderColor: '#F2C14E',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  confirmedBadge: {
    backgroundColor: '#E9F5EF',
    borderColor: '#CDE8DA',
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
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#E6F4EA',
    borderColor: colors.primary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    gap: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
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
    borderColor: '#E2E8F0',
  },
  docAvatarInitials: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBF4F0',
    borderWidth: 1,
    borderColor: '#D1E7DD',
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
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
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
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#E2E8F0',
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
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
