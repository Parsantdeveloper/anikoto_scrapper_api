
import {Request , Response , NextFunction} from 'express';
import {api} from '../config/api.js';
import getAnime from '../extractor/getAnime.js';
import scrapeHomePage from '../extractor/home.js';
import scrapeAnimeDetailsPage from '../extractor/getAnimeDetails.js';
import extractEpisodes from '../extractor/getAnimeEpisode.js';
export default async function getAnimeController(req:Request , res:Response, next:NextFunction){
   
    try{
        const keyword = req.query.keyword as string;
        const response = await api.get(`/filter?keyword=${keyword}`);
        const data = await getAnime(response.data)
        res.status(200).json(data)
        
    }catch(err){
        next(err)
    } 
}

export  async function getAnimeHome(req:Request , res:Response, next:NextFunction){
     try{
      const response = await api.get('/home');
      const data = await scrapeHomePage(response.data)
      res.status(200).json(data)

     }catch(err){
        next(err)
     }
}


export async function  getAnimeDetails(req:Request , res:Response, next:NextFunction) {
    try{
       const slug:string = req.query.slug as string
        const response = await api.get(`/watch/${slug}/ep-1`)
        const data =   scrapeAnimeDetailsPage(response.data);
        return res.status(200).json(data);
         
    }catch(error){
        next(error)
    }
}


export async function getAnimeEpisodes(req:Request , res:Response, next:NextFunction) {
    try{

         const id  = req.query.id as string;
        const response = await api.get(`/ajax/episode/list/${id}`);
        const data =  extractEpisodes(response.data.result);
        res.status(200).json(data);

    }catch(error){
        next(error)
    }
}