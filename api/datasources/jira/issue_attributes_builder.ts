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
  return json.changelog.histories.map(event => {
    const statusChanges = event.items.filter(item => item.field == "status");
    if (!statusChanges.length) {
      return [];
    }
    return {
      date: moment(event.created),
      status: statusChanges[0].toString
    }
  }).filter(event => event);
}

function getStartedDate(statusChanges: Array<StatusChange>): Moment {
  const dates = statusChanges
    .filter(event => event.status === "In Progress")
    .map(event => moment(event.date))
    .sort((h1, h2) => h1.diff(h2));
  return dates[0];
}

function getCompletedDate(statusChanges: Array<StatusChange>): Moment {
  const dates = statusChanges
    .filter(event => event.status == "Done")
    .map(event => moment(event.date))
    .sort((h1, h2) => h2.diff(h1));
  return dates[0];
}
