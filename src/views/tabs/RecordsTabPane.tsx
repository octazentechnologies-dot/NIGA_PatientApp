import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { RecordsTabSkeleton } from '../../components/skeleton/TabSkeletons';
import { tabPanePropsEqual } from '../../components/tabs/MemoTabPane';
import type { OrderMedicinesLaunch } from '../../utilities/medicineOrderStage';
import { HealthRecordsView } from '../HealthRecordsView';

type RecordsTabPaneProps = {
  active: boolean;
  ready: boolean;
  onOpenFollowUpPlan?: () => void;
  onOpenOrderMedicines?: (launch?: OrderMedicinesLaunch) => void;
  onOpenNotifications?: () => void;
  onAddMember?: () => void;
  notificationCount: number;
};

export const RecordsTabPane = memo(function RecordsTabPane({
  active,
  ready,
  onOpenFollowUpPlan,
  onOpenOrderMedicines,
  onOpenNotifications,
  onAddMember,
  notificationCount,
}: RecordsTabPaneProps) {
  return (
    <View
      style={[styles.pane, active ? null : styles.hidden]}
      pointerEvents={active ? 'auto' : 'none'}
      collapsable={false}
    >
      {ready ? (
        <HealthRecordsView
          active={active}
          onOpenFollowUpPlan={onOpenFollowUpPlan}
          onOpenOrderMedicines={onOpenOrderMedicines}
          onOpenNotifications={onOpenNotifications}
          onAddMember={onAddMember}
          notificationCount={notificationCount}
        />
      ) : (
        <RecordsTabSkeleton />
      )}
    </View>
  );
}, tabPanePropsEqual);

const styles = StyleSheet.create({
  pane: { flex: 1 },
  hidden: { display: 'none' },
});
