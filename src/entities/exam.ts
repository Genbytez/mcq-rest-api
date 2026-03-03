import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ExamStatus } from "./enums";
import { Institute } from "./institute";
import { Level } from "./level";
import { Subject } from "./subject";
import { UserAccount } from "./users";
import { ExamQuestion } from "./exam-question";
import { ExamAttempt } from "./exam-attempt";

@Entity({ name: "exam" })
export class Exam {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: string;

    @Index()
    @Column({ name: "institute_id", type: "bigint" })
    instituteId!: string;

    // Title*
    @Column({ type: "varchar", length: 200 })
    title!: string;

    // Description*
    @Column({ type: "text", nullable: true })
    description!: string | null;

    // Subject*
    @Index()
    @Column({ name: "subject_id", type: "bigint" })
    subjectId!: string;

    // Level*
    @Index()
    @Column({ name: "level_id", type: "bigint" })
    levelId!: string;

    // No. of Questions*
    @Column({ name: "no_of_questions", type: "int" })
    noOfQuestions!: number;

    // Duration (recommended for exam systems)
    @Column({ name: "duration_minutes", type: "int", default: () => "60" })
    durationMinutes!: number;

    // Attempts* (toggle)
    @Column({ name: "attempts_enabled", type: "boolean", default: true })
    attemptsEnabled!: boolean;

    // Enter Attempts*
    @Column({ name: "max_attempts", type: "int", default: () => "1" })
    maxAttempts!: number;

    // Negative Mark*
    @Column({ name: "negative_mark", type: "decimal", precision: 6, scale: 2, default: () => "0.00" })
    negativeMark!: string;

    // Practice Warning - Submit*
    @Column({ name: "practice_warning_on_submit", type: "varchar", length: 800, nullable: true })
    practiceWarningOnSubmit!: string | null;

    // Amount*
    @Column({ type: "decimal", precision: 10, scale: 2, default: () => "0.00" })
    amount!: string;

    @Column({ name: "is_paid", type: "boolean", default: false })
    isPaid!: boolean;

    // Exam window
    @Index()
    @Column({ name: "start_at", type: "timestamp" })
    startAt!: Date;

    @Index()
    @Column({ name: "end_at", type: "timestamp" })
    endAt!: Date;

    @Column({ type: "varchar", length: 20, default: ExamStatus.DRAFT })
    status!: ExamStatus;

    @Column({ name: "shuffle_questions", type: "boolean", default: true })
    shuffleQuestions!: boolean;

    @Column({ name: "shuffle_options", type: "boolean", default: true })
    shuffleOptions!: boolean;

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

    @ManyToOne(() => Institute, (i) => i.exams, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "institute_id" })
    institute!: Institute;

    @ManyToOne(() => Level, (l) => l.exams, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "level_id" })
    level!: Level;

    @ManyToOne(() => Subject, (s) => s.exams, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "subject_id" })
    subject!: Subject;

    @ManyToOne(() => UserAccount, { onDelete: "SET NULL" })
    @JoinColumn({ name: "created_by" })
    creator!: UserAccount | null;

    @OneToMany(() => ExamQuestion, (eq) => eq.exam, { cascade: true })
    examQuestions!: ExamQuestion[];

    @OneToMany(() => ExamAttempt, (a) => a.exam)
    attempts!: ExamAttempt[];

}
