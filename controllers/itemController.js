const db = require('../models/database');

exports.getItems = (req, res) => {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Items per page
    const offset = (page - 1) * limit;

    db.all('SELECT COUNT(*) AS count FROM items', [], (err, result) => {
        if (err) {
            console.error(err.message);
            return res.status(500).render('error', { message: 'Failed to fetch items.' });
        }
        const totalItems = result[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        const sql = query
            ? 'SELECT * FROM items WHERE name LIKE ? OR description LIKE ? LIMIT ? OFFSET ?'
            : 'SELECT * FROM items LIMIT ? OFFSET ?';
        const params = query
            ? [`%${query}%`, `%${query}%`, limit, offset]
            : [limit, offset];

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).render('error', { message: 'Failed to fetch items.' });
            }
            res.render('index', { items: rows, query, page, totalPages });
        });
    });
};

exports.addItem = (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        req.flash('error', 'Name is required.');
        return res.redirect('/');
    }
    db.run('INSERT INTO items (name, description) VALUES (?, ?)', [name, description], function (err) {
        if (err) {
            req.flash('error', 'Failed to add item.');
            return res.redirect('/');
        }
        req.flash('success', 'Item added successfully!');
        res.redirect('/');
    });
};

exports.deleteItem = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM items WHERE id = ?', [id], function (err) {
        if (err) {
            req.flash('error', 'Failed to delete item.');
            return res.redirect('/');
        }
        req.flash('success', 'Item deleted successfully!');
        res.redirect('/');
    });
};
