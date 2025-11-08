// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDB } from "./db.js";
import { ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ====== ES Modules: __dirname ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Connect to DB ======
await connectDB();
console.log("✅ Database connected");

// ====== API ROUTES ======
const API = "/api";

// -------- Courses --------
app.get(`${API}/courses`, async (req, res) => {
  const courses = await getDB().collection("courses").find().toArray();
  res.json(courses);
});

app.post(`${API}/courses`, async (req, res) => {
  const { title, code } = req.body;
  const result = await getDB().collection("courses").insertOne({ title, code });
  res.json(result);
});

app.put(`${API}/courses/:id`, async (req, res) => {
  const { id } = req.params;
  const { title, code } = req.body;
  const result = await getDB().collection("courses").updateOne(
    { _id: new ObjectId(id) },
    { $set: { title, code } }
  );
  res.json(result);
});

app.delete(`${API}/courses/:id`, async (req, res) => {
  const { id } = req.params;
  const result = await getDB().collection("courses").deleteOne({ _id: new ObjectId(id) });
  res.json(result);
});

// -------- Students --------
app.get(`${API}/students`, async (req, res) => {
  const students = await getDB().collection("students").find().toArray();
  res.json(students);
});

app.get(`${API}/students/:id`, async (req, res) => {
  const { id } = req.params;
  const student = await getDB().collection("students").findOne({ _id: new ObjectId(id) });
  res.json(student);
});

app.post(`${API}/students`, async (req, res) => {
  const { name, email } = req.body;
  const result = await getDB().collection("students").insertOne({ name, email, registeredCourses: [] });
  res.json(result);
});

app.put(`${API}/students/:id`, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const result = await getDB().collection("students").updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, email } }
  );
  res.json(result);
});

app.delete(`${API}/students/:id`, async (req, res) => {
  const { id } = req.params;
  const result = await getDB().collection("students").deleteOne({ _id: new ObjectId(id) });
  res.json(result);
});

// -------- Registration --------
app.post(`${API}/students/:id/register`, async (req, res) => {
  const { id } = req.params;
  const { courseId } = req.body;
  await getDB().collection("students").updateOne(
    { _id: new ObjectId(id) },
    { $addToSet: { registeredCourses: new ObjectId(courseId) } }
  );
  res.json({ success: true });
});

app.post(`${API}/students/:id/unregister`, async (req, res) => {
  const { id } = req.params;
  const { courseId } = req.body;
  await getDB().collection("students").updateOne(
    { _id: new ObjectId(id) },
    { $pull: { registeredCourses: new ObjectId(courseId) } }
  );
  res.json({ success: true });
});

// ====== Serve static files ======
app.use(express.static(path.join(__dirname)));

// ====== Serve index.html for all other routes (Wildcard) ======
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // index.html موجود داخل src
});

// ====== Start Server ======
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
