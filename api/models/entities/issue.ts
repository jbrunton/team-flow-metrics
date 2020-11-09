import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({ name: 'issues' })
export class Issue {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    title: string;

    @Column()
    issueType: string;

    @Column()
    status: string;

    @Column()
    statusCategory: string;

    @Column()
    hierarchyLevel: string;

    @Column()
    externalUrl: string;

    @Column()
    parentKey: string;

    @Column()
    parentId: number;

    @Column()
    childCount: number;

    @Column("timestamp")
    started: Date;

    @Column("timestamp")
    completed: Date;

    @Column()
    cycleTime: number;
}
