import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

import { connectAuthDB, getUsersCollection } from "./db/Authdb.js";
import { connectTodoDB, getTodoCollection } from "./db/Tododb.js";

const app = express();
app.use(express.json());
app.use(cors());

await connectAuthDB();
await connectTodoDB();


app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const usersCollection = getUsersCollection();
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      fullName,
      email,
      password: hashedPassword,
      role: role || "user",
       status: "Inactive",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersCollection = getUsersCollection();
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      message: "User Logged in successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ================= TODOS ================= */

app.get("/todos/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const todosCollection = getTodoCollection();
    const todos = await todosCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching todos" });
  }
});

app.get("/todos/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const todosCollection = getTodoCollection();
    const todos = await todosCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching todos" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { title, userId , dueDate } = req.body;

    const todosCollection = getTodoCollection();

    await todosCollection.insertOne({
      title,
      dueDate,
      completed: false,
      userId: new ObjectId(userId),
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Todo added" });
  } catch (err) {
    res.status(500).json({ message: "Error adding todo" });
  }
});


app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todosCollection = getTodoCollection();

    await todosCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting todo" });
  }
});

app.patch("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const todosCollection = getTodoCollection();

    await todosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json({ message: "Todo updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating todo" });
  }
});
app.post("/admin/users", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const usersCollection = getUsersCollection();

    const existing = await usersCollection.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      fullName,
      email,
      password: hashedPassword,
      role,
      status: "Active",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User added" });
  } catch (err) {
    res.status(500).json({ message: "Error adding user" });
  }
});

app.get('/admin/users' , async (req , res) =>{
    try{
        const usersCollection = getUsersCollection()

        const users = await usersCollection.find().toArray()
        res.json(users)
    }catch(err){
       res.status(500).json({message : 'Error fetching users!'})
    }
})

app.delete("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const usersCollection = getUsersCollection();

    await usersCollection.deleteOne({ _id: new ObjectId(id) });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});


app.delete("/todos/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const todosCollection = getTodoCollection();

    const result = await todosCollection.deleteOne({
      _id: new ObjectId(taskId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.patch("/admin/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!status || !["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const usersCollection = getUsersCollection();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.delete("/admin/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const usersCollection = getUsersCollection();

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});


//

app.listen(5000, () => {
  console.log("Server running on 5000");
});