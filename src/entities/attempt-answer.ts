import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ExamAttempt } from "./exam-attempt";
import { Question } from "./question";

@Entity({ name: "attempt_answer" })
@Unique(["attemptId", "questionId"])
export class AttemptAnswer {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "attempt_id", type: "bigint" })
  attemptId!: string;

  @Index()
  @Column({ name: "question_id", type: "bigint" })
  questionId!: string;

  @Column({ name: "selected_option_key", type: "char", length: 1, nullable: true })
  selectedOptionKey!: "A" | "B" | "C" | "D" | null;

  @Column({ name: "is_marked_for_review", type: "boolean", default: false })
  isMarkedForReview!: boolean;

  @Column({ name: "is_correct", type: "boolean", nullable: true })
  isCorrect!: boolean | null;

  @Column({ name: "marks_awarded", type: "decimal", precision: 6, scale: 2, default: () => "0.00" })
  marksAwarded!: string;

  @Column({ name: "answered_at", type: "timestamp", nullable: true })
  answeredAt!: Date | null;

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

  @ManyToOne(() => ExamAttempt, (a) => a.answers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "attempt_id" })
  attempt!: ExamAttempt;

  @ManyToOne(() => Question, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "question_id" })
  question!: Question;
}
