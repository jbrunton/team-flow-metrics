import { getRepository } from "typeorm";
import { JiraClient } from "../../datasources/jira/jira_client";
import { Field } from "../../models/entities/field";
import { Issue } from "../../models/entities/issue";
import { HierarchyLevel } from "../../models/entities/hierarchy_level";
import { IssueCollection } from "../../models/scope/issue_collection";

const moment = require('moment');

export async function syncIssues(): Promise<Array<Issue>> {
  const client = new JiraClient();
  const issuesRepo = getRepository(Issue);
  const fieldsRepo = getRepository(Field);
  const hierarchyLevelsRepo = getRepository(HierarchyLevel);

  await issuesRepo.clear();
  await fieldsRepo.clear();
  await hierarchyLevelsRepo.query('DELETE FROM hierarchy_levels');

  console.log("Syncing Jira data...");
  const hierarchyLevels = [
    { name: "Story", issueType: "*" },
    { name: "Epic", issueType: "Epic" }
  ].map(level => hierarchyLevelsRepo.create(level));
  await hierarchyLevelsRepo.save(hierarchyLevels);

  const fields = await client.getFields();
  await fieldsRepo.save(fields);

  console.log("hierarchyLevels:", hierarchyLevels);
  const issues = await client.search(fields, hierarchyLevels, 'project=LIST');
  await issuesRepo.save(issues);

  console.log("Building parent/child relationships...");
  const issueCollection = new IssueCollection(issues);
  for (let parentKey of issueCollection.getParentKeys()) {
    const parent = issueCollection.getIssue(parentKey);
    const children = issueCollection.getChildrenFor(parentKey);
    if (parent) {
      parent.childCount = children.length;
      for (let child of children) {
        child.parentId = parent.id;
      }
    } else {
      const childKeys = children.map(issue => issue.key)
      console.warn(`Could not find parent ${parentKey} for issues [${childKeys.join(", ")}]`);
    }
  }
  await issuesRepo.save(issues);

  const statusCategoryOverrides = {};
  (process.env.STATUS_CATEGORY_OVERRIDES || "")
    .split(",")
    .forEach(override => {
      const [key, statusCategory] = override.split("=");
      statusCategoryOverrides[key] = statusCategory;
      console.log(`statusCategory override: ${key} = ${statusCategory}`);
      issueCollection.getIssue(key).statusCategory = statusCategory;
    });

  await issuesRepo.save(issues);

  if (process.env.EPIC_CYCLE_TIME_STRATEGY === "STORIES") {
    console.log("EPIC_CYCLE_TIME_STRATEGY = STORIES, computing epic cycle times...");
    for (let parent of issueCollection.getParents()) {
      const children = issueCollection.getChildrenFor(parent.key);
      const started = children
        .map(child => child.started)
        .filter(date => date)
        .sort((d1, d2) => moment(d1).diff(moment(d2)))[0];
      if (started) {
        parent.started = started;
      } else {
        parent.started = null;
      }

      if (parent.statusCategory === "Done") {
        const completed = children
          .map(child => child.completed)
          .filter(date => date)
          .sort((d1, d2) => moment(d2).diff(moment(d1)))[0];
        if (completed) {
          parent.completed = completed;
        } else {
          parent.completed = null;
        }
      }

      const cycleTime = parent.started && parent.completed ? moment(parent.completed).diff(moment(parent.started), 'hours') / 24 : null;
      parent.cycleTime = cycleTime;
    }
    await issuesRepo.save(issues);
  }

  return issues;
}