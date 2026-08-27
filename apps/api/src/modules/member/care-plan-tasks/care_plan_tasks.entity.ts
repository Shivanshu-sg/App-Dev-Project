import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CarePlan } from "../care-plans/care-plans.entity.js";

export type CarePlanTaskType =
  | "exercise"
  | "routine"
  | "therapy"
  | "selfcare"
  | "other";

export type CarePlanTaskPriority = "low" | "med" | "high";

export type CarePlanTaskStatus = "pending" | "done" | "missed" | "skipped";

@Entity("care_plan_tasks")
export class CarePlanTask {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => CarePlan, { onDelete: "CASCADE" })
  @JoinColumn({ name: "care_plan_id" })
  carePlan!: CarePlan;

  @Column({ name: "care_plan_id", type: "uuid" })
  carePlanId!: string;

  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "task_type", type: "varchar", length: 30 })
  taskType!: CarePlanTaskType;

  @Column({ name: "scheduled_time", type: "timestamp", nullable: true })
  scheduledTime!: Date | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  frequency!: string | null;

  @Column({ name: "next_check_in", type: "timestamp", nullable: true })
  nextCheckIn!: Date | null;

  @Column({ type: "varchar", length: 10, default: "med" })
  priority!: CarePlanTaskPriority;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: CarePlanTaskStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
