const MenuService = require('../services/menuService')

const MenuController = {
    getMenu: async (req, res) => {
        try {
            const filters = {
                q: req.query.q,
                category: req.query.category,
                min_price: req.query.min_price,
                max_price: req.query.max_price,
                max_cal: req.query.max_cal,
                page: req.query.page,
                per_page: req.query.per_page,
                sort: req.query.sort
            }

            const { data, pagination } = await MenuService.getAll(filters)

            res.json({
                message: "Get all menu",
                data,
                pagination
            })
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    },

    createMenu: async (req, res) => {
        try {
            const data = req.body

            const addMenu = await MenuService.create(data)

            res.status(201).json({
                message: "Menu berhasil ditambahkan",
                data: addMenu
            })
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }

    },

    getMenubyId: async (req, res) => {
        try {
            const id = req.params.id

            const menu = await MenuService.getById(id)

            if (!menu) {
                return res.status(404).json({
                    message: "Menu tidak ditemukan"
                })
            }

            res.json({
                message: "Get menu berdasarkan id",
                data: menu
            })

        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    },

    updateMenu: async (req, res) => {
        try {
            const id = req.params.id
            const body = req.body

            const exist = await MenuService.getById(id)

            if (!exist) return res.status(404).json({
                message: "Menu tidak ditemukan"
            })

            const updated = await MenuService.update(id, body)

            res.json({
                message: "Menu berhasil diperbarui", data: updated
            })

        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    },

    deleteMenu: async (req, res) => {
        try {
            const id = req.params.id
            const exist = await MenuService.getById(id)

            if (!exist) return res.status(404).json({
                message: "Menu tidak ditemukan"
            })

            await MenuService.delete(id)
            res.json({
                message: "Menu berhasil dihapus"
            })

        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    },

    groupByCategory: async (req, res) => {
        try {
            const mode = req.query.mode
            const perCategory = req.query.per_category
            const data = await MenuService.groupByCategory(mode, perCategory)

            res.json({
                message: "Group berdasarkan kategori",
                data: data
            })
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    },

    searchMenu: async (req, res) => {
        try {
            const search = {
                q: req.query.q,
                page: req.query.page,
                per_page: req.query.per_page
            }

            const { data, pagination } = await MenuService.getBySearch(search)

            res.json({
                message: "Menu berhasil ditemukan",
                data,
                pagination
            })

        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    },

    chatHelper: async (req, res) => {
        try {
            const question = req.body.question

            if (!question) {
                return res.status(400).json({
                    message: "Isi pertanyaan sebelum mengirim ya!"
                })
            }

            const answer = await MenuService.chatHelper(question)

            res.json({
                message: "AI response",
                question,
                answer
            })
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }

    }
}

module.exports = MenuController