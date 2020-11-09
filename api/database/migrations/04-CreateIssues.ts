import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateIssues0000000000004 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "issues" (
            "id" SERIAL NOT NULL,

            "key" character varying NOT NULL UNIQUE,
            "title" character varying NOT NULL,
            "issueType" character varying NOT NULL,
            "status" character varying NOT NULL REFERENCES statuses(name),
            "statusCategory" status_category NOT NULL,
            "externalUrl" character varying NOT NULL,
            "hierarchyLevel" character varying NOT NULL REFERENCES hierarchy_levels(name),

            "parentKey" character varying,
            "parentId" integer REFERENCES issues(id),
            "childCount" integer,

            "transitions" jsonb NOT NULL,

            "started" timestamp,
            "completed" timestamp,
            "cycleTime" real,
            CONSTRAINT "PK_ISSUES_ID" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "issues"`);
    }

}
