import dotenv from 'dotenv'
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './env'
})

const port = process.env.PORT || 8080;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on port : ${port}`)
            console.log(`Link: http://localhost:${port}`)
        })
    })
    .catch((err) => {
        console.log("MONGO DB connection failed !!! ", err)
    })
