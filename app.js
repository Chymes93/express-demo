const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const Joi = require('joi')
const express = require('express');
const logger = require('./logger');
const authenticater = require('./authenticater');
const app = express();
app.set('view engine', 'pug');
app.set('views', './views')
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');


console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    startupDebugger('Morgan Enabled...');
}


const courses = [
    {id:1, name: "html"},
    {id:2, name: "css"},
    {id:3, name: "javascript"},
]

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(helmet())
app.use(morgan('tiny'))
app.use(logger)
app.use(authenticater)

console.log('Apllication Name' + config.get('name'));
console.log('Mail Server' + config.get('mail.host'));
console.log('Mail Password: ' + config.get('mail.password'));
dbDebugger('Connected to database...');  






app.get('/', (req, res) => {
    res.render('index', { title: 'My Express App', message: 'Hello'})
});

app.get('/api/users', (req, res) => {
    res.send(["javascript", "react", "node"])
});

app.get('/api/courses', (req, res) => {
    res.send(courses)
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the id not found.');

    const { error } = validateCourse(req.body)

    if(error) return res.status(400).send(error.details[0].message);

    course.name = req.body.name
    res.send(course)
});

app.post('/api/courses', (req, res) => {
    
    const { error} = validateCourse(req.body)
    
    if(error) return res.status(400).send(error.details[0].message);

    const course = {
        id: courses.length + 1,
        name: req.body.name
    }
    courses.push(course);
    res.send(course)
});

app.get('/api/post/:year/:month', (req, res) => {
    res.send(req.params)
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send("the course with the id not found")
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    res.send(course)
})
    

function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(course, schema)
}

const port = process.env.PORT || 5000

app.listen(port, () => {console.log(`listening on port ${port}...`)});
