import { Moment } from "moment";
import { URL } from "url";
import { Field } from "../../models/entities/field";
import { Transition } from "../../models/entities/issue";
import { HierarchyLevel } from "../../models/entities/hierarchy_level";
import { Status } from "../../models/entities/status";

const moment = require('moment');

export class IssueAttributesBuilder {
  private epicLinkFieldId: string;
  private hierarchyLevels: { [issueType: string]: HierarchyLevel } = {};
  private statusCategories: { [externalId: string]: string } = {};

  constructor(fields: Array<Field>, statuses: Array<Status>, hierarchyLevels: Array<HierarchyLevel>) {
    for (let field of fields) {
      if (field.name === "Epic Link") {
        this.epicLinkFieldId = field.externalId;
      }
    }
    for (let status of statuses) {
      this.statusCategories[status.externalId] = status.category;
    }
    for (let level of hierarchyLevels) {
      this.hierarchyLevels[level.issueType] = level;
    }
  }

  build(json: JSON): {
    key: string,
    title: string,
    issueType: string,
    parentKey: string,
    status: string,
    statusCategory: string,
    resolution: string,
    created: Date,
    hierarchyLevel: string,
    externalUrl: string,
    transitions: Array<Transition>,
    started: Date,
    completed: Date,
    cycleTime: number
  } {
    const transitions = this.getTransitions(json);
    const startedDate = getStartedDate(transitions);
    const completedDate = getCompletedDate(transitions);
    const cycleTime = startedDate && completedDate ? completedDate.diff(startedDate, 'hours') / 24 : null;
    const issueType = json["fields"]["issuetype"]["name"];
    const hierarchyLevel = this.hierarchyLevels[issueType] || this.hierarchyLevels["*"];
    if (!hierarchyLevel) {
      console.warn(`Could not find hierarchy level for ${json["key"]} (${issueType})`);
    }
    const resolution = getResolution(json);
    return {
      key: json["key"],
      title: json["fields"]["summary"],
      issueType: issueType,
      status: json["fields"]["status"]["name"],
      statusCategory: json["fields"]["status"]["statusCategory"]["name"],
      resolution: resolution,
      created: moment(json["fields"]["created"]).toDate(),
      hierarchyLevel: hierarchyLevel.name,
      parentKey: json["fields"][this.epicLinkFieldId],
      externalUrl: new URL(`browse/${json["key"]}`, process.env.JIRA_HOST).href,
      transitions: serializeTransitions(transitions),
      started: startedDate ? startedDate.toDate() : null,
      completed: completedDate ? completedDate.toDate() : null,
      cycleTime: cycleTime
    };
  }

  private getTransitions(json): Array<Transition> {
    // TODO: What if changelog.total > changelog.maxResults? Are all entries always returned?
    return json.changelog.histories
      .map(event => {
        const statusChange = event.items.find(item => item.field == "status");
        if (!statusChange) {
          return null;
        }
        const fromStatus = {
          name: statusChange.fromString,
          category: this.statusCategories[statusChange.from]
        };
        const toStatus = {
          name: statusChange.toString,
          category: this.statusCategories[statusChange.to]
        };
        return {
          date: event.created,
          fromStatus,
          toStatus
        };
      })
      .filter(transition => transition)
      .sort((t1, t2) => moment(t1.date).diff(moment(t2.date)));
  }
}

function serializeTransitions(transitions: Array<Transition>): Array<Transition> {
  return transitions.map(transition => {
    const json = {
      date: moment(transition.date).toISOString(),
      fromStatus: transition.fromStatus,
      toStatus: transition.toStatus
    };
    return json;
  })
}

function getStartedDate(transitions: Array<Transition>): Moment {
  const startedTransition = transitions.find(transition => transition.toStatus.category === "In Progress");
  
  if (!startedTransition) {
    return null;
  }

  return moment(startedTransition.date);
}

function getCompletedDate(transitions: Array<Transition>): Moment {
  if (!transitions.length) {
    return null;
  }

  const lastTransition = transitions[transitions.length - 1];
  if (lastTransition.toStatus.category != "Done") {
    return null;
  }

  return moment(lastTransition.date);
}

function getResolution(json: JSON): string {
  const resolution = json["fields"]["resolution"];
  if (!resolution) {
    return null;
  }
  return resolution["name"];
}