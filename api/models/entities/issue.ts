import { DateTime } from "luxon";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { DateTimeTransformer } from "../../helpers/date_helper";
import {
  Issue as IssueInterface,
  Transition,
  TransitionsTransformer,
} from "../types";

@Entity({ name: "issues" })
export class Issue implements IssueInterface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  title: string;

  @Column()
  issueType: string;

  @Column()
  status: string;

  @Column()
  statusCategory: string;

  @Column()
  resolution: string;

  @Column({ type: "timestamp", transformer: DateTimeTransformer })
  created: DateTime;

  @Column()
  hierarchyLevel: string;

  @Column()
  externalUrl: string;

  @Column()
  epicKey: string;

  @Column()
  epicId: number;

  @Column()
  childCount: number;

  @Column()
  percentDone: number;

  @Column({
    type: "jsonb",
    array: false,
    transformer: TransitionsTransformer,
  })
  transitions: Transition[];

  @Column({ type: "timestamp", transformer: DateTimeTransformer })
  started: DateTime;

  @Column({ type: "timestamp", transformer: DateTimeTransformer })
  completed: DateTime;

  @Column({ type: "timestamp", transformer: DateTimeTransformer })
  lastTransition: DateTime;

  @Column()
  cycleTime: number;

  constructor(issue?: Partial<Issue>) {
    Object.assign(this, issue);
  }
}
