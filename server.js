import express from "express";
import connectDb from "./config/dbConnection.js";
import errorHandler from "./middleware/errorHandler.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import errorRoutes from "./routes/errorRoutes.js";
import qaBugRoutes from "./routes/qaBugRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import memberinvitationRoutes from "./routes/memberInvitationRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import QABug from "./models/QABugsModel.js";
import Comment from "./models/commentModel.js";
import { v4 as uuidv4 } from "uuid";
import fileUpload from "express-fileupload";
import hbs from "hbs";
import validateToken from "./middleware/validateTokenHandler.js";
import { logger } from "./middleware/logger.js";
import { notFound } from "./middleware/error.js";

const __dirname = path.resolve();
dotenv.config();


connectDb();

const app = express();
const port = process.env.PORT || 5000;

// Work as middleware bodyparser parse the data from req.body
app.use(express.json());
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));

// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );


const corsOptions = {
  origin: "http://localhost:3000", // Replace with the actual origin of your frontend application.
  // You can specify more allowed origins here.
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:4000",
    // credentials: true,
  },
});

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// Middleware to log HTTP requests----Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  let oldSend = res.send;
  res.send = function (data) {
    logger.info(data);
    oldSend.apply(res, arguments);
  };
  next();
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User Joined Room: ` + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Inside your Socket.IO logic on the server
  socket.on("addComment", async (data) => {
    console.log(data);
    // Create a new comment object using the Comment model
    const newComment = new Comment({
      QABug_id: data.QABug_id,
      comments: {
        text: data.text,
        user: data.user,
      },
    });
    console.log(newComment);
    // Save the comment to MongoDB
    await newComment.save();

    // Emit an event to notify all clients about the new comment as an object
    io.emit("newComment", newComment.toObject());
  });

  socket.on("addReply", (data) => {
    console.log(data);

    // Create a new Reply document
    const newReply = {
      text: data.replyText,
      user: data.userId,
    };

    // Find the Comment document by ID and add the reply
    Comment.findByIdAndUpdate(
      data.commentId,
      { $push: { "comments.replies": newReply } },
      { new: true }
    )
      .then((comment) => {
        console.log("Reply added to comment:", comment);

        // Broadcast the reply to all connected clients
        io.emit("newReply", data);
      })
      .catch((error) => {
        console.error("Error adding reply to comment:", error);
      });
  });

  // socket.on("disconnect", () => {
  //   console.log("A user disconnected");
  // });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });

 
});

// app.use(validateToken);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/project-member", memberRoutes);
app.use("/api/project-error", errorRoutes);
app.use("/api/project-error-qabug", qaBugRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/project/user-registration-invitation", memberinvitationRoutes);
app.use("/api/project/member-invitation", memberinvitationRoutes);
app.use("/api/sections", sectionRoutes);

app.use(notFound);
app.use(errorHandler);

server.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
