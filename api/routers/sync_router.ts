import * as express from "express";
import { Worker } from "worker_threads";
import { RouterDefinition } from "./router_definition";
import * as path from "path";

const router = express.Router();

router.get("/", (_, res) => {
  try {
    new Worker(path.join(__dirname, "workers/worker.js"), {
      workerData: {
        aliasModule: path.resolve(__dirname, "workers/sync_worker.ts"),
      },
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
