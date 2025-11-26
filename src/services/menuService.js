const prisma = require('../utils/prisma')
const { GoogleGenAI } = require('@google/genai')

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const MenuService = {
    getAll: async (filters) => {
        const page = Number(filters.page) || 1
        const perPage = Number(filters.per_page) || 10
        const skip = (page - 1) * perPage

        const where = {}

        if (filters.q) {
            where.name = {
                contains: filters.q
            }
        }

        if (filters.category) {
            where.category = filters.category
        }

        if (filters.min_price || filters.max_price) {
            where.price = {}
            if (filters.min_price) where.price.gte = Number(filters.min_price)
            if (filters.max_price) where.price.lte = Number(filters.max_price)
        }

        if (filters.max_cal) {
            where.calories = {
                lte: Number(filters.max_cal)
            }
        }

        let orderBy = {}
        if (filters.sort) {
            const [field, direction] = filters.sort.split(":")
            orderBy = { [field]: direction }
        }

        const total = await prisma.menu.count({ where })

        const data = await prisma.menu.findMany({
            where,
            orderBy,
            skip,
            take: perPage
        })

        return {
            data,
            pagination: {
                total,
                page: page,
                per_page: perPage,
                total_pages: Math.ceil(total / perPage)
            }
        }
    },

    getById: (id) => {
        return prisma.menu.findUnique({
            where: { id: Number(id) }
        })
    },

    create: (data) => {
        return prisma.menu.create({
            data: {
                name: data.name,
                category: data.category,
                price: data.price,
                calories: data.calories,
                ingredients: data.ingredients,
                description: data.description
            }
        })
    },

    update: (id, data) => {
        return prisma.menu.update({
            where: { id: Number(id) },
            data: {
                name: data.name,
                category: data.category,
                price: data.price,
                calories: data.calories,
                ingredients: data.ingredients,
                description: data.description
            }
        })
    },

    delete: (id) => {
        return prisma.menu.delete({
            where: { id: Number(id) }
        })
    },

    groupByCategory: async (mode, perCategory) => {
        if (mode === "count") {
            const result = await prisma.menu.groupBy({
                by: ["category"],
                _count: { id: true }
            })

            const data = {}

            for (const item of result) {
                data[item.category] = item._count.id
            }

            return data
        }

        if (mode === "list") {
            const categories = await prisma.menu.findMany({
                distinct: ["category"],
                select: {
                    category: true
                }
            })

            const data = {}

            for (const item of categories) {
                const category = item.category

                const menus = await prisma.menu.findMany({
                    where: { category },
                    take: Number(perCategory)
                })

                data[category] = menus
            }

            return data;
        }
    },

    getBySearch: async (search) => {
        const page = Number(search.page) || 1
        const perPage = Number(search.per_page) || 10
        const skip = (page - 1) * perPage

        const filters = {}

        if (search.q) {
            filters.name = {
                contains: search.q
            }
        }

        const total = await prisma.menu.count({
            where: filters
        })

        const result = await prisma.menu.findMany({
            where: filters,
            skip,
            take: perPage
        })

        return {
            pagination: {
                page,
                per_page: perPage,
                total,
                total_pages: Math.ceil(total / perPage)
            },
            data: result
        }
    },

    chatHelper: async (question) => {
        const menus = await prisma.menu.findMany()

        const menuList = menus.map(m => `${m.name} (category: ${m.category}, price: ${m.price})`).join("\n")

        const prompt = `
        Kamu adalah AI Chat Helper untuk Restoran
        Berikut adalah daftar menu restorannya:

        ${menuList}

        Tugasmu:
        - Jawab pertanyaan user dengan menu 
        - Beri rekomendasi bila diminta
        - Jawab singkat tapi ramah (2-3 kalimat)
        - Jangan jawab yang tidak terkait dengan menu

        Pertanyaan user:
        "${question}"
        `

        async function main() {
            const response = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    { text: prompt }
                ]
            })

            return response.text
        }

        await main()
    }
}

module.exports = MenuService
