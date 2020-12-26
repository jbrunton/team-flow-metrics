import { Issue } from "../models/entities/issue";
import { DateTime } from "luxon";
import { compareDateTimes } from "../helpers/date_helper";

export type CfdRow = {
  date: DateTime;
  total: number;
  toDo: number;
  inProgress: number;
  done: number;
};

type CfdTransition = {
  date: DateTime;
  key: string;
  fromStatusCategory?: string;
  toStatusCategory: string;
};

export class CfdBuilder {
  private issues: Array<Issue> = [];

  addIssues(issues: Issue[]) {
    this.issues = this.issues.concat(issues);
  }

  build(chartFromDate?: DateTime, chartToDate?: DateTime): CfdRow[] {
    const transitions = this.transitions();
    if (!transitions.length) {
      return [];
    }
    const firstDate = transitions[0].date;
    const lastDate = transitions[transitions.length - 1].date;
    const fromDate = firstDate.startOf("day").minus({ days: 1 });
    const toDate = lastDate.startOf("day").plus({ days: 1 });
    const firstRow: CfdRow = {
      date: fromDate,
      total: 0,
      toDo: 0,
      inProgress: 0,
      done: 0,
    };
    const rows = transitions.reduce<CfdRow[]>(
      (rows, transition) => {
        let currentRow = rows[rows.length - 1];
        while (!currentRow.date.hasSame(transition.date, "day")) {
          currentRow = {
            date: currentRow.date.plus({ days: 1 }),
            total: currentRow.total,
            toDo: currentRow.toDo,
            inProgress: currentRow.inProgress,
            done: currentRow.done,
          };
          rows.push(currentRow);
        }
        if (transition.fromStatusCategory) {
          switch (transition.fromStatusCategory) {
            case "To Do":
              --currentRow.toDo;
              break;
            case "In Progress":
              --currentRow.inProgress;
              break;
            case "Done":
              --currentRow.done;
              break;
          }
        }
        switch (transition.toStatusCategory) {
          case "To Do":
            ++currentRow.toDo;
            ++currentRow.total;
            break;
          case "In Progress":
            ++currentRow.inProgress;
            break;
          case "Done":
            ++currentRow.done;
            break;
        }
        return rows;
      },
      [firstRow]
    );
    const lastRow = rows[rows.length - 1];
    rows.push({
      date: toDate,
      total: lastRow.total,
      toDo: lastRow.toDo,
      inProgress: lastRow.inProgress,
      done: lastRow.done,
    });
    if (chartFromDate && chartToDate) {
      return rows.filter((row) => {
        return chartFromDate < row.date && row.date < chartToDate;
      });
    }
    return rows;
  }

  transitions(): CfdTransition[] {
    return this.issues
      .map((issue) => {
        const transitions: CfdTransition[] = [
          {
            date: issue.created,
            key: issue.key,
            toStatusCategory: "To Do",
          },
        ];
        if (issue.started) {
          transitions.push({
            date: issue.started,
            key: issue.key,
            fromStatusCategory: "To Do",
            toStatusCategory: "In Progress",
          });
        }
        if (issue.completed) {
          transitions.push({
            date: issue.completed,
            key: issue.key,
            fromStatusCategory: issue.started ? "In Progress" : "To Do",
            toStatusCategory: "Done",
          });
        }
        return transitions;
      })
      .flat()
      .sort((t1, t2) => compareDateTimes(t1.date, t2.date));
  }
}
