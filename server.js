import  express  from "express";
import connectDb from "./config/dbConnection.js";
import errorHandler from "./middleware/errorHandler.js";
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import errorRoutes from './routes/errorRoutes.js';
import qaBugRoutes from './routes/qaBugRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import memberinvitationRoutes from './routes/memberInvitationRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import cors from 'cors';
dotenv.config(); 
connectDb();

const app = express();

const port = process.env.PORT || 5000;

// Work as middleware bodyparser parse the data from req.body
app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes)
app.use("/api/project",projectRoutes)
app.use("/api/project-member",memberRoutes)
app.use("/api/project-error",errorRoutes)
app.use("/api/project-error-qabug",qaBugRoutes)
app.use("/api",dashboardRoutes)
app.use('/api/project/member-invitation',memberinvitationRoutes)
app.use("/api/sections",sectionRoutes)


app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
