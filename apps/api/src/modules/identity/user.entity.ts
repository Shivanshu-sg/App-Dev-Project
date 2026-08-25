import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Role } from '@lifely/contracts';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, type: 'varchar' }) email!: string;
  @Column({ name: 'password_hash', select: false , type: 'varchar' }) passwordHash!: string;
  @Column({ type: 'varchar', default: 'member' }) role!: Role;
  @Column({ default: true, type: 'boolean' }) isActive!: boolean;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
