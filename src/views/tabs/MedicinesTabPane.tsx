import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { MedicinesTabSkeleton } from '../../components/skeleton/TabSkeletons';
import { tabPanePropsEqual } from '../../components/tabs/MemoTabPane';
import type { OrderMedicinesLaunch } from '../../utilities/medicineOrderStage';
import { MedicinesView } from '../MedicinesView';

type MedicinesTabPaneProps = {
  active: boolean;
  ready: boolean;
  onBookFollowUp?: () => void;
  onSeePrescriptions?: () => void;
  onTrackOrder?: (orderId?: string) => void;
  onOrderRx?: (launch: OrderMedicinesLaunch) => void;
  onPayOrder?: (orderId: number) => void;
  onStartRefillOrder?: (launch: OrderMedicinesLaunch) => void;
  onOpenPastOrder?: (id: string) => void;
  onOpenNotifications?: () => void;
  notificationCount: number;
  forceHasOrders?: boolean;
};

export const MedicinesTabPane = memo(function MedicinesTabPane({
  active,
  ready,
  onBookFollowUp,
  onSeePrescriptions,
  onTrackOrder,
  onOrderRx,
  onPayOrder,
  onStartRefillOrder,
  onOpenPastOrder,
  onOpenNotifications,
  notificationCount,
  forceHasOrders,
}: MedicinesTabPaneProps) {
  return (
    <View
      style={[styles.pane, active ? null : styles.hidden]}
      pointerEvents={active ? 'auto' : 'none'}
      collapsable={false}
    >
      {ready ? (
        <MedicinesView
          active={active}
          onBookFollowUp={onBookFollowUp}
          onSeePrescriptions={onSeePrescriptions}
          onTrackOrder={onTrackOrder}
          onOrderRx={onOrderRx}
          onPayOrder={onPayOrder}
          onStartRefillOrder={onStartRefillOrder}
          onOpenPastOrder={onOpenPastOrder}
          onOpenNotifications={onOpenNotifications}
          notificationCount={notificationCount}
          forceHasOrders={forceHasOrders}
        />
      ) : (
        <MedicinesTabSkeleton />
      )}
    </View>
  );
}, tabPanePropsEqual);

const styles = StyleSheet.create({
  pane: { flex: 1 },
  hidden: { display: 'none' },
});
