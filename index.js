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
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/database", async (req, res) => {
  let pagelimit = req.body.limit || 10;
  const result = await knex("survey2").count("* as count");
  let rowCount = result[0].count;

  let query = knex.select().from("survey2").limit(pagelimit);
  query.toString();
  query.then((db) => {
    res.render("databases/survey", {
      db: db,
      rows: rowCount,
      pagelimit: pagelimit,
    });
  });
});

app.get("/survey", (req, res) => {
  res.render("survey");
});

app.get("/links", async (req, res) => {
  let pagelimit = req.body.limit || 10;
  let page = req.body.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * pagelimit;

  let query = knex
    .select()
    .from("plat_affil")
    .orderBy("id")
    .limit(pagelimit)
    .offset(offset);
  query.toString();

  query.then((db) => {
    res.render("databases/linking", { db: db });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/post-survey", (req, res) => {
  knex.transaction(async (trx) => {
    const [id] = await trx("survey2")
      .insert({
        timestamp: knex.raw("CURRENT_TIMESTAMP"),
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
        sleep_issues: req.body.q12,
      })
      .returning("unique_id");
    const newid = id.unique_id;

    await trx("plat_affil")
      .insert({
        id: newid,
        pl_fb: req.body.p_facebook,
        pl_tw: req.body.p_twitter,
        pl_ig: req.body.p_instagram,
        pl_yt: req.body.p_youtube,
        pl_dc: req.body.p_discord,
        pl_re: req.body.p_reddit,
        pl_pt: req.body.p_pinterest,
        pl_sc: req.body.p_snapchat,
        pl_tt: req.body.p_tiktok,
        ao_uv: req.body.a_university,
        ao_pr: req.body.a_private,
        ao_sc: req.body.a_school,
        ao_co: req.body.a_company,
        ao_gt: req.body.a_government,
        ao_na: req.body.a_null,
      })
      .then((mydata) => {
        res.redirect("finishedSurvey");
      })
      .catch((error) => {
        console.error("Transaction error:", error);
      })
      .finally(() => {
        knex.destroy();
      });
  });
});

app.post("/database", async (req, res) => {
  let pagelimit = req.body.limit || 5;
  let page = req.body.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * pagelimit;

  const result = await knex("survey2").count("* as count");
  let rowCount = result[0].count;

  let query = knex.select().from("survey2").limit(pagelimit).offset(offset);
  query.toString();
  query.then((db) => {
    res.render("databases/survey", {
      db: db,
      rows: rowCount,
      pagelimit: pagelimit,
    });
  });
});

app.post("/surveyfilterid", async (req, res) => {
  let idfilter = req.body.idfilter;
  let pagelimit = req.body.limit || 5;
  let page = req.body.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * pagelimit;

  const result = await knex("survey2").count("* as count");
  let rowCount = result[0].count;

  let query = knex
    .select()
    .from("survey2")
    .where("unique_id", idfilter)
    .limit(pagelimit)
    .offset(offset);
  query.toString();
  query.then((db) => {
    res.render("databases/survey", {
      db: db,
      rows: rowCount,
      pagelimit: pagelimit,
    });
  });
});

app.post("/affiliations", (req, res) => {
  let perpage = req.body.limit || 5;
  let page = req.body.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * perpage;

  let query = knex
    .select()
    .from("plat_affil")
    .orderBy("id")
    .limit(perpage)
    .offset(offset);
  query.toString();

  query.then((db) => {
    res.render("databases/affiliations", { db: db });
  });
});

app.post("/linksfilterid", async (req, res) => {
  let idfilter = req.body.idfilter;
  let pagelimit = req.body.limit || 5;
  let page = req.body.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * pagelimit;

  const result = await knex("survey2").count("* as count");
  let rowCount = result[0].count;

  let query = knex
    .select()
    .from("survey2")
    .where("unique_id", idfilter)
    .limit(pagelimit)
    .offset(offset);
  query.toString();
  query.then((db) => {
    res.render("databases/affiliations", {
      db: db,
      rows: rowCount,
      pagelimit: pagelimit,
    });
  });
});

app.post("/platforms", (req, res) => {
  let perpage = req.body.limit || 5;
  let page = req.body.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * perpage;

  let query = knex
    .select()
    .from("plat_affil")
    .orderBy("id")
    .limit(perpage)
    .offset(offset);
  query.toString();

  query.then((db) => {
    res.render("databases/platforms", { db: db });
  });
});

app.post("/platfilterid", async (req, res) => {
  let idfilter = req.body.idfilter;
  let pagelimit = req.body.limit || 5;
  let page = req.body.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * pagelimit;

  const result = await knex("survey2").count("* as count");
  let rowCount = result[0].count;

  let query = knex
    .select()
    .from("survey2")
    .where("unique_id", idfilter)
    .limit(pagelimit)
    .offset(offset);
  query.toString();
  query.then((db) => {
    res.render("databases/platforms", {
      db: db,
      rows: rowCount,
      pagelimit: pagelimit,
    });
  });
});

app.get("/createAccount", (req, res) => {
  res.render("createAccount");
});

app.get("/modify", (req, res) => {
  res.render("modify");
});

app.get("/selectdb", (req, res) => {
  res.render("selectdb");
});

app.get("/summary", async (req, res) => {
  let fb_q = await knex("plat_affil").count("pl_fb").where("pl_fb", 1);
  fb_q.toString();
  let fb = fb_q[0].count;

  let tw_q = await knex("plat_affil").count("pl_tw").where("pl_tw", 1);
  tw_q.toString();
  let tw = tw_q[0].count;

  let ig_q = await knex("plat_affil").count("pl_ig").where("pl_ig", 1);
  ig_q.toString();
  let ig = ig_q[0].count;

  let dc_q = await knex("plat_affil").count("pl_dc").where("pl_dc", 1);
  dc_q.toString();
  let dc = dc_q[0].count;

  let yt_q = await knex("plat_affil").count("pl_yt").where("pl_yt", 1);
  yt_q.toString();
  let yt = yt_q[0].count;

  let re_q = await knex("plat_affil").count("pl_re").where("pl_re", 1);
  re_q.toString();
  let re = re_q[0].count;

  let pt_q = await knex("plat_affil").count("pl_pt").where("pl_pt", 1);
  pt_q.toString();
  let pt = pt_q[0].count;

  let sc_q = await knex("plat_affil").count("pl_sc").where("pl_sc", 1);
  sc_q.toString();
  let sc = sc_q[0].count;

  let tt_q = await knex("plat_affil").count("pl_tt").where("pl_tt", 1);
  tt_q.toString();
  let tt = tt_q[0].count;

  res.render("databases/summary", {
    fb: fb,
    tw: tw,
    ig: ig,
    dc: dc,
    yt: yt,
    re: re,
    pt: pt,
    sc: sc,
    tt: tt,
  });
});

app.listen(port, () => console.log("Intex is listening"));
