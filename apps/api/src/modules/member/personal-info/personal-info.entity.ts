import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../identity/user.entity.js';

@Entity('member_personal_info')
export class PersonalInfo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender!: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber!: string | null;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 150, nullable: true })
  emergencyContactName!: string | null;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 30, nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state!: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country!: string | null;

  @Column({ name: 'disability_type', type: 'varchar', length: 100, nullable: true })
  disabilityType!: string | null;

  @Column({ name: 'mobility_level', type: 'varchar', length: 100, nullable: true })
  mobilityLevel!: string | null;

  @Column({ name: 'wheelchair_user', type: 'boolean', nullable: true })
  wheelchairUser!: boolean | null;

  @Column({ name: 'fatigue_trigger', type: 'varchar', length: 100, nullable: true })    
  fatigueTrigger!: string | null;

  @Column({name: 'medication_routine', type: 'text', nullable: true})
    medicationRoutine!: string | null;

@Column({ name: 'work_study_schedule', type: 'text', nullable: true })
  workStudySchedule!: string | null;

  @Column({ name: 'accessibility_needs', type: 'text', nullable: true })
  accessibilityNeeds!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}