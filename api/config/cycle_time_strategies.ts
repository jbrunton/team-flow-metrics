import { identity } from "lodash";
import { getCycleTime } from "../helpers/date_helper";
import { Issue } from "../models/entities/issue";
import { IssueCollection } from "../models/scope/issue_collection";

export function applyStoryCycleTimeStrategy(opts: {
  issueCollection: IssueCollection;
  filter?: (child: Issue) => boolean;
  beforeUpdateCycleTime?: (parent: Issue) => void;
}): void {
  console.log("Applying storyCycleTimeStrategy, computing epic cycle times...");

  const {
    issueCollection,
    filter = identity,
    beforeUpdateCycleTime = identity,
  } = opts;

  for (const parent of issueCollection.getParents()) {
    const children = issueCollection.getChildrenFor(parent.key).filter(filter);

    const started = new IssueCollection(children).getSortedDates("started")[0];
    parent.started = started || null;

    const lastTransition = new IssueCollection(children).getSortedDates(
      "lastTransition"
    )[0];
    parent.lastTransition = lastTransition || null;

    beforeUpdateCycleTime(parent);

    if (parent.statusCategory === "Done") {
      const completed = new IssueCollection(children)
        .getSortedDates("completed")
        .slice(-1)[0];
      parent.completed = completed || null;
    }

    const cycleTime = getCycleTime(parent.started, parent.completed);
    console.log(`Updating ${parent.key}.cycleTime = ${cycleTime}`);
    parent.cycleTime = cycleTime;
  }
}
