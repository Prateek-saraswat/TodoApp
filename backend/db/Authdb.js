import { MongoClient } from "mongodb";

const serverURL = "mongodb+srv://saraswatprateek0_db_user:V2ZOyvkbaOKcplSW@taskmanager.dpxtmhq.mongodb.net/?appName=TaskManager";
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