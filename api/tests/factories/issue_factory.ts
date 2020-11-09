import { Factory } from "rosie";
import { Issue } from "../../models/entities/issue";

export const IssueFactory = Factory.define("Issue", Issue)
  .sequence("key", (k) => `ISSUE-${k}`)
  .attr("title", ["key"], (key) => `Example Issue ${key}`)
  .attr("issueType", "Story")
  .attr("status", "Backlog")
  .attr("statusCategory", "To Do")
  .attr("hierarchyLevel", "Story")
  .attr("externalUrl", ["key"], (key) => `https://jira.example.com/browse/${key}`)
  .attrs({
    parentKey: null,
    parentId: null,
    childCount: null,
    started: null,
    completed: null,
    cycleTime: null,
    transitions: []
  });
