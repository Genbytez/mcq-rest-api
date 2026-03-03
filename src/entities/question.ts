import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Difficulty, QuestionType } from "./enums";
import { Institute } from "./institute";
import { Subject } from "./subject";
import { Level } from "./level";
import { Chapter } from "./chapter";
import { UserAccount } from "./users";
import { QuestionOption } from "./question-option";

@Entity({ name: "question" })
export class Question {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "institute_id", type: "bigint" })
  instituteId!: string;

  @Index()
  @Column({ name: "level_id", type: "bigint" })
  levelId!: string;

  @Index()
  @Column({ name: "subject_id", type: "bigint" })
  subjectId!: string;

  @Index()
  @Column({ name: "chapter_id", type: "bigint", nullable: true })
  chapterId!: string | null;

  @Column({ name: "question_type", type: "varchar", length: 20, default: QuestionType.MCQ })
  questionType!: QuestionType;

  @Column({ type: "varchar", length: 20, default: Difficulty.MEDIUM })
  difficulty!: Difficulty;

  @Column({ name: "question_text", type: "text", nullable: true })
  questionText!: string | null;

  // Base64 image (optional)
  @Column({ name: "question_image_base64", type: "text", nullable: true })
  questionImageBase64!: string | null;

  @Column({ name: "question_image_mime", type: "varchar", length: 50, nullable: true })
  questionImageMime!: string | null;

  @Column({ type: "decimal", precision: 6, scale: 2, default: () => "1.00" })
  marks!: string;

  @Column({ name: "negative_marks", type: "decimal", precision: 6, scale: 2, default: () => "0.00" })
  negativeMarks!: string;

  @Column({ name: "explanation_text", type: "text", nullable: true })
  explanationText!: string | null;

  @Column({ name: "explanation_image_base64", type: "text", nullable: true })
  explanationImageBase64!: string | null;

  @Column({ name: "explanation_image_mime", type: "varchar", length: 50, nullable: true })
  explanationImageMime!: string | null;

  @Index()
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

  @ManyToOne(() => Institute, (i) => i.questions, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "institute_id" })
  institute!: Institute;

  @ManyToOne(() => Level, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "level_id" })
  level!: Level;

  @ManyToOne(() => Subject, (s) => s.questions, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "subject_id" })
  subject!: Subject;

  @ManyToOne(() => Chapter, { onDelete: "SET NULL" })
  @JoinColumn({ name: "chapter_id" })
  chapter!: Chapter | null;

  @ManyToOne(() => UserAccount, { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  creator!: UserAccount | null;

  @OneToMany(() => QuestionOption, (o) => o.question, { cascade: true })
  options!: QuestionOption[];
}
