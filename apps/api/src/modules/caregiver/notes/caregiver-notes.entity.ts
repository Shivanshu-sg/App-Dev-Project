import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../identity/user.entity.js';

export type CaregiverNoteCategory =
  | 'general'
  | 'health'
  | 'medication'
  | 'mood'
  | 'task'
  | 'emergency';

@Entity('caregiver_notes')
export class CaregiverNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver!: User;

  @Index()
  @Column({ name: 'caregiver_id', type: 'uuid' })
  caregiverId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member!: User;

  @Index()
  @Column({ name: 'member_id', type: 'uuid' })
  memberId!: string;

  @Column({ type: 'text' })
  note!: string;

  @Column({ type: 'varchar', length: 30, default: 'general' })
  category!: CaregiverNoteCategory;

  @Column({ name: 'is_important', type: 'boolean', default: false })
  isImportant!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}