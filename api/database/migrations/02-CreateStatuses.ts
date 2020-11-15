import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateStatuses0000000000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "status_category" AS ENUM (
            'To Do',
            'In Progress',
            'Done'
        )`);
        await queryRunner.query(`CREATE TABLE "statuses" (
            "id" SERIAL NOT NULL,
            "externalId" character varying NOT NULL UNIQUE,
            "name" character varying NOT NULL,
            "category" status_category NOT NULL,
            CONSTRAINT "PK_STATUSES_ID" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE "status_category"`);
        await queryRunner.query(`DROP TABLE "statuses"`);
    }

}
