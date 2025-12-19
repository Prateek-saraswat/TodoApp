import {MongoClient} from 'mongodb'

const client = new MongoClient('mongodb+srv://saraswatprateek0_db_user:Klg5GiDio4eHgHrk@cluster0.4gwsmef.mongodb.net/?appName=Cluster0')

let todoDB

export async function connectTodoDB() {
  await client.connect();
  todoDB =  client.db('todoDB')
  console.log("Todo db connected")
}

export function getTodoCollection () {
    return todoDB.collection("todos")
}