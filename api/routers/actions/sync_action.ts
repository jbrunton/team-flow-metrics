import { getRepository } from "typeorm";
import { JiraClient } from "../../datasources/jira/jira_client";
import { Field } from "../../models/entities/field";
import { Issue } from "../../models/entities/issue";
import { IssueCollection } from "../../models/scope/issue_collection";

const moment = require('moment');

export async function syncIssues(): Promise<Array<Issue>> {
  const client = new JiraClient();
  const issuesRepo = getRepository(Issue);
  const fieldsRepo = getRepository(Field);

  console.log("Syncing Jira data...");
  const fields = await client.getFields();
  const issues = await client.search(fields, 'project=LIST');

  await issuesRepo.clear();
  await fieldsRepo.clear();

  await fieldsRepo.save(fields);
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
      if (parent.completed) {
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
    }
    await issuesRepo.save(issues);
  }

  return issues;
}
