import { MongoClient } from "mongodb";

const serverURL = "mongodb+srv://saraswatprateek0_db_user:Klg5GiDio4eHgHrk@cluster0.4gwsmef.mongodb.net/?appName=Cluster0";
const client = new MongoClient(serverURL);

let db;

export async function connectAuthDB() {
  await client.connect();
  db = client.db("authenticationDB");
  console.log("MongoDB Connected");
}

export function getUsersCollection() {
  return db.collection("users");
}