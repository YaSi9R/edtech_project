const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

// Connect to the database
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        // origin: "http://localhost:3000/",
        origin: "https://studyspheree.vercel.app", 
        methods: ["GET", "POST", "PUT", "DELETE"],

        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
);

// Connect to Cloudinary
cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

// Default route
app.get("/", (req, res) => {
    return res.json(
        {
            success: true,
            message: 'Your server is up and running....',
        });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err.stack);
    res.status(500).send("Something broke!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
    console.log("Server connected successfully and is ready to handle requests.");

});
