import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Institute } from "./institute";
import { Department } from "./department";
import { Level } from "./level";
import { Chapter } from "./chapter";
import { Question } from "./question";
import { Exam } from "./exam";

@Entity({ name: "subject" })
export class Subject {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "institute_id", type: "bigint" })
  instituteId!: string;

  @Index()
  @Column({ name: "department_id", type: "bigint", nullable: true })
  departmentId!: string | null;

  @Index()
  @Column({ name: "level_id", type: "bigint" })
  levelId!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string; // Engg Graphics

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null; // Design and Drawing

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

  @ManyToOne(() => Institute, (i) => i.subjects, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "institute_id" })
  institute!: Institute;

  @ManyToOne(() => Department, (d) => d.subjects, { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "department_id" })
  department!: Department | null;

  @ManyToOne(() => Level, (l) => l.subjects, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "level_id" })
  level!: Level;

  @OneToMany(() => Chapter, (c) => c.subject) chapters!: Chapter[];
  @OneToMany(() => Question, (q) => q.subject) questions!: Question[];
  @OneToMany(() => Exam, (e) => e.subject) exams!: Exam[];
}
