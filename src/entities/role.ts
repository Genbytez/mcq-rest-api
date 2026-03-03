import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserAccount } from "./users";

@Entity({ name: "role" })
export class Role {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 50 })
  code!: string; // SUPER_ADMIN / ADMIN / STUDENT

  @Column({ type: "varchar", length: 100 })
  name!: string;

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

  @OneToMany(() => UserAccount, (u) => u.role)
  users!: UserAccount[];
}
