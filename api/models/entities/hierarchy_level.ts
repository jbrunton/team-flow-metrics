import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "hierarchy_levels" })
export class HierarchyLevel {
  @PrimaryColumn()
  name: string;

  @Column()
  issueType: string;
}
