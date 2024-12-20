const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();
const isAuthenticated = require('./middleware/auth');
const router = express.Router();

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database('users.db');

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || '22 5 12 15 3 9 20 25 4 1 19 8 2 15 1 18 4',
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        password TEXT NOT NULL
    )
`);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error(err);
            return res.redirect('/login');
        }
        if (!row || !bcrypt.compareSync(password, row.password)) {
            return res.redirect('/login');
        }
        req.session.authenticated = true;
        req.session.username = row.username;
        res.redirect('/dashboard');
    });
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', async (req, res) => {
    const { email, username, firstName, lastName, password } = req.body;

    try {
        const pterodactylApiKey = process.env.API_KEY;
        const pterodactylPanelUrl = process.env.PANEL_URL;

        if (!pterodactylApiKey || !pterodactylPanelUrl) {
          return res.render('register', { errorMessage: "Pterodactyl API Key or Panel URL not configured." });
        }

        const pterodactylUser = {
            email,
            username,
            first_name: firstName,
            last_name: lastName,
            password,
        };

        const pterodactylResponse = await fetch(`${pterodactylPanelUrl}/api/application/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${pterodactylApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(pterodactylUser)
        });

        if (!pterodactylResponse.ok) {
            const errorData = await pterodactylResponse.json();
            console.error("Pterodactyl API Error:", errorData);
            return res.render('register', { errorMessage: "Error creating account on the panel." });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.render('register', { errorMessage: "Error creating local account."});
            }
            db.run('INSERT INTO users (email, username, firstName, lastName, password) VALUES (?, ?, ?, ?, ?)', [email, username, firstName, lastName, hashedPassword], (err) => {
                if (err) {
                    console.error(err);
                    return res.render('register', { errorMessage: "Error creating local account."});
                }
                res.redirect('/login');
            });
        });

    } catch (error) {
        console.error("Error during registration:", error);
        res.render('register', { errorMessage: "An unexpected error occurred during registration." });
    }
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    if (req.session.authenticated) {
        res.render('dashboard', { username: req.session.username, errorMessage: null });
    } else {
        res.redirect('/login');
    }
});

app.get('/panelUrl', (req, res) => {
    res.json({ panelUrl: process.env.PANEL_URL });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect('/');
    });
});

app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(__dirname + '/public/500.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
