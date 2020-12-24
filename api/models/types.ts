import { DateTime } from "luxon";

export type TransitionStatus = {
  name: string;
  category: string;
};

export type Transition = {
  date: DateTime;
  fromStatus: TransitionStatus;
  toStatus: TransitionStatus;
};

export type SerializedTransition = Omit<Transition, "date"> & {
  date: string;
};

export type Issue = {
  id?: number;
  key: string;
  title: string;
  issueType: string;
  status: string;
  statusCategory: string;
  resolution: string;
  created: DateTime | null;
  hierarchyLevel: string;
  externalUrl: string;
  epicKey: string;
  epicId?: number;
  childCount?: number;
  percentDone?: number;
  started: DateTime | null;
  completed: DateTime | null;
  lastTransition: DateTime | null;
  cycleTime: number;
  transitions: Transition[];
};

export type SerializedIssue = Omit<
  Issue,
  "created" | "started" | "completed" | "lastTransition" | "transitions"
> & {
  created: string;
  started: string;
  completed: string;
  lastTransition: string;
  transitions: SerializedTransition[];
};

export const TransitionsTransformer = {
  from(value: SerializedTransition[]): Transition[] {
    return value.map((transition) => ({
      date: DateTime.fromISO(transition.date),
      fromStatus: transition.fromStatus,
      toStatus: transition.toStatus,
    }));
  },

  to(value: Transition[]): SerializedTransition[] {
    return value.map((transition) => ({
      date: transition.date.toISO(),
      fromStatus: transition.fromStatus,
      toStatus: transition.toStatus,
    }));
  },
};
