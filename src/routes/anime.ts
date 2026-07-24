
import express from "express";
import  {getAnimeController, getAnimeDetails, getAnimeEpisodes, getAnimeHome ,getListOfServers, getPopularSearches, getVideoDirectLink} from "../controllers/anime.js";

const router = express.Router();

router.get("/filter",getAnimeController);

router.get("/home",getAnimeHome);

router.get("/details",getAnimeDetails);

router.get("/episodes",getAnimeEpisodes);

router.get("/servers",getListOfServers);

router.get("/video",getVideoDirectLink);

router.get("/popular", getPopularSearches);

export default router;


