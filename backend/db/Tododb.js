import {MongoClient} from 'mongodb'

const client = new MongoClient('mongodb+srv://saraswatprateek0_db_user:V2ZOyvkbaOKcplSW@taskmanager.dpxtmhq.mongodb.net/?appName=TaskManager')

let todoDB

export async function connectTodoDB() {
  await client.connect();
  todoDB =  client.db('todoDB')
  console.log("Todo db connected")
}

export function getTodoCollection () {
    return todoDB.collection("todos")
}