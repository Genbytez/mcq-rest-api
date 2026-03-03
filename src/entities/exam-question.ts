import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Exam } from "./exam";
import { Question } from "./question";

@Entity({ name: "exam_question" })
@Unique(["examId", "questionId"])
export class ExamQuestion {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "exam_id", type: "bigint" })
  examId!: string;

  @Index()
  @Column({ name: "question_id", type: "bigint" })
  questionId!: string;

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

  @ManyToOne(() => Exam, (e) => e.examQuestions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_id" })
  exam!: Exam;

  @ManyToOne(() => Question, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "question_id" })
  question!: Question;
}
