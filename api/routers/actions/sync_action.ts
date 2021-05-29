import { getRepository } from "typeorm";
import { JiraClient } from "../../datasources/jira/jira_client";
import { Field } from "../../models/entities/field";
import { Issue } from "../../models/entities/issue";
import { HierarchyLevel } from "../../models/entities/hierarchy_level";
import { IssueCollection } from "../../models/scope/issue_collection";
import { Status } from "../../models/entities/status";
import config from "../../config";

export async function syncIssues(): Promise<Array<Issue>> {
  const client = new JiraClient();
  const issuesRepo = getRepository(Issue);
  const fieldsRepo = getRepository(Field);
  const statusesRepo = getRepository(Status);
  const hierarchyLevelsRepo = getRepository(HierarchyLevel);

  await issuesRepo.clear();
  await fieldsRepo.clear();
  await statusesRepo.query("DELETE FROM statuses");
  await hierarchyLevelsRepo.query("DELETE FROM hierarchy_levels");

  console.log("Syncing Jira data...");
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

  const issues = await client.search(
    fields,
    statuses,
    hierarchyLevels,
    config.jira.query
  );
  const issueCollection = new IssueCollection(issues);
  config.sync?.issues?.beforeSave(issueCollection, issuesRepo);
  await issuesRepo.save(issues);

  console.log("Building parent/child relationships...");
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

  return issues;
}
