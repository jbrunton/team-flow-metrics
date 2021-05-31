import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkerJobs0000000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "worker_jobs" (
            "id" SERIAL NOT NULL,

            "job_key" character varying NOT NULL,
            "created" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "started" timestamp,
            "completed" timestamp,

            CONSTRAINT "PK_WORKER_JOBS_ID" PRIMARY KEY ("id")
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "worker_jobs"`);
  }
}
