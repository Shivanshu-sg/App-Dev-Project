import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../identity/user.entity.js';
import { CarePlan } from '../care-plans/care-plans.entity.js';
import { CarePlanTask } from '../care-plan-tasks/care_plan_tasks.entity.js';

export type DailyCheckInStatus = 'done' | 'missed' | 'skipped' | 'pending';

@Entity('daily_checkins')
@Unique(['taskId', 'checkInDate'])
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => CarePlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'care_plan_id' })
  carePlan!: CarePlan;

  @Index()
  @Column({ name: 'care_plan_id', type: 'uuid' })
  carePlanId!: string;

  @ManyToOne(() => CarePlanTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: CarePlanTask;

  @Index()
  @Column({ name: 'task_id', type: 'uuid' })
  taskId!: string;

  @Index()
  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate!: Date;

  @Column({ type: 'varchar', length: 20 })
  status!: DailyCheckInStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}