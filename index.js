import express from "express";
import cors from "cors";
import { getReview } from "./getReview.js";
import dotenv from "dotenv";
import mysql from "mysql2";
import bcrypt from "bcrypt";

dotenv.config()

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

const app = express()
app.use(express.json())
app.use(cors(corsOptions))

const connection = mysql.createConnection(process.env.DATABASE_URL);

app.get("/", (req, res)=>{
    res.status(200).json({"status":"api running"})
})

app.post("/message/review", async (req, res)=>{
    const bearer = req.headers.authorization;
    const email = req.headers['host-email'];
    const uuid = bearer.split(" ");
    const userPost = req.body;

    const sql = 'SELECT auth FROM users WHERE email = ? ';
    const values = [email];
    connection.query(sql, values, (err, auth) => {
        if (err) throw err
        const hashedPass = auth[0].auth
        if (bcrypt.compare(uuid[1], hashedPass)){
            getReview(userPost)
            .then(resp => {
                res.status(200).json(JSON.parse(resp));
            })
            .catch(e=>res.status(500).json({"Server Error":e}));
        }
        else{
            res.status(401).json( {
                    success: false,
                    message: 'You are not authorized to view this resource because you are not logged in.'
                });
        }
    })
    
})

app.post("/create/user", async (req, res)=>{
    const bearer = req.headers.authorization;
    const uuid = bearer.split(" ");
    const {userName, userEmail} = req.body;
    const sql = 'SELECT auth FROM users WHERE email = ? ';
    const values = [userEmail];
    connection.query(sql, values, async (err, auth) => {
        if(auth.length == 0){
            try {
                const hashedPassword = await bcrypt.hash(uuid[1], 10);
                const sql = 'INSERT INTO users (auth, email, name) VALUES (?, ?, ?)';
                const values = [hashedPassword, userEmail, userName];
                connection.query(sql, values, (err, result) => {
                    if (err) throw err
                    console.log("worked")
                    res.status(200).json({"status":"created user", "result":result});
                })
            } catch {
                console.log("nah")
            }
        }
        else{
            res.status(200).json({"status":"logged in"});
        }

    })


})

app.listen(8080, () => {
    console.log(`Server is running on port ${8080}.`);
});