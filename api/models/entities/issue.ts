import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({ name: 'issues' })
export class Issue {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    title: string;

    @Column("timestamp")
    started: Date;

    @Column("timestamp")
    completed: Date;

    @Column()
    cycleTime: number
}
