import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { WhoForMemberSheet } from '../components/WhoForMemberSheet';
import {
  DOC_TYPE_KEYS,
  UPLOAD_DOC_TYPES,
  type UploadDocumentViewModel,
} from '../controllers/useUploadDocumentController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { sheetBottomPadding } from '../utilities/sheetInset';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION = '#2A7BA3';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const PLACEHOLDER = '#8A8A8A';

export function UploadDocumentView(vm: UploadDocumentViewModel) {
  const insets = useSafeAreaInsets();
  const saveLabel =
    vm.readyCount === 1
      ? vm.t('uploadDocSaveOne')
      : vm.t('uploadDocSaveMany').replace('{count}', String(vm.readyCount));

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('close')}
            onPress={vm.onClose}
            style={styles.iconHit}
          >
            <Ionicons name="close" size={24} color={INK} />
          </Pressable>
          <AppText variant="titleMd" color={INK} style={styles.headerTitle} numberOfLines={1}>
            {vm.t('uploadDocTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onHelp}
            style={styles.helpHit}
          >
            <AppText variant="labelMd" color={ACTION} weightOverride="600">
              {vm.t('uploadDocHelp')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              layout.buttonHeight +
              spacing.xl +
              sheetBottomPadding(insets, spacing.md),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenMemberPicker}
          style={styles.memberChip}
        >
          <Ionicons name="person-outline" size={18} color={MUTED} />
          <AppText variant="labelSm" color={INK} style={styles.flex}>
            {vm.t('uploadDocAddingTo').replace('{name}', vm.memberLabel)}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={MUTED} />
        </Pressable>

        <View style={styles.sourceRow}>
          <SourceTile
            icon="camera-outline"
            label={vm.t('uploadDocTakePhoto')}
            onPress={vm.onTakePhoto}
          />
          <SourceTile
            icon="image-outline"
            label={vm.t('uploadDocGallery')}
            onPress={vm.onPickGallery}
          />
          <SourceTile
            icon="cloud-upload-outline"
            label={vm.t('uploadDocUploadFile')}
            onPress={vm.onPickFile}
          />
        </View>
        <AppText variant="labelSm" color={MUTED} style={styles.limits}>
          {vm.t('uploadDocLimits')}
        </AppText>

        {vm.files.length > 0 ? (
          <View style={styles.fileList}>
            {vm.files.map((file) => (
              <View key={file.id} style={styles.fileCard}>
                <View style={styles.fileThumb}>
                  {file.kind === 'pdf' ? (
                    <Ionicons name="document-text-outline" size={22} color={MUTED} />
                  ) : (
                    <Ionicons name="image-outline" size={22} color={MUTED} />
                  )}
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyMd" color={INK} numberOfLines={1}>
                    {file.name}
                  </AppText>
                  {file.status === 'uploading' ? (
                    <AppText variant="labelSm" color={MUTED}>
                      {file.sizeLabel} · {vm.t('uploadDocUploading')}
                    </AppText>
                  ) : (
                    <>
                      <AppText variant="labelSm" color={MUTED}>
                        {file.sizeLabel}
                      </AppText>
                      <View style={styles.savedPill}>
                        <Ionicons name="checkmark-circle" size={14} color={SUCCESS} />
                        <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
                          {vm.t('uploadDocScanned')}
                        </AppText>
                      </View>
                    </>
                  )}
                </View>
                {file.status === 'uploading' ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => vm.onCancelUpload(file.id)}
                    style={styles.progressWrap}
                  >
                    <View
                      style={[
                        styles.progressRing,
                        {
                          borderTopColor: ACTION,
                          borderRightColor:
                            (file.progress ?? 0) > 0.35 ? ACTION : HAIRLINE,
                          borderBottomColor:
                            (file.progress ?? 0) > 0.65 ? ACTION : HAIRLINE,
                          borderLeftColor:
                            (file.progress ?? 0) > 0.85 ? ACTION : HAIRLINE,
                        },
                      ]}
                    />
                    <Ionicons name="close" size={14} color={INK} />
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => vm.onOpenFileMenu(file.id)}
                    style={styles.iconHit}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color={MUTED} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.divider} />

        <AppText variant="headlineMd" color={INK}>
          {vm.t('uploadDocDetails')}
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onOpenDocTypePicker}
          style={styles.field}
        >
          <AppText
            variant="bodyLg"
            color={vm.docTypeLabel ? INK : PLACEHOLDER}
            style={styles.flex}
          >
            {vm.docTypeLabel || vm.t('uploadDocTypeLabel')}
          </AppText>
          <Ionicons name="chevron-down" size={20} color={MUTED} />
        </Pressable>

        <View style={styles.field}>
          <TextInput
            value={vm.docDate}
            onChangeText={vm.onChangeDocDate}
            placeholder={vm.t('uploadDocDatePlaceholder')}
            placeholderTextColor={PLACEHOLDER}
            style={[
              styles.fieldInput,
              { fontFamily: fontFamilyFor('400', vm.language, 'sans') },
            ]}
          />
          <Ionicons name="calendar-outline" size={20} color={MUTED} />
        </View>

        <View style={[styles.field, styles.notesField]}>
          <TextInput
            value={vm.notes}
            onChangeText={vm.onChangeNotes}
            placeholder={vm.t('uploadDocNotes')}
            placeholderTextColor={PLACEHOLDER}
            multiline
            textAlignVertical="top"
            style={[
              styles.notesInput,
              { fontFamily: fontFamilyFor('400', vm.language, 'sans') },
            ]}
          />
        </View>

        <View style={styles.visibilityCard}>
          <View style={styles.visibilityHead}>
            <Ionicons name="eye-outline" size={20} color={ACTION} />
            <AppText variant="titleMd" color={INK}>
              {vm.t('uploadDocWhoCanSee')}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: vm.visibility === 'doctors' }}
            onPress={() => vm.onSelectVisibility('doctors')}
            style={styles.radioRow}
          >
            <Radio selected={vm.visibility === 'doctors'} />
            <View style={styles.flex}>
              <AppText variant="bodyLg" color={INK}>
                {vm.t('uploadDocShareDoctors')}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.t('uploadDocShareDoctorsHint')}
              </AppText>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: vm.visibility === 'private' }}
            onPress={() => vm.onSelectVisibility('private')}
            style={styles.radioRow}
          >
            <Radio selected={vm.visibility === 'private'} />
            <AppText variant="bodyLg" color={INK} style={styles.flex}>
              {vm.t('uploadDocSharePrivate')}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={MUTED} />
          <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
            {vm.t('uploadDocSecureNote')}
          </AppText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppButton
          label={vm.t('cancel')}
          variant="secondary"
          onPress={vm.onCancel}
          style={styles.footerCancel}
        />
        <AppButton
          label={saveLabel}
          onPress={vm.onSave}
          disabled={!vm.canSave}
          style={styles.footerSave}
        />
      </View>

      <WhoForMemberSheet
        visible={vm.memberPickerOpen}
        members={vm.members}
        selectedMemberId={vm.memberId}
        t={vm.t}
        onClose={vm.onCloseMemberPicker}
        onSelectMember={(id) => vm.onSelectMember(id)}
        onAddMember={vm.onAddMember}
      />

      <PickerSheet
        open={vm.docTypePickerOpen}
        title={vm.t('uploadDocTypeLabel')}
        onClose={vm.onCloseDocTypePicker}
        options={UPLOAD_DOC_TYPES.map((id) => ({
          id,
          label: vm.t(DOC_TYPE_KEYS[id]),
        }))}
        selectedId={vm.docType ?? undefined}
        onSelect={(id) =>
          vm.onSelectDocType(id as (typeof UPLOAD_DOC_TYPES)[number])
        }
      />
    </View>
  );
}

function SourceTile({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.sourceTile}>
      <Ionicons name={icon} size={28} color={ACTION} />
      <AppText variant="labelSm" color={INK} style={styles.center}>
        {label}
      </AppText>
    </Pressable>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

function PickerSheet({
  open,
  title,
  options,
  selectedId,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: { id: string; label: string }[];
  selectedId?: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaModal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetScrim} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <AppText variant="titleMd" color={INK} style={styles.sheetTitle}>
            {title}
          </AppText>
          {options.map((option) => {
            const selected = option.id === selectedId;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                onPress={() => onSelect(option.id)}
                style={styles.sheetRow}
              >
                <AppText
                  variant="bodyLg"
                  color={INK}
                  weightOverride={selected ? '600' : undefined}
                  style={styles.flex}
                >
                  {option.label}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={20} color={ACTION} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaModal>
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
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpHit: {
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  memberChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sourceTile: {
    flex: 1,
    minHeight: 100,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  limits: {
    textAlign: 'center',
  },
  fileList: {
    gap: spacing.sm,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  fileThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  progressWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: HAIRLINE,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HAIRLINE,
    marginVertical: spacing.xs,
  },
  field: {
    minHeight: layout.buttonHeight + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: INK,
    paddingVertical: spacing.md,
  },
  notesField: {
    minHeight: 96,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  notesInput: {
    flex: 1,
    width: '100%',
    minHeight: 80,
    fontSize: 16,
    color: INK,
  },
  visibilityCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  visibilityHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterOn: {
    borderColor: SUCCESS,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: SUCCESS,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  footerCancel: {
    flex: 1,
  },
  footerSave: {
    flex: 2,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 31, 31, 0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    marginBottom: spacing.sm,
  },
  sheetRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
});
