import { Worker } from "worker_threads";
import * as path from "path";

export function createWorker<T>(aliasModule: string, data: T): Worker {
  return new Worker(path.join(__dirname, "worker.js"), {
    workerData: {
      ...data,
      aliasModule: path.resolve(__dirname, aliasModule),
    },
  });
}
