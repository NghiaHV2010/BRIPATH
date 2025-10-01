import OpenAI from "openai";
import { PrismaClient } from "../generated/prisma"
import { OPENAI_API_KEY } from "../config/env.config";

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

async function main() {
    // Danh sách role cần tạo
    const roles = ['User', 'Company', 'Admin'];

    for (const role of roles) {
        await prisma.roles.upsert({
            where: { role_name: role },
            update: {}, // nếu đã có thì không làm gì
            create: {
                role_name: role,
            },
        });
    }

    console.log('✅ Seeding roles done!');


    const questionsData = [
        {
            question: "Bạn thường cảm thấy hào hứng nhất khi tham gia hoạt động nào?",
        },
        {
            question: "Khi làm việc nhóm, vai trò nào khiến bạn thấy thoải mái nhất?",
        },
        {
            question: "Bạn thích môi trường làm việc như thế nào?",
        },
        {
            question: "Khi gặp vấn đề, bạn thường giải quyết bằng cách nào?",
        },
        {
            question: "Điều gì khiến bạn cảm thấy thỏa mãn sau khi hoàn thành công việc?",
        },
        {
            question: "Bạn mạnh nhất ở kỹ năng nào?",
        },
        {
            question: "Nếu có một ngày rảnh rỗi, bạn thích…",
        },
        {
            question: "Bạn coi trọng điều gì nhất ở công việc?",
        },
        {
            question: "Trong trường học, môn nào bạn thích nhất?",
        },
        {
            question: "Bạn hình dung công việc lý tưởng trong 5 năm tới như thế nào?",
        },
    ];

    // Xoá dữ liệu cũ để tránh bị trùng lặp
    await prisma.questions.deleteMany();

    // Tạo dữ liệu mới
    await prisma.questions.createMany({
        data: questionsData,
    });

    console.log("✅ Seed completed! 10 questions have been inserted.");

    // Lấy danh sách câu hỏi từ DB
    const questions = await prisma.questions.findMany();

    // Mapping câu hỏi với câu trả lời
    const answersData: { question: string; answers: string[] }[] = [
        {
            question: "Bạn thường cảm thấy hào hứng nhất khi tham gia hoạt động nào?",
            answers: [
                "Giải các bài toán logic hoặc lập trình.",
                "Thảo luận, thuyết trình, thuyết phục người khác.",
                "Vẽ, thiết kế, sáng tác nghệ thuật.",
                "Giúp đỡ người khác trong học tập hoặc cuộc sống.",
                "Tổ chức sự kiện, sắp xếp công việc.",
                "Khám phá khoa học, nghiên cứu.",
            ],
        },
        {
            question: "Khi làm việc nhóm, vai trò nào khiến bạn thấy thoải mái nhất?",
            answers: [
                "Lập kế hoạch, phân công công việc.",
                "Đưa ra ý tưởng sáng tạo, đổi mới.",
                "Chăm sóc tinh thần, hỗ trợ người khác.",
                "Giải quyết các vấn đề kỹ thuật.",
                "Quan sát, phân tích dữ liệu và báo cáo.",
                "Kết nối và duy trì quan hệ.",
            ],
        },
        {
            question: "Bạn thích môi trường làm việc như thế nào?",
            answers: [
                "Ổn định, ít thay đổi.",
                "Năng động, thử thách, cạnh tranh.",
                "Sáng tạo, tự do, ít gò bó.",
                "Công nghệ cao, nhiều dữ liệu.",
                "Tổ chức chuyên nghiệp, quy củ.",
                "Gắn bó với thiên nhiên, xã hội.",
            ],
        },
        {
            question: "Khi gặp vấn đề, bạn thường giải quyết bằng cách nào?",
            answers: [
                "Tìm dữ liệu, chứng cứ để phân tích.",
                "Hỏi ý kiến chuyên gia hoặc thảo luận với người khác.",
                "Tìm một hướng tiếp cận sáng tạo.",
                "Đưa ra quyết định nhanh chóng, thử nghiệm ngay.",
                "Làm theo quy trình chuẩn, ít rủi ro.",
                "Thử nghiệm công nghệ, mô phỏng bằng phần mềm.",
            ],
        },
        {
            question: "Điều gì khiến bạn cảm thấy thỏa mãn sau khi hoàn thành công việc?",
            answers: [
                "Mang lại lợi ích cho cộng đồng.",
                "Có sản phẩm sáng tạo độc đáo.",
                "Doanh số hoặc lợi nhuận tăng.",
                "Giải được một bài toán khó.",
                "Nhận được sự công nhận từ cấp trên, tổ chức.",
                "Tìm ra phát hiện mới trong nghiên cứu.",
            ],
        },
        {
            question: "Bạn mạnh nhất ở kỹ năng nào?",
            answers: [
                "Giao tiếp, thuyết phục.",
                "Lập trình, phân tích logic.",
                "Sáng tạo hình ảnh, ý tưởng.",
                "Chăm sóc, lắng nghe.",
                "Lập kế hoạch, tổ chức công việc.",
                "Tìm tòi nghiên cứu, viết báo cáo.",
            ],
        },
        {
            question: "Nếu có một ngày rảnh rỗi, bạn thích…",
            answers: [
                "Đọc sách, học thêm kiến thức.",
                "Vẽ, sáng tác nhạc, làm video.",
                "Chơi game, thử phần mềm mới.",
                "Tham gia hoạt động cộng đồng, từ thiện.",
                "Lập kế hoạch cho dự án kinh doanh.",
                "Đi du lịch khám phá, quan sát thiên nhiên.",
            ],
        },
        {
            question: "Bạn coi trọng điều gì nhất ở công việc?",
            answers: [
                "Ổn định, an toàn.",
                "Thu nhập cao, cơ hội thăng tiến.",
                "Không gian sáng tạo, thử nghiệm.",
                "Ý nghĩa, giúp ích cho xã hội.",
                "Phát triển kỹ năng công nghệ, chuyên môn.",
                "Tự do, cân bằng cuộc sống.",
            ],
        },
        {
            question: "Trong trường học, môn nào bạn thích nhất?",
            answers: [
                "Toán, Tin học.",
                "Văn, Nghệ thuật.",
                "Sinh, Hóa.",
                "Lịch sử, Địa lý.",
                "Kinh tế, Quản lý.",
                "Ngoại ngữ.",
            ],
        },
        {
            question: "Bạn hình dung công việc lý tưởng trong 5 năm tới như thế nào?",
            answers: [
                "Trở thành chuyên gia công nghệ, phân tích dữ liệu",
                "Là giáo viên hoặc người truyền cảm hứng.",
                "Có công ty hoặc dự án kinh doanh riêng.",
                "Nghệ sĩ / nhà sáng tạo nội dung.",
                "Làm việc trong bệnh viện hoặc tổ chức xã hội.",
                "Nhà nghiên cứu trong lĩnh vực mình yêu thích.",
            ],
        },
    ];

    // Xóa dữ liệu cũ
    await prisma.answers.deleteMany();

    // Thêm dữ liệu mới
    const vectorArray: number[][] = [];
    for (const q of answersData) {
        const question = questions.find((qq) => qq.question === q.question);
        if (!question) continue;

        q.answers.map(async (ans) => {
            const answer = await prisma.answers.create({
                data: {
                    answer: ans,
                    question_id: question.id
                }
            });

            const vector = await openai.embeddings.create({
                model: "text-embedding-3-large", // dimension = 3072
                input: ans,
            });

            const embedding = vector.data[0].embedding;
            vectorArray.push(embedding);

            await prisma.$queryRaw`UPDATE answers SET embedding=${embedding} WHERE id=${answer.id}`
        });
    }
    console.log("✅ Seed answers completed!");

    const jobCategory = [
        {
            job_category: "Kinh doanh & Quản trị",
            description: "Bao gồm các vai trò như nhân sự, kế toán và quản lý."
        },
        {
            job_category: "Chăm sóc sức khỏe",
            description: "Bao gồm các công việc như bác sĩ, y tá và dược sĩ."
        },
        {
            job_category: "Công nghệ",
            description: "Bao gồm phát triển phần mềm, khoa học dữ liệu và hỗ trợ CNTT."
        },
        {
            job_category: "Giáo dục",
            description: "Có các vai như giáo viên và giảng viên đại học."
        },
        {
            job_category: "Nghệ thuật & Thiết kế Sáng tạo",
            description: "Bao gồm các nhà thiết kế đồ họa, nhà báo và nhà sản xuất."
        },
        {
            job_category: "Xây dựng & Bất động sản",
            description: "Bao gồm các vai trò trong xây dựng, thiết kế và bảo trì các công trình."
        },
        {
            job_category: "Bán hàng & Tiếp thị",
            description: "Liên quan đến các vai trò tập trung vào việc quảng bá và bán sản phẩm hoặc dịch vụ."
        },
        {
            job_category: "Khách sạn & Sự kiện",
            description: "Bao gồm các công việc trong lĩnh vực thực phẩm và đồ uống, du lịch và quản lý sự kiện."
        },
    ];

    // Xóa dữ liệu cũ trước khi seed (nếu muốn)
    await prisma.jobCategories.deleteMany();

    // Seed dữ liệu
    for (const jobCate of jobCategory) {
        const data = await prisma.jobCategories.create({
            data: jobCate,
        });

        const vector = await openai.embeddings.create({
            model: "text-embedding-3-large", // dimension = 3072
            input: jobCate.job_category,
        });

        const embedding = vector.data[0].embedding;

        await prisma.$queryRaw`UPDATE "jobCategories" SET embedding=${embedding} WHERE id=${data.id}`;
    }

    console.log("✅ Seed jobcategories thành công!");


}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });