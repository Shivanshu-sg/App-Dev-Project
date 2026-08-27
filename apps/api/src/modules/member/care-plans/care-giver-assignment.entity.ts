import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../identity/user.entity.js";
import { CarePlan } from "./care-plans.entity.js";

export enum CaregiverAssignmentStatus {
  ACTIVE = "active",
  REMOVED = "removed",
}

@Entity("caregiver_assignments")
export class CaregiverAssignment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Patient/User receiving care
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  // Caregiver assigned to the user
  @Column({ name: "caregiver_id", type: "uuid" })
  caregiverId!: string;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "caregiver_id" })
  caregiver!: User;

  // Person who created the assignment
  @Column({ name: "assigned_by", type: "uuid" })
  assignedBy!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "assigned_by" })
  assignedByUser!: User;

  @Column({ name: "care_plan_id", type: "uuid", nullable: true })
  carePlanId!: string | null;

  @ManyToOne(() => CarePlan, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "care_plan_id" })
  carePlan!: CarePlan | null;
  

  @Column({
    type: "enum",
    enum: CaregiverAssignmentStatus,
    default: CaregiverAssignmentStatus.ACTIVE,
  })
  status!: CaregiverAssignmentStatus;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
  })
  createdAt!: Date;
}