
import {Request , Response , NextFunction} from 'express';
import {api} from '../config/api.js';
import getAnime from '../extractor/getAnime.js';
import scrapeHomePage from '../extractor/home.js';

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

