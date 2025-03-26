// project/src/components/settings/ConnectedAccounts.tsx
// @deprecated - Import from '@/components/shared/ConnectedAccounts' instead
import { ConnectedAccounts as SharedConnectedAccounts } from '../shared/ConnectedAccounts';

export function ConnectedAccounts(props: any) {
  return <SharedConnectedAccounts variant="settings" {...props} />;
}
