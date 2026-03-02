import "./src/config/envirmentLoad.js";
import express from "express";
import otpRoutes from "./src/routes/otp.routes.js";
import { connectDB } from "./src/config/db.js";
import transporter from "./src/config/mail.js";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(helmet());

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use("/api", otpRoutes);

app.use((req, res) => {
  return res.status(404).json({
    type: "pageNotFound",
    message: "Page Not Found !",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await transporter.verify();
    console.log("Mail verified.");
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};    

startServer();   
