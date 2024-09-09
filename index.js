import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import pg from "pg";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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
var curr_user = {};
var user_id = "002";

// FUNCTION TO SEARCH COURSES
function search_course(course_type){
    let course_names = new Array();

    // course_names = db.query("SELECT * FROM courses WHERE course_type = " + course_type + "\"");
    course_names = db.query(`SELECT * FROM courses WHERE course_type = ${course_type}`);
    console.log(course_names);
    return course_names;
}
// HOME PAGE RENDER
app.get("/", (req, res) => {
    res.render("landing.ejs",
        {
            curr_login: "false",
            home_link: home_url
        }
    );
});
//USER LOGIN DASHBOARD
app.get("/user", (req, res) => {

    res.render("index.ejs",
        {
            curr_login: logged_in,
            home_link: home_url,

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

// SEARCH ROUTE
app.get('/search', (req, res) =>{
    res.render("search.ejs",
        {
            curr_login: logged_in,
            home_link: home_url
        });
});

// SEARCH RESULTS
app.get('/search_results', (req, res) =>{
    const course_type = req.query.course_text;
    // console.log(course_type);

    // let course_search_status = search_course(course_type);
    let course_search_status = null;
    let results;
    let course_numbs = 0;

    // if(course_search_status == null){
    //     results = "No such courses found";
    //     course_numbs = 0;
    // }else{
    //     results = `Showing ${course_search_status.length} results`;
    //     course_numbs = course_search_status.length;
    // }

    res.render("search_results.ejs", {
        curr_login: logged_in,
        home_link: home_url,
    });
});

// CONTENTS OF THE COURSE
app.get('/contents', (req, res) =>{
    res.render("content_page.ejs", {
        curr_login: logged_in,
        home_link: home_url
    });
});

// LOGIN ROUTE
app.post('/login', (req, res) => {
    const { username, password, user_type } = req.body;
    try {
      const query = {
        text: `SELECT * FROM students WHERE user_name = $1`,
        values: [username]
      };
      console.log(query);
      db.query(query, async(err, result) => {
        console.log(err);
        if (err) {
          return res.status(500).send({ error: 'Failed to query database' });
        }
        if (result.rows.length === 0) {
          return res.status(401).send({ error: 'Invalid username or password' });
        }
        const user = result.rows[0];
        console.log(user);
        const isValid = bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).send({ error: 'Invalid username or password' });
        }
        curr_user = user;
        logged_in = "true";
        res.redirect('/user');
      });
    } catch (err) {
      return res.status(500).send({ error: 'Failed to login' });
    }
  });

  // SIGNUP ROUTE
app.post('/signup', (req, res) => {
    const { username, password, email, user_type } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const query = {
        text: `INSERT INTO students (user_id, user_name, email_id, password, user_type) VALUES ($1, $2, $3, $4)`,
        values: [user_id, username, email, hashedPassword, user_type]
      };

      console.log(query);
  
      db.query(query, async(err, result) => {
        console.log(result);
        if (err) {
          if (err.code === '23505') {
            return res.status(400).send({ error: 'Username already exists' });
          }
          return res.status(500).send({ error: 'Failed to create user' });
        }
        const user = result.rows[0];
        curr_user = user;
        logged_in = "true";
        res.redirect('/user');
      });
    } catch (err) {
      return res.status(500).send({ error: 'Failed to create user' });
    }
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});