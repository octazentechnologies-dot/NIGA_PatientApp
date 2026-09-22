import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { images } from '../config/images';
import type {
  ChatMessage,
  ConsultationChatViewModel,
} from '../controllers/useConsultationChatController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const CLOSED_FILL = '#FCF3E4';
const CLOSED_BORDER = '#F2C14E';

export function ConsultationChatView(vm: ConsultationChatViewModel) {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const prev = vm.messages[index - 1];
    const showDate = !prev || prev.dateGroup !== item.dateGroup;
    const dateLabel =
      item.dateGroup === 'today' ? vm.t('chatToday') : item.dateGroup;

    return (
      <Fragment>
        {showDate ? (
          <View style={styles.datePillWrap}>
            <View style={styles.datePill}>
              <AppText variant="labelSm" color={MUTED} style={styles.datePillText}>
                {dateLabel}
              </AppText>
            </View>
          </View>
        ) : null}
        {item.kind === 'prescription' ? (
          <View style={styles.rxCard}>
            <Ionicons name="document-text" size={20} color={ACTION} />
            <AppText variant="labelMd" color={INK} style={styles.rxText}>
              {item.body}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onViewPrescription}
              style={styles.rxBtn}
            >
              <AppText variant="labelMd" color={colors.onButton} weightOverride="600">
                {vm.t('chatViewPrescription')}
              </AppText>
            </Pressable>
          </View>
        ) : item.kind === 'image' ? (
          <View style={[styles.bubbleWrap, styles.patientAlign]}>
            <View style={styles.imageBubble}>
              <Image
                source={item.imageSource ?? images.categorySkin}
                style={styles.attachImage}
                resizeMode="cover"
              />
              <View style={styles.fileRow}>
                <AppText variant="labelSm" color={MUTED} style={styles.fileMeta} numberOfLines={1}>
                  {item.fileName}
                  {item.fileSize ? ` · ${item.fileSize}` : ''}
                </AppText>
                <Ionicons name="download-outline" size={18} color={ACTION} />
              </View>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.bubbleWrap,
              item.from === 'patient' ? styles.patientAlign : styles.doctorAlign,
            ]}
          >
            <View
              style={[
                styles.bubble,
                item.from === 'patient' ? styles.patientBubble : styles.doctorBubble,
              ]}
            >
              <AppText
                variant="bodyMd"
                color={item.from === 'patient' ? colors.onButton : INK}
              >
                {item.body}
              </AppText>
              <View style={styles.metaRow}>
                <AppText
                  variant="labelSm"
                  color={item.from === 'patient' ? 'rgba(255,255,255,0.85)' : MUTED}
                >
                  {item.timeLabel}
                </AppText>
                {item.from === 'patient' && item.read ? (
                  <Ionicons name="checkmark-done" size={14} color={colors.onButton} />
                ) : null}
              </View>
            </View>
          </View>
        )}
      </Fragment>
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <Image source={images.doctorPortrait} style={styles.avatar} />
          <Pressable
            style={styles.headerCopy}
            onLongPress={vm.onToggleClosedDemo}
            delayLongPress={600}
          >
            <AppText variant="titleMd" color={INK} numberOfLines={1}>
              {vm.doctorName}
            </AppText>
            <AppText variant="labelSm" color={MUTED} numberOfLines={1}>
              {vm.statusLabel}
            </AppText>
          </Pressable>
          {vm.closed ? (
            <Pressable style={styles.iconHit} accessibilityRole="button">
              <Ionicons name="ellipsis-vertical" size={20} color={INK} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('chatVideoCall')}
              onPress={vm.onOpenVideo}
              style={styles.iconHit}
            >
              <Ionicons name="videocam" size={24} color={ACTION} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.linkedBar}>
        <AppText variant="labelSm" color={INK} style={styles.linkedText} numberOfLines={2}>
          {vm.linkedLabel}
        </AppText>
        <Pressable onPress={vm.onViewLinked} accessibilityRole="button" style={styles.viewLink}>
          <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
            {vm.t('chatView')}
          </AppText>
        </Pressable>
      </View>

      <FlatList
        data={vm.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.thread}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          vm.closed ? (
            <View style={styles.closedBanner}>
              <Ionicons name="lock-closed" size={14} color={MUTED} />
              <AppText variant="labelSm" color={MUTED} style={styles.closedBannerText}>
                {vm.t('chatClosedBanner').replace('{date}', vm.closedDateLabel)}
              </AppText>
            </View>
          ) : null
        }
      />

      {vm.closed ? (
        <View
          style={[
            styles.closedFooter,
            { paddingBottom: sheetBottomPadding(insets, spacing.md) },
          ]}
        >
          <AppText variant="bodyMd" color={MUTED} style={styles.closedHint}>
            {vm.t('chatClosedHint')}
          </AppText>
          <AppButton
            label={vm.t('chatBookConsultation')}
            onPress={vm.onBookConsultation}
          />
        </View>
      ) : (
        <View
          style={[
            styles.composer,
            { paddingBottom: sheetBottomPadding(insets, spacing.md) },
          ]}
        >
          <AppText variant="labelSm" color={MUTED} style={styles.sla}>
            {vm.replySlaLabel}
          </AppText>
          <View style={styles.composerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('chatAttach')}
              onPress={vm.onAttach}
              style={styles.iconHit}
            >
              <Ionicons name="attach" size={24} color={MUTED} />
            </Pressable>
            <View style={styles.inputWrap}>
              <TextInput
                value={vm.draft}
                onChangeText={vm.onChangeDraft}
                placeholder={vm.t('chatPlaceholder')}
                placeholderTextColor={MUTED}
                style={styles.input}
                multiline
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('chatSend')}
              onPress={vm.onSend}
              disabled={!vm.canSend}
              style={[styles.sendBtn, !vm.canSend && styles.sendDisabled]}
            >
              <Ionicons name="send" size={20} color={colors.onButton} />
            </Pressable>
          </View>
        </View>
      )}
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
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  linkedBar: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkedText: {
    flex: 1,
  },
  viewLink: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  thread: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  datePillWrap: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  datePill: {
    backgroundColor: '#DDDFE2',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  datePillText: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bubbleWrap: {
    maxWidth: '85%',
    marginVertical: 2,
  },
  doctorAlign: {
    alignSelf: 'flex-start',
  },
  patientAlign: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  doctorBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderBottomLeftRadius: 4,
  },
  patientBubble: {
    backgroundColor: ACTION,
    borderBottomRightRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  imageBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    borderBottomRightRadius: 4,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  attachImage: {
    width: 200,
    height: 200,
    borderRadius: radii.sm,
    backgroundColor: HAIRLINE,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  fileMeta: {
    flex: 1,
  },
  rxCard: {
    alignSelf: 'center',
    maxWidth: '100%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  rxText: {
    textAlign: 'center',
  },
  rxBtn: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
    backgroundColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedBanner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: CLOSED_FILL,
    borderWidth: 1,
    borderColor: CLOSED_BORDER,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  closedBannerText: {
    flexShrink: 1,
  },
  composer: {
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  sla: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: {
    color: INK,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.45,
  },
  closedFooter: {
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  closedHint: {
    textAlign: 'center',
  },
});
