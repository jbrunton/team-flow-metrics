import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateFields0000000000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fields" (
            "id" SERIAL NOT NULL,
            "externalId" character varying NOT NULL,
            "name" character varying NOT NULL,
            CONSTRAINT "PK_FIELDS_ID" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "fields"`);
    }

}
