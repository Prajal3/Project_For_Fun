import express from "express"

import { login, logout, signup,verifyOtp} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verifyOtp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
export default router;