const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const Database = require('better-sqlite3');  // Use better-sqlite3
const app = express();
const itemRoutes = require('./routes/itemRoutes');

// Create or open the database using better-sqlite3
const db = new Database('./database.db', { verbose: console.log });  // Synchronous API

// Check if database is connected (no need for a callback)
console.log("Database connected!");

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

    // Use the synchronous `run` method from better-sqlite3
    const stmt = db.prepare('UPDATE items SET name = ?, description = ? WHERE id = ?');
    try {
        stmt.run(name, description, id);  // Execute the update query
        req.flash('success', 'Item updated successfully!');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating item");
    }
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
