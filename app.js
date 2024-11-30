const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const itemRoutes = require('./routes/itemRoutes');

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Database connection error: ", err);
    } else {
        console.log("Database connected!");
    }
});

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use('/', itemRoutes);

app.post('/edit', (req, res) => {
    const { id, name, description } = req.body;

    if (!id || !name) {
        req.flash('error', 'Name and ID are required!');
        return res.redirect('/');
    }

    db.run(
        `UPDATE items SET name = ?, description = ? WHERE id = ?`,
        [name, description, id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send("Error updating item");
                return;
            }

            req.flash('success', 'Item updated successfully!');
            res.redirect('/');
        }
    );
});

app.set('view engine', 'ejs');

app.use((req, res) => {
    res.status(404).render('error', { message: 'Page not found.' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Something went wrong! Please try again later.' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
