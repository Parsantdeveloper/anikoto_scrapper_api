import { z } from "zod";
import dotenv from "dotenv"
dotenv.config()
const envSchema = z.object({
NODE_ENV: z.enum(["development", "production", "test"]),
PORT: z.string().transform((val) => parseInt(val, 10)),
API_BASE_URL: z.string().url()
});


const parsed = envSchema.safeParse(process.env);


if (!parsed.success) {
console.error(parsed.error.format());
process.exit(1);
}


export const env = parsed.data;