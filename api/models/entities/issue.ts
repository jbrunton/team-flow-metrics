import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { Moment } from "moment";

export type TransitionStatus = {
    name: string,
    category: string
}

export type Transition = {
    date: string,
    fromStatus: TransitionStatus,
    toStatus: TransitionStatus
}

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
    resolution: string;

    @Column()
    created: Date;

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

    @Column()
    percentDone: number;

    @Column({
        type: 'jsonb',
        array: false
    })
    transitions: Array<Transition>;

    @Column("timestamp")
    started: Date;

    @Column("timestamp")
    completed: Date;

    @Column("timestamp")
    lastTransition: Date;

    @Column()
    cycleTime: number;

    constructor(issue?: Partial<Issue>) {
        Object.assign(this, issue);
    }
}
