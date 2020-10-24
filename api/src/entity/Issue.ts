import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({ name: 'issues' })
export class Issue {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    title: string;

}
