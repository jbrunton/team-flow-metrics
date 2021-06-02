import * as express from "express";
import { RouterDefinition } from "./router_definition";
import { bus, Event } from "../bus";
import { acquireJob } from "../models/entities/worker_job";
import { createWorker } from "./workers";
import { SyncWorkerData } from "./workers/sync_worker";

const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const job = await acquireJob("sync");
    bus.emit(
      Event.BROADCAST,
      JSON.stringify({
        event: "sync-info",
        inProgress: true,
        message: "Syncing with Jira...",
      })
    );
    const worker = createWorker<SyncWorkerData>("sync_worker.ts", {
      jobId: job.id,
    });
    worker.on("message", (message) => {
      bus.emit(Event.BROADCAST, JSON.stringify(message));
    });
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    const json = {
      error: e.message as string,
      data: null,
    };
    if (e.response) {
      json.data = e.response.data as unknown;
    }
    res.status(500).json(json);
  }
});

module.exports = {
  routerPath: "/sync",
  router: router,
} as RouterDefinition;
