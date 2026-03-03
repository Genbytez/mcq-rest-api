import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AttemptStatus } from "./enums";
import { Exam } from "./exam";
import { UserAccount } from "./users";
import { AttemptAnswer } from "./attempt-answer";

@Entity({ name: "exam_attempt" })
@Unique(["examId", "studentId", "attemptNo"])
export class ExamAttempt {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "exam_id", type: "bigint" })
  examId!: string;

  @Index()
  @Column({ name: "student_id", type: "bigint" })
  studentId!: string;

  @Column({ name: "attempt_no", type: "int", default: () => "1" })
  attemptNo!: number;

  @Column({ name: "started_at", type: "timestamp", nullable: true })
  startedAt!: Date | null;

  @Column({ name: "submitted_at", type: "timestamp", nullable: true })
  submittedAt!: Date | null;

  @Index()
  @Column({ type: "varchar", length: 20, default: AttemptStatus.NOT_STARTED })
  status!: AttemptStatus;

  @Column({ type: "decimal", precision: 8, scale: 2, default: () => "0.00" })
  score!: string;

  @Column({ name: "max_score", type: "decimal", precision: 8, scale: 2, default: () => "0.00" })
  maxScore!: string;

  @Column({ name: "correct_count", type: "int", default: () => "0" })
  correctCount!: number;

  @Column({ name: "wrong_count", type: "int", default: () => "0" })
  wrongCount!: number;

  @Column({ name: "skipped_count", type: "int", default: () => "0" })
  skippedCount!: number;

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

  @ManyToOne(() => Exam, (e) => e.attempts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_id" })
  exam!: Exam;

  @ManyToOne(() => UserAccount, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "student_id" })
  student!: UserAccount;

  @OneToMany(() => AttemptAnswer, (a) => a.attempt, { cascade: true })
  answers!: AttemptAnswer[];
}
