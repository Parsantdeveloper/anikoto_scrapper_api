
import {Response} from "express";

interface successResponse<T> {
    status: "success",
    message: string,
    data: T
}


export function sendSuccessResponse<T> (res:Response , message:string , data:T , statusCode:number = 200){
    const response:successResponse<T> = {
        status:"success",
        message,
        data
    }
    res.status(statusCode).json(response)
}