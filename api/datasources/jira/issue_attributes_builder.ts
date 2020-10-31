import { Moment } from "moment";

const moment = require('moment');

type StatusChange = {
  date: Moment,
  status: string
}

export class IssueAttributesBuilder {
  build(json: JSON): { key: string, title: string, started: Date, completed: Date } {
    const statusChanges = getStatusChanges(json);
    const startedDate = getStartedDate(statusChanges);
    const completedDate = getCompletedDate(statusChanges);
    return {
      key: json["key"],
      title: json["fields"]["summary"],
      started: startedDate ? startedDate.toDate() : null,
      completed: completedDate ? completedDate.toDate() : null
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
  const inProgressDates = statusChanges
    .filter(event => event.status === "In Progress")
    .map(event => event.date);
  inProgressDates.sort((h1, h2) => {
    return moment(h1).diff(moment(h2));
  })
  if (inProgressDates.length == 0) {
    return null;
  }
  return moment(inProgressDates[0]);
}

function getCompletedDate(statusChanges: Array<StatusChange>): Moment {
  const completedDates = statusChanges
    .filter(event => event.status == "Done")
    .map(event => event.date)
    .sort((h1, h2) => {
      return moment(h2).diff(moment(h1));
    })
  if (completedDates.length == 0) {
    return null;
  }
  return moment(completedDates[0]);
}
