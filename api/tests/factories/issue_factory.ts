import { DateTime } from "luxon";
import { Factory } from "rosie";
import { Issue } from "../../models/entities/issue";

export const IssueFactory = Factory.define<Issue>("Issue", Issue)
  .sequence("key", (k) => `ISSUE-${k}`)
  .attr("title", ["key"], (key) => `Example Issue ${key}`)
  .attr("issueType", "Story")
  .attr("status", "Backlog")
  .attr("statusCategory", "To Do")
  .attr("hierarchyLevel", "Story")
  .attr(
    "externalUrl",
    ["key"],
    (key) => `https://jira.example.com/browse/${key}`
  )
  .attr("created", () => DateTime.local())
  .attrs({
    resolution: null,
    epicKey: null,
    epicId: null,
    childCount: null,
    percentDone: null,
    started: null,
    completed: null,
    lastTransition: null,
    cycleTime: null,
    transitions: [],
  });
