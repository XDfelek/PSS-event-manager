require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
});

// Import DAOs
const userDao = require("./dao/userDao")(db);
const eventDao = require("./dao/eventDao")(db);

// Create services
const eventService = require("./services/eventService")(eventDao, userDao);
const authService = require("./services/authService")(userDao);
const adminService = require("./services/adminService")(userDao);

// Pass services to routes
const eventRoutes = require("./routes/eventRoutes")(eventService, userDao);
const authRoutes = require("./routes/authRoutes")(authService);
const adminRoutes = require("./routes/adminRoutes")(adminService);

app.use("/events", eventRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.redirect("/events");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
