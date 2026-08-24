import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/env.js';
import { User } from '../modules/identity/user.entity.js';

export const appDataSource = new DataSource({
  type: 'postgres', url: env.DATABASE_URL, entities: [User], migrations: ['src/database/migrations/*.ts'], synchronize: true
});
