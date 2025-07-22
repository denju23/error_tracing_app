import express from "express";
import { getSectionsWithErrors,updateSectionStatus } from "../controllers/sectionController.js";

const router = express.Router();

router.get("/",getSectionsWithErrors)
router.put("/", updateSectionStatus);

export default router;
