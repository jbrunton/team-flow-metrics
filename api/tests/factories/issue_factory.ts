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
  .attr("created", () => new Date())
  .attrs({
    resolution: null,
    parentKey: null,
    epicId: null,
    childCount: null,
    percentDone: null,
    started: null,
    completed: null,
    lastTransition: null,
    cycleTime: null,
    transitions: []
  });
