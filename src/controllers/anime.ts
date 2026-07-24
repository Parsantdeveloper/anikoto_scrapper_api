import { Request, Response } from "express";
import { api } from "../config/api.js";
import getAnime from "../extractor/getAnime.js";
import scrapeHomePage from "../extractor/home.js";
import scrapeAnimeDetailsPage from "../extractor/getAnimeDetails.js";
import extractEpisodes from "../extractor/getAnimeEpisode.js";
import extractServers from "../extractor/getServer.js";
import { asyncHandler } from "../utils/async_handler.js";
import  {sendSuccessResponse}  from "../utils/api_response.js";
import getPopularSearch from "../extractor/getPopular.js";


export const getAnimeController = asyncHandler(async (req: Request, res: Response) => {
  const keyword = req.query.keyword as string;

  const response = await api.get(`/filter?keyword=${keyword}`);
  const data = await getAnime(response.data);

  return sendSuccessResponse(res, "Anime fetched successfully", data);
});

export const getAnimeHome = asyncHandler(async (_req: Request, res: Response) => {
  const response = await api.get("/home");
  const data =  scrapeHomePage(response.data);

  return sendSuccessResponse(res, "Home page fetched successfully", data);
});

export const getAnimeDetails = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.query.slug as string;

  const response = await api.get(`/watch/${slug}/ep-1`);
  const data = scrapeAnimeDetailsPage(response.data);

  return sendSuccessResponse(res, "Anime details fetched successfully", data);
});

export const getAnimeEpisodes = asyncHandler(async (req: Request, res: Response) => {
  const id = req.query.id as string;

  const response = await api.get(`/ajax/episode/list/${id}`);
  const data = extractEpisodes(response.data.result);

  return sendSuccessResponse(res, "Episodes fetched successfully", data);
});

export const getListOfServers = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = await api.get(`/ajax/server/list?servers=${token}`);
  const data = extractServers(response.data.result);

  return sendSuccessResponse(res, "Servers fetched successfully", data);
});

export const getVideoDirectLink = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = await api.get(`/ajax/server/?get=${token}`);

  return sendSuccessResponse(
    res,
    "Video link fetched successfully",
    response.data.result
  );
}); 
    

export const getPopularSearches = asyncHandler(async (_req: Request, res: Response) => {
   const response = await api.get("/");
   const data = getPopularSearch(response.data);

   return sendSuccessResponse(res, "Popular searches fetched successfully", data);


});