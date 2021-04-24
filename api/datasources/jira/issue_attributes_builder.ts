import { DateTime } from "luxon";
import { URL } from "url";
import { Field } from "../../models/entities/field";
import { Issue, Transition } from "../../models/types";
import { HierarchyLevel } from "../../models/entities/hierarchy_level";
import { Status } from "../../models/entities/status";
import { compareDateTimes, getCycleTime } from "../../helpers/date_helper";
import { JiraIssue, JiraStatusChange } from "./types";

export class IssueAttributesBuilder {
  private epicLinkFieldId: string;
  private hierarchyLevels: { [issueType: string]: HierarchyLevel } = {};
  private statusCategories: { [externalId: string]: string } = {};

  constructor(
    fields: Array<Field>,
    statuses: Array<Status>,
    hierarchyLevels: Array<HierarchyLevel>
  ) {
    for (const field of fields) {
      if (field.name === "Epic Link") {
        this.epicLinkFieldId = field.externalId;
      }
    }
    for (const status of statuses) {
      this.statusCategories[status.externalId] = status.category;
    }
    console.log({ statusCategories: this.statusCategories });
    for (const level of hierarchyLevels) {
      this.hierarchyLevels[level.issueType] = level;
    }
  }

  build(json: JiraIssue): Issue {
    const transitions = this.getTransitions(json);
    const lastTransition = transitions
      .map((transition) => transition.date)
      .slice(-1)[0];
    const startedDate = getStartedDate(transitions);
    const completedDate = getCompletedDate(transitions);
    const cycleTime = getCycleTime(startedDate, completedDate);
    const issueType = json.fields.issuetype.name;
    const hierarchyLevel =
      this.hierarchyLevels[issueType] || this.hierarchyLevels["*"];
    if (!hierarchyLevel) {
      console.warn(
        `Could not find hierarchy level for ${json["key"]} (${issueType})`
      );
    }
    const resolution = getResolution(json);
    return {
      key: json.key,
      title: json.fields.summary,
      issueType: issueType,
      status: json.fields.status.name,
      statusCategory: json.fields.status.statusCategory.name,
      resolution: resolution,
      created: DateTime.fromISO(json.fields.created),
      hierarchyLevel: hierarchyLevel.name,
      epicKey: json["fields"][this.epicLinkFieldId] as string,
      externalUrl: new URL(`browse/${json.key}`, process.env.JIRA_HOST).href,
      transitions: transitions,
      started: startedDate,
      completed: completedDate,
      lastTransition: lastTransition,
      cycleTime: cycleTime,
    };
  }

  private getTransitions(json: JiraIssue): Array<Transition> {
    // TODO: What if changelog.total > changelog.maxResults? Are all entries always returned?
    return json.changelog.histories
      .map((event) => {
        const statusChange = event.items.find((item) => item.field == "status");
        if (!statusChange) {
          return null;
        }
        const fromStatus = {
          name: statusChange.fromString,
          category: this.statusCategories[statusChange.from],
        };
        const toStatus = {
          name: statusChange.toString,
          category: this.statusCategories[statusChange.to],
        };
        if (!fromStatus.category) {
          console.warn(
            `Could not find status with id ${statusChange.from} (${statusChange.fromString})`
          );
        }
        if (!toStatus.category) {
          console.warn(
            `Could not find status with id ${statusChange.to} (${statusChange.toString})`
          );
        }
        return {
          date: DateTime.fromISO(event.created),
          fromStatus,
          toStatus,
        };
      })
      .filter((transition) => transition)
      .sort((t1, t2) => compareDateTimes(t1.date, t2.date));
  }
}

function getStartedDate(transitions: Array<Transition>): DateTime {
  const startedTransition = transitions.find(
    (transition) => transition.toStatus.category === "In Progress"
  );

  if (!startedTransition) {
    return null;
  }

  return startedTransition.date;
}

function getCompletedDate(transitions: Array<Transition>): DateTime {
  if (!transitions.length) {
    return null;
  }

  let lastTransition = null;
  for (let i = transitions.length - 1; i >= 0; --i) {
    if (transitions[i].toStatus.category !== "Done") {
      break;
    }
    lastTransition = transitions[i];
  }

  if (!lastTransition) {
    return null;
  }

  return lastTransition.date;
}

function getResolution(json: JiraIssue): string {
  const resolution = json["fields"]["resolution"];
  if (!resolution) {
    return null;
  }
  return resolution["name"];
}
