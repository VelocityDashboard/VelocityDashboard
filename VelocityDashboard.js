require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 25570;
const session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'VelocityDashboard_Default_Key@',
    resave: false,
    saveUninitialized: true
}));

const panelUrl = process.env.PANEL_URL;
const apiKey = process.env.API_KEY;

const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    }
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        password TEXT NOT NULL
    )`);
});

async function initializeFetch() {
    try {
        global.fetch = (await import('node-fetch')).default;
    } catch (err) {
        console.error("Failed to import fetch:", err);
        process.exit(1);
    }
}

initializeFetch().then(() => {
    app.post('/register', async (req, res) => {
        const { email, username, firstName, lastName, password } = req.body;

        if (!email || !username || !firstName || !lastName || !password) {
            return res.render('error', { message: "Please fill in all fields." });
        }

        try {
            const response = await fetch(`${panelUrl}/api/application/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    username,
                    first_name: firstName,
                    last_name: lastName,
                    password
                })
            });

            if (!response.ok) {
                const errorData = await response.json()
                return res.render('error', { message: `Error creating user: ${response.status} ${JSON.stringify(errorData)}` });
            }
            db.run('INSERT INTO users (email, username, firstName, lastName, password) VALUES (?, ?, ?, ?, ?)', [email, username, firstName, lastName, password], (err) => {
                if (err) {
                    console.error("Error inserting user into database:", err.message);
                    return res.render('error', { message: "Error creating user." });
                }
                res.redirect('/login');
            });
        } catch (error) {
            console.error("Error during registration:", error);
            res.render('error', { message: "An error occurred during registration." });
        }
    });

    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
            if (err) {
                console.error("Error during login:", err.message);
                return res.render('error', { message: "Login error." });
            }
            if (row) {
                req.session.username = row.username;
                res.redirect('/dashboard');
            } else {
                res.render('error', { message: "Invalid username or password." });
            }
        });
    });

    app.get('/dashboard', (req, res) => {
        if (req.session.username) {
            res.render('dashboard', { username: req.session.username });
        } else {
            res.redirect('/login');
        }
    });

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/home.html');
    });

    app.get('/register', (req, res) => {
        res.sendFile(__dirname + '/public/register.html');
    });

    app.get('/login', (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    });

    app.use((req, res) => {
        res.status(404).sendFile(__dirname + '/public/404.html');
    });

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
});