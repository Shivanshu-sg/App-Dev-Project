import { Router } from "express";
import { appDataSource } from "../../database/data-source.js";
import { User } from "../identity/user.entity.js";
import { authenticate } from '../../middleware/authorize.js';

const CareGiverRouter = Router();

CareGiverRouter.use(authenticate);

CareGiverRouter.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const userRepository = appDataSource.getRepository(User);

    const careGivers = await userRepository.find({
      where: {
        role: "caregiver",
      },
    });

    return res.status(200).json({
      data: careGivers,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default CareGiverRouter;