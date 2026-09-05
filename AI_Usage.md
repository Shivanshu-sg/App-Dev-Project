## Frontend
- Pages - Partially created using AI mainly the styles and the UI part - 15% * 0.5 = 7.5%
- Components - Created Using AI - 10% * 0.7 = 7%

## Backend
- Entities - Taken the help from AI for schema design - 10% * 0.5 = 5%
- Services - Taken some help from AI for creating service functions - 10 * 0.5 = 5%


## Infrastructure
- Used AI for creating the starting directory structure - 5%


Total AI Usage = 7.5% + 7% + 5% + 5% + 5% = 29.5%


## Prompt History
- First thing I done is project planning.
Prompt - this is the project which i will be working on tell me what can be the main features of primary users which are the people will disabilities
Purpose - To discuss what features can the primary users dashboard can have.
Response - For the primary users, which are people with physical disabilities, the main features should center on helping them manage daily care independently and with less friction.
The strongest core features from your project document are:.....

- Then I discuss the details of Care Plan module which is the main module of the system, what features can we add, what can be the flow.
Prompt - what can be done in care plans what can be the flow
Response - In your project, the Care Plan should be the central workspace where a disabled user organizes daily care and tracks progress over time.....
Response 2 - The caregiver’s role in the care plan is to support, monitor, and assist the primary user, not fully control their account. ....
Observstion - By these chats I find out what features i have to add in the primary users dashboard.

- Then I discussed what more can I add which will be beneficial for the users
Prompt - what more can i add which will be beneficial for people with disabilities
Response - You can make Lifely much more valuable by adding features that reduce effort, increase independence, and make daily life feel less overwhelming for people with disabilities...
Observation - It give very good ideas but can't me made in such short time so I took some important things and start working on the project

- Then I take the help of AI to create the starter directory structure
Prompt - create a scalable and mantainable directory structure with starter code
Response - It give the complete directory structure with starter code

- Then I asked the detailed explaination of the created directories
Prompt - explain me the complete directory structure
Response - It gives the detailed explanation of each file and folder

- Then some pnpm error is coming asked ChatGPT how to solve it
Prompt - S:\Lifely AI App dev project>pnpm install
'pnpm' is not recognized as an internal or external command,
operable program or batch file.
Response - It give detailed instructions to solve the problem

- Then I asked it to give me the started code for RegisterPage and LoginPage and what styles to use
Prompt - Give me starter code for login and register page and what styles can i use
Response - It gives the code
Observation - I ran the code and make several changes in the code to make the Register and Login Page working4


Prompt - pps/api dev: 11:27:59 am [tsx] change in ./src\modules\identity\auth.service.ts…
what is this error and how to solve make no changes give the solution only
Response - This error means your API dev server uses tsx, and tsx needs the package esbuild to run TypeScript files. But esbuild is missing from node_modules.
It is not a code error in auth.service.ts. Your dependencies are incomplete or partially broken.
Fix
From the project root:...


Prompt - S:\Lifely AI App dev project>pnpm run dev
lifely-ai@0.1.0 dev S:\Lifely AI App dev project
pnpm --parallel --filter @lifely/api --filter @lifely/web dev

Scope: 2 of 4 workspace projects
apps/api dev$ tsx watch src/server.ts
apps/web dev$ vite
apps/web dev: failed to load config from S:\Lifely AI App dev project\apps\web\vite.config.ts
apps/web dev: error when starting dev server:
apps/web dev: Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from S:\Lifely AI App dev project\node_modules.pnpm@vitejs+plugin-react@4.7.0_vite@6.4.3_@types+node@26.2.0_tsx@4.23.12_\node_modules@vitejs\plugin-react\dist\index.js
apps/web dev: Did you mean to import "vite/dist/node/index.js"?
apps/web dev:     at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
apps/web dev:     at packageResolve (node:internal/modules/esm/resolve:768:81)
apps/web dev:     at moduleResolve (node:internal/modules/esm/resolve:859:18)
apps/web dev:     at defaultResolve (node:internal/modules/esm/resolve:991:11)
apps/web dev:     at #cachedDefaultResolve (node:internal/modules/esm/loader:719:20)
apps/web dev:     at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:736:38)
apps/web dev:     at ModuleLoader.resolveSync (node:internal/modules/esm/loader:765:52)
apps/web dev:     at #resolve (node:internal/modules/esm/loader:701:17)
apps/web dev:     at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:621:35)
apps/web dev:     at ModuleJob.syncLink (node:internal/modules/esm/module_job:160:33)
apps/web dev: Failed
S:\Lifely AI App dev project\apps\web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @lifely/web@ dev: vite
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.
Response - This is the same kind of problem: your dependencies are incomplete/broken.
@vitejs/plugin-react is installed, but it cannot find its required package vite. So the web app cannot start.
Run this from the project root:....\

- Asked Chatgpt that my approach is correct or not
Prompt - for creating api for storing member info i have created a directory under modules named member under which personal info and then under which api route file bussiness logic file and then entity file is that correct approach
Response - Yes, that approach is basically correct.
A clean structure would look like this:..


Prompt - how does the code for personal-info.entity.ts written
Response - It gives file structure for personal info table


Prompt - personalInfoRouter.get('/', async (req, res, next) => {
  try {
    const personalInfo = await getPersonalInfo(req.user.sub);
    res.json({ data: personalInfo });
  } catch (error) {
    next(error);
  }
});
in this code it is showing
'req.user' is possibly 'undefined'.ts(18048)
Response - This is a TypeScript safety error.
Even though personalInfoRouter.use(authenticate) runs before this route, TypeScript does not automatically know that authenticate guarantees req.user exists.
Use a small guard inside each route before using req.user:....


- For Care Plan Module frontend
Prompt - what styling to apply in careplan.tsx
Response - It give the styles to apply in the care plan module


- For care plan module frontend
Prompt - make same changes in CarePlans.tsx to use popup for adding and editing
Response - It make changes in the code to use pop ups for adding and editing care plans


Prompt - give me careplan.tsx styling
Response - It give styles for care plans frontend tab in member dashboard


Prompt - now based on the check_in api create a clean frontend file and give me styles file also
Response - It gives the code for Check In page in member dashboard along with the styles


- Asked ChatGpt how to set next checkin data
Prompt - import {
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

export type DailyCheckInStatus = 'done' | 'missed' | 'skipped';

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

based on this tell me how to do that such that for any task when today is the day for next checkin then the checkin row will create automatically
Response - Aug 26, 1:03 PM
You can do this with a backend “daily generator” function.
The idea:
1. Every task has nextCheckIn
2. When nextCheckIn is today or earlier, backend creates a daily_checkins row
3. After creating the row, backend moves nextCheckIn forward based on frequency
4. This function runs when the user opens the check-in page, or on a daily cron job
For your app, easiest approach: run it before returning check-ins.
Create a service function like this:....

- Finding the error in getting the tasks in service function
Prompt - const getOwnedTask = async (
  userId: string,
  carePlanId: string,
  taskId: string,
  checkInDate: Date,
) => {
  await getOwnedCarePlan(userId, carePlanId);

  const task = await appDataSource.getRepository(CarePlanTask).findOne({
    where: { id: taskId, carePlanId },
  });

  if (!task) throw new AppError(404, 'Care plan task not found');

  const care_plan_name = await appDataSource.getRepository(CarePlan).findOne({
    where: { id: carePlanId },
  });

  const taskName = await appDataSource.getRepository(CarePlanTask).findOne({
    where: { id: taskId },
  });

  const response = { ...task, care_plan_name, taskName, checkInDate };
  console.log('getOwnedTask response:', response); // Log the response for debugging

  return response;
};what is error in this function
Response - Main problem: getOwnedTask is supposed to return a CarePlanTask, but your code returns a custom object:...


- Getting the styling for member dashbaord
Prompt - Given the image of member dashboare wireframe give me the code for the styling
Response - Gives the code for styling


- Now asked ChatGpt what tabs the care giver dashboard can have
Prompt - what tabs should caregiver dashboard should have
Response - For a caregiver dashboard, the tabs should focus on monitoring and helping members, not managing the caregiver’s own care...
Observation - It gives too much tabs which are not neccessary so I have make only 4 tabs.

- After that I have only used the AI for solving the bugs and help in styles in some pages




## Declaration Note
- I have used AI assistance in the frontend for creating the UI elements like the pages layout, components and the styling of the pages and in the backend for creating some service functions.
- My approximate AI Usage percententage is between 25% to 30%.
- The Tools I have used for creating this project is ChatGPT and the model used is GPT 5.5.