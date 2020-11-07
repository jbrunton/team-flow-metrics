import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateIssues1603557556019 implements MigrationInterface {
    name = 'CreateIssues1603557556019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "issues" (
            "id" SERIAL NOT NULL,
            "key" character varying NOT NULL,
            "title" character varying NOT NULL,
            "issueType" character varying NOT NULL,
            "parentKey" character varying,
            "parentId" integer,
            "externalUrl" character varying NOT NULL,
            "started" timestamp,
            "completed" timestamp,
            "cycleTime" real,
            CONSTRAINT "PK_ISSUES_ID" PRIMARY KEY ("id"),
            CONSTRAINT "FK_PARENT_ID" FOREIGN KEY(parentId) REFERENCES issues(id)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "issues"`);
    }

}
