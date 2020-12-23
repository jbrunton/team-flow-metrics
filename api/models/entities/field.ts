import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "fields" })
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  externalId: string;

  @Column()
  name: string;
}
