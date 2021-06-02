import { workerData } from "worker_threads";
import { runSyncAction } from "../actions/sync_action";

export type SyncWorkerData = {
  jobId: number;
};

runSyncAction((workerData as SyncWorkerData).jobId).catch((e) => {
  console.error(e);
});
