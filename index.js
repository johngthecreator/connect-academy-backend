import express from "express";
import cors from "cors";
import { getReview } from "./getReview.js";

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

const app = express()
app.use(express.json())
app.use(cors(corsOptions))

app.get("/", (req, res)=>{
    res.status(200).json({"status":"api running"})
})

app.post("/message/review", async (req, res)=>{
    const data = await req.body;
    getReview(data)
    .then(resp => {
        res.status(200).json(JSON.parse(resp));
    })
    .catch(e=>console.error(e));
})

app.listen(8080, () => {
    console.log(`Server is running on port ${8080}.`);
});