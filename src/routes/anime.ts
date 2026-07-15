
import express from "express";
import getAnimeController, { getAnimeHome } from "../controllers/anime.js";

const router = express.Router();

router.get("/filter",getAnimeController);

router.get("/home",getAnimeHome);


export default router;


