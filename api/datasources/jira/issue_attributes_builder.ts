import { Moment } from "moment";
import { URL } from "url";
import { Field } from "../../models/entities/field";

const moment = require('moment');

type StatusChange = {
  date: Moment,
  status: string
}

export class IssueAttributesBuilder {
  private epicLinkFieldId: string;

  constructor(fields: Array<Field>) {
    for (let field of fields) {
      if (field.name === "Epic Link") {
        this.epicLinkFieldId = field.externalId;
      }
    }
  }

  build(json: JSON): {
    key: string,
    title: string,
    issueType: string,
    parentKey: string,
    status: string,
    statusCategory: string,
    externalUrl: string,
    started: Date,
    completed: Date,
    cycleTime: number
  } {
    const statusChanges = getStatusChanges(json);
    const startedDate = getStartedDate(statusChanges);
    const completedDate = getCompletedDate(statusChanges);
    const cycleTime = startedDate && completedDate ? completedDate.diff(startedDate, 'hours') / 24 : null;
    return {
      key: json["key"],
      title: json["fields"]["summary"],
      issueType: json["fields"]["issuetype"]["name"],
      status: json["fields"]["status"]["name"],
      statusCategory: json["fields"]["status"]["statusCategory"]["name"],
      parentKey: json["fields"][this.epicLinkFieldId],
      externalUrl: new URL(`browse/${json["key"]}`, process.env.JIRA_HOST).href,
      started: startedDate ? startedDate.toDate() : null,
      completed: completedDate ? completedDate.toDate() : null,
      cycleTime: cycleTime
    };
  }
}

function getStatusChanges(json): Array<StatusChange> {
  // TODO: What if changelog.total > changelog.maxResults? Are all entries always returned?
  return json.changelog.histories
    .map(event => {
      const statusChange = event.items.find(item => item.field == "status");
      if (!statusChange) {
        return null;
      }
      return {
        date: moment(event.created),
        status: statusChange.toString
      }
    })
    .filter(event => event)
    .sort((e1, e2) => e1.date.diff(e2.date));
}

function getStartedDate(statusChanges: Array<StatusChange>): Moment {
  const startedEvent = statusChanges.find(event => event.status === "In Progress");
  
  if (!startedEvent) {
    return null;
  }

  return startedEvent.date;
}

function getCompletedDate(statusChanges: Array<StatusChange>): Moment {
  if (!statusChanges.length) {
    return null;
  }

  const lastEvent = statusChanges[statusChanges.length - 1];
  if (lastEvent.status != "Done") {
    return null;
  }

  return lastEvent.date;
}
