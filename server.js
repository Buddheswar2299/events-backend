require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://swissmote-events-data.netlify.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://formUser:Rokkam@cluster0.2jsg2.mongodb.net/noteTaker');
const db = mongoose.connection

db.once('open',()=>{
    console.log('successfully connected to db')
})

db.on('error',(error)=>{
    console.log(error)
})

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  createdBy: String,
});
const Event = mongoose.model("Event", EventSchema);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("createEvent", async (eventData) => {
    const event = new Event(eventData);
    await event.save();
    io.emit("eventCreated", event);
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

app.get("/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.post("/events", async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  io.emit("eventCreated", event);
  res.json(event);
});

app.put("/events/:id", async (req, res) => {
  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedEvent);
});

app.delete("/events/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Event deleted" });
});

server.listen(5009, () => console.log("Server running on port 5009"));
