const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.get('/', itemController.getItems);          
router.get('/add', (req, res) => res.render('add')); 
router.post('/add', itemController.addItem);       
router.post('/delete/:id', itemController.deleteItem);

module.exports = router;
