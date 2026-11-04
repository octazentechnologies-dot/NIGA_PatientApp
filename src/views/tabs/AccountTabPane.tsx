import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccountTabSkeleton } from '../../components/skeleton/TabSkeletons';
import { tabPanePropsEqual } from '../../components/tabs/MemoTabPane';
import type { AccountViewModel } from '../../controllers/useAccountController';
import { AccountView } from '../AccountView';

type AccountTabPaneProps = {
  active: boolean;
  ready: boolean;
  account: AccountViewModel;
};

export const AccountTabPane = memo(function AccountTabPane({
  active,
  ready,
  account,
}: AccountTabPaneProps) {
  return (
    <View
      style={[styles.pane, active ? null : styles.hidden]}
      pointerEvents={active ? 'auto' : 'none'}
      collapsable={false}
    >
      {ready ? <AccountView {...account} /> : <AccountTabSkeleton />}
    </View>
  );
}, tabPanePropsEqual);

const styles = StyleSheet.create({
  pane: { flex: 1 },
  hidden: { display: 'none' },
});
