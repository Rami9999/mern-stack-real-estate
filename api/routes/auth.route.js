import express from "express";
import { signup,signin,google, signOut } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/signin",signin);
router.get('/signOut',signOut);
router.post("/google",google);
export default router;