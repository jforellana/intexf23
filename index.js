const { count } = require("console");
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
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "postgres",
    password: process.env.RDS_PASSWORD || "password",
    database: process.env.RDS_DB_NAME || "mental_health",
    port: process.env.RDS_PORT || 5432,
    ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
  },
});

app.get("/", (req, res) => {
  res.render("index");
});


app.get('/database', (req,res) => {
    let pagelimit = req.body.limit || 10;

    let query = knex.select().from('survey').limit(pagelimit);
    query.toString();
    query.then(db => {
        res.render('databases/survey', {db:db});
    })
});

app.get("/survey", (req, res) => {
  res.render("survey");
});

app.get('/links', async (req, res) => {
    let perpage = req.body.limit || 5;
    let page = req.body.page || 1;
    if (page < 1) page = 1;
    let offset = (page - 1) * perpage;

    let query = knex.select().from('plat_affil').orderBy('id').limit(perpage).offset(offset);
    query.toString();

    query.then(db => {
        res.render('databases/linking', {db:db});
    })
})

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/post-survey", (req, res) => {
    const selectedaffiliations = req.body.affiliation
    const selectedplatforms = req.body.platforms  

    knex.transaction(async(trx) => {
        const [id] = await trx('survey')
        .insert({
            timestamp: knex.raw('CURRENT_TIMESTAMP'),
            age: req.body.age,
            gender: req.body.gender,
            rel_status: req.body.rel_status,
            occ_status: req.body.occ_status,
            location: req.body.location,
            social_media_usage: req.body.social_media_usage,
            avg_time_social: req.body.avg_time_social,
            use_no_purpose: req.body.q1,
            distracted_social: req.body.q2,
            restless_no_media: req.body.q3,
            distracted_general: req.body.q4,
            bothered_worries: req.body.q5,
            difficult_concentrated: req.body.q6,
            compare_successful: req.body.q7,
            feeling_comparison: req.body.q8,
            validation_social: req.body.q9,
            depressed_down: req.body.q10,
            fluctuate_interests: req.body.q11,
            sleep_issues: req.body.q12
        })
        .returning('unique_id');
        const newid = id.unique_id;

        await trx('plat_affil')
        .insert({
            id: newid,
            pl_fb: p_facebook,
            pl_tw: p_twitter,
            pl_ig: p_instagram,
            pl_yt: p_youtube,
            pl_dc: p_discord,
            pl_re: p_reddit,
            pl_pt: p_pinterest,
            pl_sc: p_snapchat,
            pl_tt: p_tiktok,
            ao_uv: a_university,
            ao_pr: a_private,
            ao_sc: a_school,
            ao_co: a_company,
            ao_gt: a_government,
            ao_na: a_null            
        })
        .then(mydata => {
            res.redirect("/");
        })
        .catch((error) => {
            console.error('Transaction error:', error);
        })
        .finally (() => {
            knex.destroy();
        })
    })
});

app.post("/database", (req, res) => {
    let perpage = req.body.limit || 5;
    let page = req.body.page || 1;
    if (page < 1) page = 1;
    let offset = (page - 1) * perpage;

    let query = knex.select().from('survey').limit(perpage).offset(offset);
    query.toString();
    query.then(db => {
        res.render('databases/survey', {db:db});
    })
})

app.post('/links', (req, res) => {
    let perpage = req.body.limit || 5;
    let page = req.body.page || 1;
    if (page < 1) page = 1;
    let offset = (page - 1) * perpage;

    let query = knex.select().from('plat_affil').orderBy('id').limit(perpage).offset(offset);
    query.toString();

    query.then(db => {
        res.render('databases/linking', {db:db});
    })
})

app.get("/createAccount", (req, res) => {
  res.render("createAccount");
});

app.listen(port, () => console.log("Intex is listening"));
