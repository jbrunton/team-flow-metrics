import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHierarchyLevels0000000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "hierarchy_levels" (
            "name" character varying NOT NULL,
            "issueType" character varying NOT NULL,
            CONSTRAINT "PK_HIERARCHY_LEVELS_ID" PRIMARY KEY ("name")
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "hierarchy_levels"`);
  }
}
