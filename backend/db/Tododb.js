import {MongoClient} from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017/')

let todoDB

export async function connectTodoDB() {
  await client.connect();
  todoDB =  client.db('todoDB')
  console.log("Todo db connected")
}

export function getTodoCollection () {
    return todoDB.collection("todos")
}