require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");


const {
    notFound,
    errorHandler,
} = require("./controllers/errorController");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.all("*", notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});


