import { glob } from "glob";
import * as path from "path";
import express from "express";
import * as bodyParser from "body-parser";
import { createConnection, getRepository, IsNull } from "typeorm";
import "reflect-metadata";
import { PostgresConnectionCredentialsOptions } from "typeorm/driver/postgres/PostgresConnectionCredentialsOptions";
import { RouterDefinition } from "./routers/router_definition";
import { WorkerJob } from "./models/entities/worker_job";
import { DateTime } from "luxon";

export async function createApp(): Promise<express.Application> {
  const app = express();
  app.use(bodyParser.json());

  console.log("Configuring routers...");
  glob.sync("./routers/*_router.{js,ts}").forEach(function (file) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { routerPath, router, environments } = require(path.resolve(
      file
    )) as RouterDefinition;
    const applyRouter =
      !environments || environments.includes(process.env.NODE_ENV);
    if (applyRouter) {
      console.log(`  Registering router ${file} at ${routerPath}`);
      app.use(routerPath, router);
    } else {
      console.log(
        `  Skipping router ${file} for environment ${process.env.NODE_ENV}`
      );
    }
  });

  console.log("Creating connection...");
  const connection = await createConnection();
  const options = connection.options as PostgresConnectionCredentialsOptions;
  console.log(
    `Connected to ${options.host}:${options.port}/${options.database}`
  );

  // In case any sync jobs stall, consider them completed on a restart
  const stalledJobs = await getRepository(WorkerJob).find({
    completed: IsNull(),
  });
  stalledJobs.forEach((job) => {
    console.log(
      `Found stalled job: ${job.job_key} (started: ${job.started.toISO()})`
    );
    job.completed = DateTime.local();
  });
  await getRepository(WorkerJob).save(stalledJobs);

  return app;
}
