import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/toggle/:channelId').post(toggleSubscription);
router.route('/:channelId').get(getSubscribers);
router.route('/:subscriberId').get(getSubscribers);

export default router