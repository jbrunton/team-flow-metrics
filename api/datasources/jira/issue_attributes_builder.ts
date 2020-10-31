import { Moment } from "moment";

const moment = require('moment');

type StatusChange = {
  date: Moment,
  status: string
}

export class IssueAttributesBuilder {
  build(json: JSON): {
    key: string,
    title: string,
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
      started: startedDate ? startedDate.toDate() : null,
      completed: completedDate ? completedDate.toDate() : null,
      cycleTime: cycleTime
    };
  }
}

function getStatusChanges(json): Array<StatusChange> {
  return json.changelog.histories
    .map(event => {
      const statusChanges = event.items.filter(item => item.field == "status");
      if (!statusChanges.length) {
        return [];
      }
      return {
        date: moment(event.created),
        status: statusChanges[0].toString
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
