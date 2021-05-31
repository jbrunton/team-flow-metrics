import { runSyncAction } from "../actions/sync_action";

runSyncAction().catch((e) => {
  console.error(e);
});
