const express = require('express')
const router = express.Router()
const MenuController = require('../controllers/menuController')

router.get('/', MenuController.getMenu)
router.get('/group-by-category', MenuController.groupByCategory)
router.get('/search', MenuController.searchMenu)
router.get('/:id', MenuController.getMenubyId)
router.post('/', MenuController.createMenu)
router.post('/ai/chat', MenuController.chatHelper)
router.put('/:id', MenuController.updateMenu)
router.delete('/:id', MenuController.deleteMenu)

module.exports = router