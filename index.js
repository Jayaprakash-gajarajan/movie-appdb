import express from 'express';
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { auth } from './auth.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import cors from "cors";
// import { ObjectId } from "mongodb";

dotenv.config();
const app=express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("mongo is connected");
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cors());


app.get("/", function (request, response) {
    response.send("🙋‍♂️, 🌏 🎊✨🤩");
  });

  const ROLE_ID={
    ADMIN:"0",
    NORMAL_USER:"1",
  };

  app.post("/signup", async (request, response) => {
    const {username,password} = request.body;
    // console.log(data);
    // const movie = await postMovies(data);
    const userFromDB=await getUserByName(username);
    console.log(userFromDB);
    if(userFromDB){
      response.send({message:"username already exits"})
    }
    else if(password.length<5){
  response.send({message:"password must be at 8 character"})
    }
    else{
      const hashpassword=await generateHashPassword(password)
      const result=await createUser({
        username:username,
        password:hashpassword,
    // default all user roleId set by one
        roleId:1,
      })
       response.send(result);
    }
    
  })
  app.post("/login", async (request, response) => {
    const {username,password} = request.body;
    // console.log(data);
    // const movie = await postMovies(data);
    const userFromDB=await getUserByName(username);
    // console.log(userFromDB);
    if(!userFromDB){
      response.status(401).send({message:"Invalid data"})
    }
    else{
      const storedDBPassword=userFromDB.password;
      const isPasswordCheck=await bcrypt.compare(password,storedDBPassword)
    //   console.log(isPasswordCheck);
    
    if(isPasswordCheck){
      const token=jwt.sign({id:userFromDB._id},process.env.SECRET_KEY);
      console.log(token);
      response.send({message:"SucessFul login",token:token,roleId:userFromDB.roleId});
    }
    else{
      response.status(401).send({message:"invalid data"});
    }
  }
})

  app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));

  export async function generateHashPassword(password){
    const NO_ROUND=10;
     const salt= await bcrypt.genSalt(NO_ROUND);
     const hashpassword= await bcrypt.hash(password,salt);
     console.log(salt);
     console.log(hashpassword);
  return hashpassword;
  }
  export async function createUser(data) {
    return await client.db("test").collection('members').insertOne(data);
}
export async function getUserByName(username) {
    return await client.db("test").collection("members").findOne({username:username});
}
export async function getMovieById(id) {
    console.log(id);
    return await client
      .db("test")
      .collection("members")
      .findOne({ id:id});
  }

  