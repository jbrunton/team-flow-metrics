import { Issue } from "../entities/issue";
const moment = require("moment");

export type CfdRow = {
  date: Date;
  total: number;
  toDo: number;
  inProgress: number;
  done: number;
};

type CfdTransition = {
  date: Date;
  fromStatusCategory?: string;
  toStatusCategory: string;
}

export class CfdBuilder {
  private issues: Array<Issue> = [];

  addIssues(issues: Issue[]) {
    this.issues = this.issues.concat(issues);
  }

  build(): CfdRow[] {
    return [];
  }

  transitions(): CfdTransition[] {
    return this.issues
      .map(issue => {
        const transitions: CfdTransition[] = [{ date: issue.created, toStatusCategory: "To Do"}];
        if (issue.started) {
          transitions.push({
            date: issue.started,
            fromStatusCategory: "To Do",
            toStatusCategory: "In Progress"
          })
        }
        if (issue.completed) {
          transitions.push({
            date: issue.completed,
            fromStatusCategory: issue.started ? "In Progress" : "To Do",
            toStatusCategory: "Done"
          })
        }
        return transitions;
      })
      .flat()
      .sort((t1, t2) => moment(t1.date).diff(moment(t2.date)));
  }
}