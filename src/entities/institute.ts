import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserAccount } from "./users";
import { Level } from "./level";
import { Subject } from "./subject";
import { Chapter } from "./chapter";
import { Question } from "./question";
import { Exam } from "./exam";

@Entity({ name: "institute" })
export class Institute {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50 })
  code!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  address!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  logo!: string | null;

  @Column({ name: "phone_number", type: "varchar", length: 20, nullable: true })
  phoneNumber!: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "is_deleted", type: "boolean", default: false })
  isDeleted!: boolean;

  @Column({ name: "created_by", type: "bigint", nullable: true })
  createdBy!: string | null;

  @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ name: "updated_by", type: "bigint", nullable: true })
  updatedBy!: string | null;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  @OneToMany(() => UserAccount, (u) => u.institute) users!: UserAccount[];
  @OneToMany(() => Level, (l) => l.institute) levels!: Level[];
  @OneToMany(() => Subject, (s) => s.institute) subjects!: Subject[];
  @OneToMany(() => Chapter, (c) => c.institute) chapters!: Chapter[];
  @OneToMany(() => Question, (q) => q.institute) questions!: Question[];
  @OneToMany(() => Exam, (e) => e.institute) exams!: Exam[];
}
