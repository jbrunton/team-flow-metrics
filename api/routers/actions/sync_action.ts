import { Connection, createConnection, getRepository, IsNull } from "typeorm";
import { JiraClient } from "../../datasources/jira/jira_client";
import { Field } from "../../models/entities/field";
import { Issue } from "../../models/entities/issue";
import { HierarchyLevel } from "../../models/entities/hierarchy_level";
import { IssueCollection } from "../../models/scope/issue_collection";
import { Status } from "../../models/entities/status";
import config from "../../config";
import { IssueAttributesBuilder } from "../../datasources/jira/issue_attributes_builder";
import { WorkerJob } from "../../models/entities/worker_job";
import { DateTime } from "luxon";
import { parentPort } from "worker_threads";

async function acquireJob(connection: Connection): Promise<WorkerJob> {
  return connection.transaction(async (entityManager) => {
    const workerJobsRepo = entityManager.getRepository(WorkerJob);

    async function checkAndCreateJob(job: WorkerJob) {
      if (job) {
        throw new Error("Sync job already in progress");
      }
      job = workerJobsRepo.create({
        job_key: "sync_issues",
        started: DateTime.local(),
      });
      await workerJobsRepo.save(job);
      return job;
    }

    const job = await workerJobsRepo
      .createQueryBuilder("worker_jobs")
      .setLock("pessimistic_write")
      .where({
        job_key: "sync_issues",
        completed: IsNull(),
      })
      .getOne()
      .then(checkAndCreateJob);

    return job;
  });
}

async function syncIssues(): Promise<void> {
  const client = new JiraClient();
  const issuesRepo = getRepository(Issue);
  const fieldsRepo = getRepository(Field);
  const statusesRepo = getRepository(Status);
  const hierarchyLevelsRepo = getRepository(HierarchyLevel);

  await issuesRepo.clear();
  await fieldsRepo.clear();
  await statusesRepo.query("DELETE FROM statuses");
  await hierarchyLevelsRepo.query("DELETE FROM hierarchy_levels");

  parentPort.postMessage({
    event: "sync-info",
    inProgress: true,
    message: "Syncing Jira data...",
  });
  const hierarchyLevels = [
    { name: "Story", issueType: "*" },
    { name: "Epic", issueType: "Epic" },
  ].map((level) => hierarchyLevelsRepo.create(level));
  await hierarchyLevelsRepo.save(hierarchyLevels);

  const fields = await client.getFields();
  config.sync?.fields?.beforeSave(fields, fieldsRepo);
  await fieldsRepo.save(fields);

  const statuses = await client.getStatuses();
  config.sync?.statuses?.beforeSave(statuses, statusesRepo);
  await statusesRepo.save(statuses);

  const builder = new IssueAttributesBuilder(fields, statuses, hierarchyLevels);

  const issues = await client.search(
    config.jira.query,
    builder,
    ({ progress }) => {
      parentPort.postMessage({
        event: "sync-info",
        inProgress: true,
        progress: Math.round(progress * 100),
        message: `Syncing issues...`,
      });
    }
  );
  const issueCollection = new IssueCollection(issues);
  config.sync?.issues?.beforeSave(issueCollection, issuesRepo);
  await issuesRepo.save(issues);

  parentPort.postMessage({
    event: "sync-info",
    inProgress: true,
    progress: 100,
    message: "Building parent/child relationships...",
  });

  for (const epicKey of issueCollection.getEpicKeys()) {
    const parent = issueCollection.getIssue(epicKey);
    const children = issueCollection.getChildrenFor(epicKey);
    if (parent) {
      parent.childCount = children.length;
      for (const child of children) {
        child.epicId = parent.id;
      }
      parent.percentDone = Math.round(
        (children.filter((child) => child.completed).length / children.length) *
          100
      );
    } else {
      const childKeys = children.map((issue) => issue.key);
      console.warn(
        `Could not find parent ${epicKey} for issues [${childKeys.join(", ")}]`
      );
    }
  }
  await issuesRepo.save(issues);
  parentPort.postMessage({
    event: "sync-info",
    inProgress: false,
    progress: 100,
    message: "Sync complete",
  });
}

export async function runSyncAction(): Promise<void> {
  const connection = await createConnection();
  const workerJobsRepo = getRepository(WorkerJob);
  const job = await acquireJob(connection);
  try {
    await syncIssues();
  } finally {
    job.completed = DateTime.local();
    await workerJobsRepo.save(job);
  }
}
