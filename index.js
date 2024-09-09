import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import pg from "pg";
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("/views/images"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "sih",
    password: "luckyloki",
    port: 5432,
});

db.connect();

// VARIABLES TO UPDATE USER LOGIN STATUS AND HOME PAGE LINK IN LOGO
var logged_in = "false";
var home_url = "/";

// HOME PAGE RENDER
app.get("/", (req, res) => {
    res.render("index.ejs",
        {
            curr_login: logged_in,
            home_link: home_url
        }
    );
});

// SIGNUP PAGE RENDER
app.get('/signup-get', (req, res) =>{
    res.render("signup.ejs");
});

// LOGIN PAGE RENDER
app.get('/login-get', (req, res) =>{
    res.render("login.ejs");
});

app.get('/search', (req, res) =>{
    res.render("search.ejs",
        {
            curr_login: logged_in,
            home_link: home_url
        });
});

app.get('/search_results', (res, req) =>{
    res.render();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});