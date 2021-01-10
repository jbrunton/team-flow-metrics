import { Issue } from "../models/entities/issue";
import { DateTime } from "luxon";
import { flatten, compact, flow, sortBy } from "lodash/fp";
import {
  compareDateTimes,
  dateRange,
  StepInterval,
} from "../helpers/date_helper";

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
  private backlogSize = 0;
  private doneCount = 0;

  setBacklogSize(backlogSize: number) {
    this.backlogSize = backlogSize;
  }

  setDoneCount(doneCount: number) {
    this.doneCount = doneCount;
  }

  addIssues(issues: Issue[]): void {
    this.issues = this.issues.concat(issues);
  }

  build(chartFromDate?: DateTime, chartToDate?: DateTime): CfdRow[] {
    // const transitions = this.transitions();
    // if (!transitions.length) {
    //   return [];
    // }
    // const firstDate = transitions[0].date;
    // const lastDate = transitions[transitions.length - 1].date;
    const dates = flow(
      flatten,
      compact,
      sortBy((date: DateTime) => date.toMillis())
    )(
      this.issues.map((issue) => [
        issue.created,
        issue.started,
        issue.completed,
      ])
    );
    //console.log({ dates: dates.map(date => date.toJSDate()) })
    if (!dates.length) {
      return [];
    }
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const fromDate = chartFromDate || firstDate.startOf("day");
    const toDate = chartToDate || lastDate.startOf("day").plus({ days: 1 });
    // const firstRow: CfdRow = {
    //   date: fromDate,
    //   total: 0,
    //   toDo: 0,
    //   inProgress: 0,
    //   done: 0,
    // };
    const rows = dateRange(fromDate, toDate, StepInterval.Daily).map(
      (date) => ({
        date,
        total: this.backlogSize,
        toDo: this.backlogSize,
        inProgress: 0,
        done: this.doneCount,
      })
    );
    const rowIndex = (date: DateTime) => {
      const index = Math.ceil(date.diff(fromDate, "day").days);
      const result = Math.max(0, Math.min(rows.length, index));
      //console.log("rowIndex", { index, result, "rows.length": rows.length });
      return result;
    };
    this.issues.forEach((issue: Issue) => {
      const createdIndex = rowIndex(issue.created);
      const startedIndex = issue.started
        ? rowIndex(issue.started)
        : rows.length;
      const completedIndex = issue.completed
        ? rowIndex(issue.completed)
        : rows.length;
      for (let i = createdIndex; i < rows.length; ++i) {
        ++rows[i].total;
        if (i < Math.min(startedIndex, completedIndex)) {
          ++rows[i].toDo;
        }
      }
      for (let i = startedIndex; i < completedIndex; ++i) {
        ++rows[i].inProgress;
      }
      for (let i = completedIndex; i < rows.length; ++i) {
        ++rows[i].done;
      }
    });
    return rows;
  }

  // transitions(): CfdTransition[] {
  //   return this.issues
  //     .map((issue) => {
  //       const transitions: CfdTransition[] = [
  //         {
  //           date: issue.created,
  //           key: issue.key,
  //           toStatusCategory: "To Do",
  //         },
  //       ];
  //       if (issue.started) {
  //         transitions.push({
  //           date: issue.started,
  //           key: issue.key,
  //           fromStatusCategory: "To Do",
  //           toStatusCategory: "In Progress",
  //         });
  //       }
  //       if (issue.completed) {
  //         transitions.push({
  //           date: issue.completed,
  //           key: issue.key,
  //           fromStatusCategory: issue.started ? "In Progress" : "To Do",
  //           toStatusCategory: "Done",
  //         });
  //       }
  //       return transitions;
  //     })
  //     .flat()
  //     .sort((t1, t2) => compareDateTimes(t1.date, t2.date));
  // }
}
