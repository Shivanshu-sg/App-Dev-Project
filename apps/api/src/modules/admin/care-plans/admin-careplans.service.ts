// import { appDataSource } from "../../../database/data-source.js";

// import { CarePlan } from "../../member/care-plans/care-plans.entity.js";
// import { CarePlanTask } from "../../member/care-plan-tasks/care_plan_tasks.entity.js";
// import { CheckIn } from "../../member/check-ins/check_in.entity.js";
// import {
//   CaregiverAssignment,
//   CaregiverAssignmentStatus,
// } from "../../member/care-plans/care-giver-assignment.entity.js";

// export interface AdminCarePlanFilters {
//   page?: number;
//   limit?: number;
//   status?: "active" | "paused" | "completed";
//   search?: string;
// }

// export class AdminCarePlansService {
//   private carePlanRepository = appDataSource.getRepository(CarePlan);
//   private taskRepository = appDataSource.getRepository(CarePlanTask);
//   private checkInRepository = appDataSource.getRepository(CheckIn);
//   private caregiverAssignmentRepository =
//     app DataSource.getRepository(CaregiverAssignment);

//   /**
//    * GET ALL CARE PLANS FOR ADMIN DASHBOARD
//    */
//   async getCarePlans(filters: AdminCarePlanFilters = {}) {
//     const page = Math.max(Number(filters.page) || 1, 1);
//     const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);

//     const skip = (page - 1) * limit;

//     const query = this.carePlanRepository
//       .createQueryBuilder("carePlan")
//       .leftJoinAndSelect("carePlan.user", "user")
//       .leftJoinAndSelect("carePlan.createdBy", "createdBy")
//       .leftJoinAndSelect(
//         "carePlan.caregiverAssignments",
//         "caregiverAssignment",
//         "caregiverAssignment.status = :caregiverStatus",
//         {
//           caregiverStatus: CaregiverAssignmentStatus.ACTIVE,
//         }
//       )
//       .leftJoinAndSelect("caregiverAssignment.caregiver", "caregiver")
//       .orderBy("carePlan.createdAt", "DESC");

//     if (filters.status) {
//       query.andWhere("carePlan.status = :status", {
//         status: filters.status,
//       });
//     }

//     if (filters.search?.trim()) {
//       const search = `%${filters.search.trim().toLowerCase()}%`;

//       query.andWhere(
//         `
//         (
//           LOWER(carePlan.title) LIKE :search
//           OR LOWER(COALESCE(carePlan.conditionFocus, '')) LIKE :search
//           OR LOWER(COALESCE(user.name, '')) LIKE :search
//           OR LOWER(user.email) LIKE :search
//         )
//         `,
//         { search }
//       );
//     }

//     const [carePlans, total] = await query
//       .skip(skip)
//       .take(limit)
//       .getManyAndCount();

//     /*
//      * We calculate task/check-in statistics separately.
//      * Doing this avoids duplicated CarePlan rows caused by joining
//      * tasks + caregiver assignments + checkins together.
//      */
//     const carePlanIds = carePlans.map((plan) => plan.id);

//     if (carePlanIds.length === 0) {
//       return {
//         data: [],
//         pagination: {
//           page,
//           limit,
//           total: 0,
//           totalPages: 0,
//         },
//       };
//     }

//     const taskStats = await this.taskRepository
//       .createQueryBuilder("task")
//       .select("task.carePlanId", "carePlanId")
//       .addSelect("COUNT(task.id)", "totalTasks")
//       .addSelect(
//         `COUNT(CASE WHEN task.status = 'done' THEN 1 END)`,
//         "completedTasks"
//       )
//       .addSelect(
//         `COUNT(CASE WHEN task.status = 'pending' THEN 1 END)`,
//         "pendingTasks"
//       )
//       .addSelect(
//         `COUNT(CASE WHEN task.status = 'missed' THEN 1 END)`,
//         "missedTasks"
//       )
//       .where("task.carePlanId IN (:...carePlanIds)", {
//         carePlanIds,
//       })
//       .groupBy("task.carePlanId")
//       .getRawMany();

//     const checkInStats = await this.checkInRepository
//       .createQueryBuilder("checkIn")
//       .select("checkIn.carePlanId", "carePlanId")
//       .addSelect("COUNT(checkIn.id)", "totalCheckIns")
//       .addSelect(
//         `COUNT(CASE WHEN checkIn.status = 'done' THEN 1 END)`,
//         "completedCheckIns"
//       )
//       .addSelect(
//         `COUNT(CASE WHEN checkIn.status = 'missed' THEN 1 END)`,
//         "missedCheckIns"
//       )
//       .addSelect(
//         `COUNT(CASE WHEN checkIn.status = 'pending' THEN 1 END)`,
//         "pendingCheckIns"
//       )
//       .where("checkIn.carePlanId IN (:...carePlanIds)", {
//         carePlanIds,
//       })
//       .groupBy("checkIn.carePlanId")
//       .getRawMany();

//     const taskStatsMap = new Map(
//       taskStats.map((stat) => [stat.carePlanId, stat])
//     );

//     const checkInStatsMap = new Map(
//       checkInStats.map((stat) => [stat.carePlanId, stat])
//     );

//     const data = carePlans.map((carePlan) => {
//       const taskStat = taskStatsMap.get(carePlan.id);
//       const checkInStat = checkInStatsMap.get(carePlan.id);

//       const totalTasks = Number(taskStat?.totalTasks ?? 0);
//       const completedTasks = Number(taskStat?.completedTasks ?? 0);

//       const totalCheckIns = Number(checkInStat?.totalCheckIns ?? 0);
//       const completedCheckIns = Number(
//         checkInStat?.completedCheckIns ?? 0
//       );

//       return {
//         id: carePlan.id,
//         title: carePlan.title,
//         description: carePlan.description,
//         conditionFocus: carePlan.conditionFocus,
//         status: carePlan.status,

//         startDate: carePlan.startDate,
//         endDate: carePlan.endDate,

//         patient: {
//           id: carePlan.user?.id,
//           name: carePlan.user?.name ?? null,
//           email: carePlan.user?.email,
//           phoneNumber: carePlan.user?.phoneNumber ?? null,
//         },

//         caregivers:
//           carePlan.caregiverAssignments?.map((assignment) => ({
//             assignmentId: assignment.id,

//             caregiver: {
//               id: assignment.caregiver?.id,
//               name: assignment.caregiver?.name ?? null,
//               email: assignment.caregiver?.email,
//               phoneNumber:
//                 assignment.caregiver?.phoneNumber ?? null,
//             },

//             assignedAt: assignment.createdAt,
//           })) ?? [],

//         taskStats: {
//           total: totalTasks,
//           completed: completedTasks,
//           pending: Number(taskStat?.pendingTasks ?? 0),
//           missed: Number(taskStat?.missedTasks ?? 0),

//           completionPercentage:
//             totalTasks > 0
//               ? Math.round((completedTasks / totalTasks) * 100)
//               : 0,
//         },

//         checkInStats: {
//           total: totalCheckIns,
//           completed: completedCheckIns,
//           pending: Number(checkInStat?.pendingCheckIns ?? 0),
//           missed: Number(checkInStat?.missedCheckIns ?? 0),

//           completionPercentage:
//             totalCheckIns > 0
//               ? Math.round(
//                   (completedCheckIns / totalCheckIns) * 100
//                 )
//               : 0,
//         },

//         createdBy: carePlan.createdBy
//           ? {
//               id: carePlan.createdBy.id,
//               name: carePlan.createdBy.name ?? null,
//               email: carePlan.createdBy.email,
//             }
//           : null,

//         createdAt: carePlan.createdAt,
//         updatedAt: carePlan.updatedAt,
//       };
//     });

//     return {
//       data,

//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   /**
//    * GET SINGLE CARE PLAN
//    */
//   async getCarePlanById(carePlanId: string) {
//     const carePlan = await this.carePlanRepository
//       .createQueryBuilder("carePlan")
//       .leftJoinAndSelect("carePlan.user", "user")
//       .leftJoinAndSelect("carePlan.createdBy", "createdBy")
//       .leftJoinAndSelect(
//         "carePlan.caregiverAssignments",
//         "caregiverAssignment"
//       )
//       .leftJoinAndSelect(
//         "caregiverAssignment.caregiver",
//         "caregiver"
//       )
//       .where("carePlan.id = :carePlanId", {
//         carePlanId,
//       })
//       .getOne();

//     if (!carePlan) {
//       throw new Error("Care plan not found");
//     }

//     const tasks = await this.taskRepository.find({
//       where: {
//         carePlanId,
//       },
//       order: {
//         createdAt: "DESC",
//       },
//     });

//     const checkIns = await this.checkInRepository
//       .createQueryBuilder("checkIn")
//       .leftJoinAndSelect("checkIn.task", "task")
//       .where("checkIn.carePlanId = :carePlanId", {
//         carePlanId,
//       })
//       .orderBy("checkIn.checkInDate", "DESC")
//       .getMany();

//     const totalTasks = tasks.length;

//     const completedTasks = tasks.filter(
//       (task) => task.status === "done"
//     ).length;

//     const pendingTasks = tasks.filter(
//       (task) => task.status === "pending"
//     ).length;

//     const missedTasks = tasks.filter(
//       (task) => task.status === "missed"
//     ).length;

//     const skippedTasks = tasks.filter(
//       (task) => task.status === "skipped"
//     ).length;

//     const totalCheckIns = checkIns.length;

//     const completedCheckIns = checkIns.filter(
//       (checkIn) => checkIn.status === "done"
//     ).length;

//     const missedCheckIns = checkIns.filter(
//       (checkIn) => checkIn.status === "missed"
//     ).length;

//     return {
//       id: carePlan.id,
//       title: carePlan.title,
//       description: carePlan.description,
//       conditionFocus: carePlan.conditionFocus,
//       status: carePlan.status,

//       startDate: carePlan.startDate,
//       endDate: carePlan.endDate,

//       patient: {
//         id: carePlan.user.id,
//         name: carePlan.user.name ?? null,
//         email: carePlan.user.email,
//         phoneNumber: carePlan.user.phoneNumber ?? null,
//         occupation: carePlan.user.occupation ?? null,
//       },

//       caregivers:
//         carePlan.caregiverAssignments?.map((assignment) => ({
//           assignmentId: assignment.id,

//           status: assignment.status,

//           caregiver: {
//             id: assignment.caregiver?.id,
//             name: assignment.caregiver?.name ?? null,
//             email: assignment.caregiver?.email,
//             phoneNumber:
//               assignment.caregiver?.phoneNumber ?? null,
//           },

//           createdAt: assignment.createdAt,
//         })) ?? [],

//       taskStats: {
//         total: totalTasks,
//         completed: completedTasks,
//         pending: pendingTasks,
//         missed: missedTasks,
//         skipped: skippedTasks,

//         completionPercentage:
//           totalTasks > 0
//             ? Math.round(
//                 (completedTasks / totalTasks) * 100
//               )
//             : 0,
//       },

//       checkInStats: {
//         total: totalCheckIns,
//         completed: completedCheckIns,
//         missed: missedCheckIns,

//         completionPercentage:
//           totalCheckIns > 0
//             ? Math.round(
//                 (completedCheckIns / totalCheckIns) * 100
//               )
//             : 0,
//       },

//       tasks: tasks.map((task) => ({
//         id: task.id,
//         title: task.title,
//         description: task.description,
//         taskType: task.taskType,
//         scheduledTime: task.scheduledTime,
//         frequency: task.frequency,
//         nextCheckIn: task.nextCheckIn,
//         priority: task.priority,
//         status: task.status,
//         createdAt: task.createdAt,
//       })),

//       recentCheckIns: checkIns.slice(0, 20).map((checkIn) => ({
//         id: checkIn.id,

//         taskId: checkIn.taskId,

//         taskTitle: checkIn.task?.title ?? null,

//         checkInDate: checkIn.checkInDate,

//         status: checkIn.status,

//         notes: checkIn.notes,

//         completedAt: checkIn.completedAt,
//       })),

//       createdBy: carePlan.createdBy
//         ? {
//             id: carePlan.createdBy.id,
//             name: carePlan.createdBy.name ?? null,
//             email: carePlan.createdBy.email,
//           }
//         : null,

//       createdAt: carePlan.createdAt,
//       updatedAt: carePlan.updatedAt,
//     };
//   }

//   /**
//    * DASHBOARD SUMMARY
//    */
//   async getCarePlanSummary() {
//     const [
//       total,
//       active,
//       paused,
//       completed,
//     ] = await Promise.all([
//       this.carePlanRepository.count(),

//       this.carePlanRepository.count({
//         where: {
//           status: "active",
//         },
//       }),

//       this.carePlanRepository.count({
//         where: {
//           status: "paused",
//         },
//       }),

//       this.carePlanRepository.count({
//         where: {
//           status: "completed",
//         },
//       }),
//     ]);

//     const totalTasks = await this.taskRepository.count();

//     const completedTasks = await this.taskRepository.count({
//       where: {
//         status: "done",
//       },
//     });

//     const totalCheckIns = await this.checkInRepository.count();

//     const completedCheckIns =
//       await this.checkInRepository.count({
//         where: {
//           status: "done",
//         },
//       });

//     return {
//       carePlans: {
//         total,
//         active,
//         paused,
//         completed,
//       },

//       tasks: {
//         total: totalTasks,
//         completed: completedTasks,

//         completionPercentage:
//           totalTasks > 0
//             ? Math.round(
//                 (completedTasks / totalTasks) * 100
//               )
//             : 0,
//       },

//       checkIns: {
//         total: totalCheckIns,
//         completed: completedCheckIns,

//         completionPercentage:
//           totalCheckIns > 0
//             ? Math.round(
//                 (completedCheckIns / totalCheckIns) * 100
//               )
//             : 0,
//       },
//     };
//   }
// }

// export const adminCarePlansService =
//   new AdminCarePlansService();