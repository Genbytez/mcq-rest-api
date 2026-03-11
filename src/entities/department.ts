import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Institute } from "./institute";

@Entity({ name: "department" })
export class Department {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id!: string;

    @Index()
    @Column({ name: "institute_id", type: "bigint" })
    instituteId!: string;

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    description!: string | null;

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

    @ManyToOne(() => Institute, (i) => i.departments, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "institute_id" })
    institute!: Institute;
}
