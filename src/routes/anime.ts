
import express from "express";
import getAnimeController, { getAnimeDetails, getAnimeEpisodes, getAnimeHome } from "../controllers/anime.js";

const router = express.Router();

router.get("/filter",getAnimeController);

router.get("/home",getAnimeHome);

router.get("/details",getAnimeDetails);

router.get("/episodes",getAnimeEpisodes);

export default router;


