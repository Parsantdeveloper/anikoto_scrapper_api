
export interface Anime{
     title:string,
     jpTitle:string | null,
        link:string,
        image:string,
        isAdult:boolean,
        type:string | null,
        episodeCount:string | null,
        subEpisodes:string | null,
        dubEpisodes:string | null,
        rating:string | null,
        languages:string[],
        genres:string[]
}