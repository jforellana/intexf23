const express = require("express");

let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "mental_health",
    port: 5432,
  },
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/post-survey", (req, res) => {
  let date = new Date();

  knex("main_db").insert({
      Date: date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0],
      Age: req.body.age,
      Gender: req.body.gender,
      Affiliation_No: req.body.affiliation,
      Platform_No: req.body.platforms
  })
  knex("survey_db").insert({
      Date: date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0],
      Age: req.body.age,
      Gender: req.body.gender,
      Rel_Status: req.body.relstatus,
      Occ_Status: req.body.occupation,
      Use_SM: req.body.usage,
      Time_Per_Day: req.body.timespent,
      No_Purpose_Use: req.body.q1,
      Distracted: req.body.q2,
      Restless: req.body.q3,
      Easily_Distracted: req.body.q4,
      Bothered_By_Worries: req.body.q5,
      Concentrate_Difficulty: req.body.q6,
      Comparison: req.body.q7,
      Comparison_Feeling: req.body.q8,
      Seek_Validation: req.body.q9,
      Depressed_Freq: req.body.q10,
      Interest_Fluctuation: req.body.q11,
      Sleep_Issues: req.body.q12
  }).then(mydata => {
      res.redirect("/");
  })
});

app.get('/database', (req,res) => {
    let pagelimit = req.body.limit || 7;

    let query = knex.select().from('main_db').limit(pagelimit);
    query.toString();
    query.then(db => {
        res.render('database', {db:db});
    })
});

app.post('/database', (req, res) => {
    let perpage = req.body.limit || 5;
    let page = req.body.page || 1;
    if (page < 1) page = 1;
    let offset = (page - 1) * perpage;

    let query = knex.select().from('main_db').limit(perpage).offset(offset);
    query.toString();
    query.then(db => {
        res.render('database', {db:db});
    })
})

app.get("/survey", (req, res) => {
  res.render("survey");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.listen(port, () => console.log("Intex is listening"));