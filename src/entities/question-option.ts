import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Question } from "./question";

@Entity({ name: "question_option" })
@Unique(["questionId", "optionKey"])
export class QuestionOption {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "question_id", type: "bigint" })
  questionId!: string;

  @Column({ name: "option_key", type: "char", length: 1 })
  optionKey!: "A" | "B" | "C" | "D";

  @Column({ name: "option_text", type: "text", nullable: true })
  optionText!: string | null;

  @Column({ name: "option_image_base64", type: "text", nullable: true })
  optionImageBase64!: string | null;

  @Column({ name: "option_image_mime", type: "varchar", length: 50, nullable: true })
  optionImageMime!: string | null;

  // IMPORTANT: NEVER send this field to student API response
  @Index()
  @Column({ name: "is_correct", type: "boolean", default: false })
  isCorrect!: boolean;

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

  @ManyToOne(() => Question, (q) => q.options, { onDelete: "CASCADE" })
  @JoinColumn({ name: "question_id" })
  question!: Question;
}
