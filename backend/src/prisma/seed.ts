import { PrismaClient } from "../generated/prisma"

const prisma = new PrismaClient();

async function main() {
    // Danh sách role cần tạo
    const roles = ['User', 'Company', 'Admin']

    for (const role of roles) {
        await prisma.roles.upsert({
            where: { role_name: role },
            update: {}, // nếu đã có thì không làm gì
            create: {
                role_name: role,
            },
        })
    }

    console.log('✅ Seeding roles done!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
