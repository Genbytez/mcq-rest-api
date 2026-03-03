import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Institute } from "./institute";
import { Role } from "./role";
import { UserStatus } from "./enums";

@Entity({ name: "user_account" })
export class UserAccount {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index()
  @Column({ name: "institute_id", type: "bigint" })
  instituteId!: string;

  @Index()
  @Column({ name: "role_id", type: "bigint" })
  roleId!: string;

  @Index({ unique: true })
  @Column({ name: "reg_no", type: "varchar", length: 50, nullable: true })
  regNo!: string | null; // Student reg no

  @Column({ name: "full_name", type: "varchar", length: 200 })
  fullName!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  mobile!: string | null;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "varchar", length: 20, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  lastLoginAt!: Date | null;

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

  @ManyToOne(() => Institute, (i) => i.users, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "institute_id" })
  institute!: Institute;

  @ManyToOne(() => Role, (r) => r.users, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "role_id" })
  role!: Role;
}
