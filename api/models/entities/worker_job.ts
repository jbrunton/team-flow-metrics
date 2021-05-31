import { DateTime } from "luxon";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { DateTimeTransformer } from "../../helpers/date_helper";

@Entity({ name: "worker_jobs" })
export class WorkerJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  job_key: string;

  @Column({ type: "timestamp", transformer: DateTimeTransformer })
  created: DateTime;

  @Column({ type: "timestamp", transformer: DateTimeTransformer })
  started: DateTime;

  @Column({ type: "timestamp", transformer: DateTimeTransformer })
  completed: DateTime;
}
