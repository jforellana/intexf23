const express = require('express');

let app = express();

let path  = require('path');


const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

const knex = require('knex') ({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'password',
        database: 'mental_health',
        port: 5432
    }
})

app.get('/', (req,res) => {
    res.render('index');
});

app.get('/survey', (req,res) => {
    res.render('survey');
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


app.listen(port, () => console.log('Intex is listening'));