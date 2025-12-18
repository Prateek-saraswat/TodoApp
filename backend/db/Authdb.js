import { MongoClient } from "mongodb";

const serverURL = "mongodb://127.0.0.1:27017";
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