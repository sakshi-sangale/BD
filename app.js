const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Donor = require('./models/donor');
const Patient = require('./models/patient');
const passport = require('passport');
const LocalStatrgy = require('passport-local');
const User = require('./models/user');
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const { isLoggedIn } = require('./middleware');


const userRoutes = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/store', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use('/public/images/', express.static('./public/images'));



const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStatrgy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/', userRoutes);



app.get('/', (req, res) => {
    res.render('home')
});

app.get('/about', (req, res) => {
    res.render('about')
});
app.get('/p', (req, res) => {

    res.render('donationprocess')
});

app.get('/todo', (req, res) => {

    res.render('todo')
});

app.get('/donors', isLoggedIn, async (req, res) => {
    const donors = await Donor.find({});
    res.render('donors/index', { donors })
});

app.get('/patient', isLoggedIn, catchAsync(async (req, res) => {
    const patient = await Patient.find({});
    res.render('patient/indexPatient', { patient })
}));

app.get('/donors/new', isLoggedIn, (req, res) => {
    res.render('donors/new');
})


app.post('/donors', isLoggedIn, catchAsync(async (req, res) => {
    const donor = new Donor(req.body.donor);
    await donor.save();
    res.redirect(`/donors/${donor._id}`)
}))

app.get('/patient/newPatient', (req, res) => {
    res.render('patient/newPatient');
})

app.post('/patient', isLoggedIn, catchAsync(async (req, res) => {
    const patient = new Patient(req.body.patient);
    await patient.save();
    res.redirect(`/patient/${patient._id}`)
}))

app.get('/donors/:id', isLoggedIn, catchAsync(async (req, res,) => {
    const donor = await Donor.findById(req.params.id)
    res.render('donors/show', { donor });
}));


app.get('/patient/:id', isLoggedIn, catchAsync(async (req, res,) => {
    const donor = await Patient.findById(req.params.id)
    res.render('Patient/showPatient', { donor });
}));

app.get('/donors/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const donor = await Donor.findById(req.params.id)
    res.render('donors/edit', { donor });
}))

app.put('/donors/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const donor = await Donor.findByIdAndUpdate(id, { ...req.body.donor });
    res.redirect(`/donors/${donor._id}`)
}));



app.get('/patient/:id/editPatient', isLoggedIn, catchAsync(async (req, res) => {
    const patient = await Patient.findById(req.params.id)
    res.render('patient/editPatient', { patient });
}))

app.put('/patient/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const donor = await Patient.findByIdAndUpdate(id, { ...req.body.donor });
    res.redirect(`/patient/${donor._id}`)
}));


app.delete('/donors/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Donor.findByIdAndDelete(id);
    res.redirect('/donors');
}));


app.delete('/patient/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Patient.findByIdAndDelete(id);
    res.redirect('/patient');
}));


app.listen(3500, () => {
    console.log('Serving on port 3000')
})