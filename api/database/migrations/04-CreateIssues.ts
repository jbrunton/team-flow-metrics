import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIssues0000000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "issues" (
            "id" SERIAL NOT NULL,

            "key" character varying NOT NULL UNIQUE,
            "title" character varying NOT NULL,
            "issueType" character varying NOT NULL,
            "status" character varying NOT NULL,
            "statusCategory" status_category NOT NULL,
            "resolution" character varying,
            "created" timestamp NOT NULL,

            "externalUrl" character varying NOT NULL,
            "hierarchyLevel" character varying NOT NULL REFERENCES hierarchy_levels(name),

            "epicKey" character varying,
            "epicId" integer REFERENCES issues(id),
            "childCount" integer,
            "percentDone" integer,

            "transitions" jsonb NOT NULL,

            "started" timestamp,
            "completed" timestamp,
            "lastTransition" timestamp,
            "cycleTime" real,
            CONSTRAINT "PK_ISSUES_ID" PRIMARY KEY ("id")
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "issues"`);
  }
}
