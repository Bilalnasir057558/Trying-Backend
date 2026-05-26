import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getChannels, getSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/toggle/:channelId').post(toggleSubscription);
router.route('/get-subscribers/:channelId').get(getSubscribers);
router.route('/get-channels/:subscriberId').get(getChannels);

export default router