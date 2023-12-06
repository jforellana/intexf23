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


app.get('/database', (req,res) => {
    let pagelimit = req.body.limit || 10;

    let query = knex.select().from('survey2').limit(pagelimit);
    query.toString();
    query.then(db => {
        res.render('databases/survey', {db:db});
    })
});

app.get("/survey", (req, res) => {
  res.render("survey");
});

app.get('/links', async (req, res) => {
    let pagelimit = req.body.limit || 10;
    let query = knex.select().from('pk')
    .innerJoin('affiliation', 'pk.affiliation_id', 'affiliation.affiliation_id')
    .innerJoin('platform', 'pk.platform_id', 'platform.platform_no')
    .orderBy('pk.unique_id').limit(pagelimit);
    query.toString();

    query.then(db => {
        res.render('databases/linking', {db:db});
    })
})

app.get("/login", (req, res) => {
  res.render("login");
});

// app.post("/post-survey", (req, res) => {
//     knex.transaction(async(trx) => {

//         const [id] = await trx('survey2')
//         .insert({
//             timestamp: knex.raw('CURRENT_TIMESTAMP'),
//             age: req.body.age,
//             gender: req.body.gender,
//             rel_status: req.body.rel_status,
//             occ_status: req.body.occ_status,
//             location: req.body.location,
//             social_media_usage: req.body.social_media_usage,
//             avg_time_social: req.body.avg_time_social,
//             use_no_purpose: req.body.q1,
//             distracted_social: req.body.q2,
//             restless_no_media: req.body.q3,
//             distracted_general: req.body.q4,
//             bothered_worries: req.body.q5,
//             difficult_concentrated: req.body.q6,
//             compare_successful: req.body.q7,
//             feeling_comparison: req.body.q8,
//             validation_social: req.body.q9,
//             depressed_down: req.body.q10,
//             fluctuate_interests: req.body.q11,
//             sleep_issues: req.body.q12
//             })
//         .returning('unique_id');

//         const newid = id.unique_id;

//         await trx('pk')
//         .insert({
//             unique_id: newid,
//             affiliation_id: req.body.affiliation,
//             platform_id: req.body.platforms
//         })
//         .then(mydata => {
//             res.redirect("/");
//         })
//         .catch((error) => {
//             console.error('Transaction error:', error);
//         })
//         .finally (() => {
//             knex.destroy();
//         })
//     })
// });

app.post("/post-survey", (req, res) => {
    const selectedaffiliations = req.body.affiliation
    const selectedplatforms = req.body.platforms  

    knex.transaction(async(trx) => {
        const [id] = await trx('survey2')
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

        await trx('pk')
        // if ((selectedaffiliations.length > 0) && (selectedplatforms.length > 0)){
        //     for (const affil of selectedaffiliations){
        //     for(const plat of selectedplatforms){
        //         knex("pk").insert({
        //         Affiliation_No: affil,
        //         Platform_No: plat
        //         })
        //     }}
        // }
        // else if ((selectedaffiliations.length > 0) && (selectedplatforms.length == 0)){
        //     for (const affil of selectedaffiliations){
        //     knex("pk").insert({
        //         Affiliation_No: affil,
        //         Platform_No: selectedplatforms
        //     })
            
        //     }
        // }
        // else if ((selectedaffiliations.length == 0) && (selectedplatforms.length > 0)){
        //     for(const plat of selectedplatforms){
        //     knex("pk").insert({
        //         Affiliation_No: selectedaffiliations,
        //         Platform_No: plat
        //     })
        //     }
        // }
        // else{
        //     knex("pk").insert({
        //     Affiliation_No: selectedaffiliations,
        //     Platform_No: selectedplatforms
        //     })
        // }


        .insert({
            unique_id: newid,
            // affiliation_id: req.body.affiliation,
            // platform_id: req.body.platforms
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

    let query = knex.select().from('survey2').limit(perpage).offset(offset);
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

    let query = knex.select().from('pk')
    .innerJoin('affiliation', 'pk.affiliation_id', 'affiliation.affiliation_id')
    .innerJoin('platform', 'pk.platform_id', 'platform.platform_no')
    .orderBy('pk.unique_id').limit(perpage).offset(offset);
    query.toString();

    query.then(db => {
        res.render('databases/linking', {db:db});
    })
})

app.get("/createAccount", (req, res) => {
  res.render("createAccount");
});

app.listen(port, () => console.log("Intex is listening"));
