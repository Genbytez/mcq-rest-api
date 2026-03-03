import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Institute } from "./institute";
import { Subject } from "./subject";

@Entity({ name: "chapter" })
export class Chapter {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "institute_id", type: "bigint" })
  instituteId!: string;

  @Index()
  @Column({ name: "subject_id", type: "bigint" })
  subjectId!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ name: "sort_order", type: "int", default: () => "0" })
  sortOrder!: number;

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

  @ManyToOne(() => Institute, (i) => i.chapters, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "institute_id" })
  institute!: Institute;

  @ManyToOne(() => Subject, (s) => s.chapters, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "subject_id" })
  subject!: Subject;
}
