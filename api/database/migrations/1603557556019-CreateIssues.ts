import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateIssues1603557556019 implements MigrationInterface {
    name = 'CreateIssues1603557556019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "issues" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "title" character varying NOT NULL, CONSTRAINT "PK_9d8ecbbeff46229c700f0449257" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "issues"`);
    }

}
