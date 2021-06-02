import { DateTime } from "luxon";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  getConnection,
  IsNull,
} from "typeorm";
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

export async function acquireJob(job_key: string): Promise<WorkerJob> {
  return getConnection().transaction(async (entityManager) => {
    const workerJobsRepo = entityManager.getRepository(WorkerJob);

    async function checkAndCreateJob(job: WorkerJob) {
      if (job) {
        throw new Error(`Pending job already exists for ${job_key}`);
      }
      job = workerJobsRepo.create({ job_key });
      await workerJobsRepo.save(job);
      return job;
    }

    const job = await workerJobsRepo
      .createQueryBuilder("worker_jobs")
      .setLock("pessimistic_write")
      .where({
        job_key,
        completed: IsNull(),
      })
      .getOne()
      .then(checkAndCreateJob);

    return job;
  });
}
