import OpenAI from "openai";
import { PrismaClient } from "@prisma/client"
import { OPENAI_API_KEY } from "../config/env.config";

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

async function main() {
    // // Danh sách role cần tạo
    // const roles = ['User', 'Company', 'Admin'];

    // for (const role of roles) {
    //     await prisma.roles.upsert({
    //         where: { role_name: role },
    //         update: {}, // nếu đã có thì không làm gì
    //         create: {
    //             role_name: role,
    //         },
    //     });
    // }

    // console.log('✅ Seeding roles done!');


    // const questionsData = [
    //     {
    //         question: "Bạn thường cảm thấy hào hứng nhất khi tham gia hoạt động nào?",
    //     },
    //     {
    //         question: "Khi làm việc nhóm, vai trò nào khiến bạn thấy thoải mái nhất?",
    //     },
    //     {
    //         question: "Bạn thích môi trường làm việc như thế nào?",
    //     },
    //     {
    //         question: "Khi gặp vấn đề, bạn thường giải quyết bằng cách nào?",
    //     },
    //     {
    //         question: "Điều gì khiến bạn cảm thấy thỏa mãn sau khi hoàn thành công việc?",
    //     },
    //     {
    //         question: "Bạn mạnh nhất ở kỹ năng nào?",
    //     },
    //     {
    //         question: "Nếu có một ngày rảnh rỗi, bạn thích…",
    //     },
    //     {
    //         question: "Bạn coi trọng điều gì nhất ở công việc?",
    //     },
    //     {
    //         question: "Trong trường học, môn nào bạn thích nhất?",
    //     },
    //     {
    //         question: "Bạn hình dung công việc lý tưởng trong 5 năm tới như thế nào?",
    //     },
    // ];

    // // Xoá dữ liệu cũ để tránh bị trùng lặp
    // await prisma.questions.deleteMany();

    // // Tạo dữ liệu mới
    // await prisma.questions.createMany({
    //     data: questionsData,
    // });

    // console.log("✅ Seed completed! 10 questions have been inserted.");

    // // Lấy danh sách câu hỏi từ DB
    // const questions = await prisma.questions.findMany();

    // // Mapping câu hỏi với câu trả lời
    // const answersData: { question: string; answers: string[] }[] = [
    //     {
    //         question: "Bạn thường cảm thấy hào hứng nhất khi tham gia hoạt động nào?",
    //         answers: [
    //             "Giải các bài toán logic hoặc lập trình.",
    //             "Thảo luận, thuyết trình, thuyết phục người khác.",
    //             "Vẽ, thiết kế, sáng tác nghệ thuật.",
    //             "Giúp đỡ người khác trong học tập hoặc cuộc sống.",
    //             "Tổ chức sự kiện, sắp xếp công việc.",
    //             "Khám phá khoa học, nghiên cứu.",
    //         ],
    //     },
    //     {
    //         question: "Khi làm việc nhóm, vai trò nào khiến bạn thấy thoải mái nhất?",
    //         answers: [
    //             "Lập kế hoạch, phân công công việc.",
    //             "Đưa ra ý tưởng sáng tạo, đổi mới.",
    //             "Chăm sóc tinh thần, hỗ trợ người khác.",
    //             "Giải quyết các vấn đề kỹ thuật.",
    //             "Quan sát, phân tích dữ liệu và báo cáo.",
    //             "Kết nối và duy trì quan hệ.",
    //         ],
    //     },
    //     {
    //         question: "Bạn thích môi trường làm việc như thế nào?",
    //         answers: [
    //             "Ổn định, ít thay đổi.",
    //             "Năng động, thử thách, cạnh tranh.",
    //             "Sáng tạo, tự do, ít gò bó.",
    //             "Công nghệ cao, nhiều dữ liệu.",
    //             "Tổ chức chuyên nghiệp, quy củ.",
    //             "Gắn bó với thiên nhiên, xã hội.",
    //         ],
    //     },
    //     {
    //         question: "Khi gặp vấn đề, bạn thường giải quyết bằng cách nào?",
    //         answers: [
    //             "Tìm dữ liệu, chứng cứ để phân tích.",
    //             "Hỏi ý kiến chuyên gia hoặc thảo luận với người khác.",
    //             "Tìm một hướng tiếp cận sáng tạo.",
    //             "Đưa ra quyết định nhanh chóng, thử nghiệm ngay.",
    //             "Làm theo quy trình chuẩn, ít rủi ro.",
    //             "Thử nghiệm công nghệ, mô phỏng bằng phần mềm.",
    //         ],
    //     },
    //     {
    //         question: "Điều gì khiến bạn cảm thấy thỏa mãn sau khi hoàn thành công việc?",
    //         answers: [
    //             "Mang lại lợi ích cho cộng đồng.",
    //             "Có sản phẩm sáng tạo độc đáo.",
    //             "Doanh số hoặc lợi nhuận tăng.",
    //             "Giải được một bài toán khó.",
    //             "Nhận được sự công nhận từ cấp trên, tổ chức.",
    //             "Tìm ra phát hiện mới trong nghiên cứu.",
    //         ],
    //     },
    //     {
    //         question: "Bạn mạnh nhất ở kỹ năng nào?",
    //         answers: [
    //             "Giao tiếp, thuyết phục.",
    //             "Lập trình, phân tích logic.",
    //             "Sáng tạo hình ảnh, ý tưởng.",
    //             "Chăm sóc, lắng nghe.",
    //             "Lập kế hoạch, tổ chức công việc.",
    //             "Tìm tòi nghiên cứu, viết báo cáo.",
    //         ],
    //     },
    //     {
    //         question: "Nếu có một ngày rảnh rỗi, bạn thích…",
    //         answers: [
    //             "Đọc sách, học thêm kiến thức.",
    //             "Vẽ, sáng tác nhạc, làm video.",
    //             "Chơi game, thử phần mềm mới.",
    //             "Tham gia hoạt động cộng đồng, từ thiện.",
    //             "Lập kế hoạch cho dự án kinh doanh.",
    //             "Đi du lịch khám phá, quan sát thiên nhiên.",
    //         ],
    //     },
    //     {
    //         question: "Bạn coi trọng điều gì nhất ở công việc?",
    //         answers: [
    //             "Ổn định, an toàn.",
    //             "Thu nhập cao, cơ hội thăng tiến.",
    //             "Không gian sáng tạo, thử nghiệm.",
    //             "Ý nghĩa, giúp ích cho xã hội.",
    //             "Phát triển kỹ năng công nghệ, chuyên môn.",
    //             "Tự do, cân bằng cuộc sống.",
    //         ],
    //     },
    //     {
    //         question: "Trong trường học, môn nào bạn thích nhất?",
    //         answers: [
    //             "Toán, Tin học.",
    //             "Văn, Nghệ thuật.",
    //             "Sinh, Hóa.",
    //             "Lịch sử, Địa lý.",
    //             "Kinh tế, Quản lý.",
    //             "Ngoại ngữ.",
    //         ],
    //     },
    //     {
    //         question: "Bạn hình dung công việc lý tưởng trong 5 năm tới như thế nào?",
    //         answers: [
    //             "Trở thành chuyên gia công nghệ, phân tích dữ liệu",
    //             "Là giáo viên hoặc người truyền cảm hứng.",
    //             "Có công ty hoặc dự án kinh doanh riêng.",
    //             "Nghệ sĩ / nhà sáng tạo nội dung.",
    //             "Làm việc trong bệnh viện hoặc tổ chức xã hội.",
    //             "Nhà nghiên cứu trong lĩnh vực mình yêu thích.",
    //         ],
    //     },
    // ];

    // // Xóa dữ liệu cũ
    // await prisma.answers.deleteMany();

    // // Thêm dữ liệu mới
    // const vectorArray: number[][] = [];
    // for (const q of answersData) {
    //     const question = questions.find((qq) => qq.question === q.question);
    //     if (!question) continue;

    //     q.answers.map(async (ans) => {
    //         const answer = await prisma.answers.create({
    //             data: {
    //                 answer: ans,
    //                 question_id: question.id
    //             }
    //         });

    //         const vector = await openai.embeddings.create({
    //             model: "text-embedding-3-large", // dimension = 3072
    //             input: ans,
    //         });

    //         const embedding = vector.data[0].embedding;
    //         vectorArray.push(embedding);

    //         await prisma.$queryRaw`UPDATE answers SET embedding=${embedding} WHERE id=${answer.id}`
    //     });
    // }
    // console.log("✅ Seed answers completed!");

    // const jobCategory = [
    //     {
    //         job_category: "Công nghệ & Kỹ thuật",
    //         description: "Bao gồm IT, phần mềm, điện, cơ khí và tự động hóa."
    //     },
    //     {
    //         job_category: "Kinh doanh & Quản lý",
    //         description: "Bao gồm bán hàng, quản lý, khởi nghiệp và chuỗi cung ứng."
    //     },
    //     {
    //         job_category: "Tài chính & Kế toán",
    //         description: "Bao gồm ngân hàng, bảo hiểm, đầu tư và kiểm toán."
    //     },
    //     {
    //         job_category: "Marketing & Truyền thông",
    //         description: "Bao gồm quảng cáo, nội dung, thương mại điện tử và PR."
    //     },
    //     {
    //         job_category: "Giáo dục & Đào tạo",
    //         description: "Bao gồm giảng dạy, huấn luyện và nghiên cứu học thuật."
    //     },
    //     {
    //         job_category: "Y tế & Chăm sóc sức khỏe",
    //         description: "Bao gồm bác sĩ, y tá, dược sĩ và chăm sóc cá nhân."
    //     },
    //     {
    //         job_category: "Nghệ thuật & Thiết kế",
    //         description: "Bao gồm đồ họa, thời trang, âm nhạc và nhiếp ảnh."
    //     },
    //     {
    //         job_category: "Xây dựng & Kiến trúc",
    //         description: "Bao gồm thiết kế, thi công, giám sát và bất động sản."
    //     },
    //     {
    //         job_category: "Dịch vụ & Du lịch",
    //         description: "Bao gồm khách sạn, nhà hàng, hướng dẫn viên và vận tải."
    //     },
    //     {
    //         job_category: "Pháp lý & Hành chính",
    //         description: "Bao gồm luật, nhân sự, hành chính và công việc chính phủ."
    //     }
    // ]


    // // Xóa dữ liệu cũ trước khi seed (nếu muốn)
    // await prisma.jobCategories.deleteMany();

    // // Seed dữ liệu
    // for (const jobCate of jobCategory) {
    //     const data = await prisma.jobCategories.create({
    //         data: jobCate,
    //     });

    //     const vector = await openai.embeddings.create({
    //         model: "text-embedding-3-large", // dimension = 3072
    //         input: jobCate.job_category,
    //     });

    //     const embedding = vector.data[0].embedding;

    //     await prisma.$queryRaw`UPDATE "jobCategories" SET embedding=${embedding} WHERE id=${data.id}`;
    // }

    // console.log("✅ Seed jobcategories thành công!");

    // await prisma.jobSpecialized.deleteMany();
    // const jobCates = await prisma.jobCategories.findMany();

    // const jobSpecializedData = [
    //     {
    //         job_category: "Công nghệ & Kỹ thuật",
    //         job_types: [
    //             { job_type: "Phát triển phần mềm", description: "Lập trình viên, kỹ sư phần mềm, tester, devops." },
    //             { job_type: "Khoa học dữ liệu & AI", description: "Chuyên viên phân tích dữ liệu, kỹ sư machine learning." },
    //             { job_type: "Kỹ thuật điện & điện tử", description: "Kỹ sư điện, điện tử, viễn thông." },
    //             { job_type: "Cơ khí & Tự động hóa", description: "Thiết kế máy, sản xuất, robot và điều khiển tự động." },
    //             { job_type: "An ninh mạng & Hạ tầng", description: "Chuyên viên bảo mật, quản trị hệ thống, mạng máy tính." }
    //         ]
    //     },
    //     {
    //         job_category: "Kinh doanh & Quản lý",
    //         job_types: [
    //             { job_type: "Quản lý dự án", description: "Điều phối, lập kế hoạch và giám sát tiến độ dự án." },
    //             { job_type: "Phát triển kinh doanh", description: "Tìm kiếm cơ hội hợp tác và mở rộng thị trường." },
    //             { job_type: "Quản lý chuỗi cung ứng", description: "Điều phối logistics, kho bãi, và vận chuyển." },
    //             { job_type: "Khởi nghiệp", description: "Xây dựng, vận hành và phát triển doanh nghiệp mới." },
    //             { job_type: "Quản lý nhân sự", description: "Tuyển dụng, đào tạo và phát triển nhân viên." }
    //         ]
    //     },
    //     {
    //         job_category: "Tài chính & Kế toán",
    //         job_types: [
    //             { job_type: "Kế toán", description: "Ghi chép, kiểm tra và tổng hợp số liệu tài chính." },
    //             { job_type: "Kiểm toán", description: "Đảm bảo tính chính xác và tuân thủ trong báo cáo tài chính." },
    //             { job_type: "Ngân hàng", description: "Tín dụng, giao dịch khách hàng và quản lý rủi ro." },
    //             { job_type: "Đầu tư & Chứng khoán", description: "Phân tích thị trường, môi giới, quản lý danh mục đầu tư." },
    //             { job_type: "Bảo hiểm", description: "Tư vấn, thẩm định và xử lý yêu cầu bồi thường." }
    //         ]
    //     },
    //     {
    //         job_category: "Marketing & Truyền thông",
    //         job_types: [
    //             { job_type: "Marketing kỹ thuật số", description: "SEO, Google Ads, Facebook Ads, TikTok Ads." },
    //             { job_type: "Content Marketing", description: "Sáng tạo nội dung, viết bài, biên tập video." },
    //             { job_type: "Quan hệ công chúng (PR)", description: "Tổ chức sự kiện, truyền thông doanh nghiệp." },
    //             { job_type: "Thương mại điện tử", description: "Quản lý sàn TMĐT, tối ưu sản phẩm và chiến dịch." },
    //             { job_type: "Nghiên cứu thị trường", description: "Thu thập, phân tích dữ liệu hành vi người tiêu dùng." }
    //         ]
    //     },
    //     {
    //         job_category: "Giáo dục & Đào tạo",
    //         job_types: [
    //             { job_type: "Giảng viên", description: "Giảng dạy tại các trường đại học, cao đẳng." },
    //             { job_type: "Giáo viên phổ thông", description: "Giảng dạy tại trường tiểu học, trung học." },
    //             { job_type: "Huấn luyện viên kỹ năng", description: "Đào tạo kỹ năng mềm, kỹ năng nghề." },
    //             { job_type: "Chuyên viên đào tạo nội bộ", description: "Xây dựng chương trình và đào tạo nhân sự doanh nghiệp." },
    //             { job_type: "Nghiên cứu & học thuật", description: "Thực hiện nghiên cứu khoa học, xuất bản bài báo." }
    //         ]
    //     },
    //     {
    //         job_category: "Y tế & Chăm sóc sức khỏe",
    //         job_types: [
    //             { job_type: "Bác sĩ & Y tá", description: "Khám chữa bệnh, chăm sóc bệnh nhân." },
    //             { job_type: "Dược sĩ", description: "Cấp phát thuốc, tư vấn và kiểm tra dược phẩm." },
    //             { job_type: "Kỹ thuật viên y học", description: "Xét nghiệm, chẩn đoán hình ảnh, vật lý trị liệu." },
    //             { job_type: "Chăm sóc sức khỏe cộng đồng", description: "Truyền thông, phòng chống dịch bệnh." },
    //             { job_type: "Quản lý y tế", description: "Điều hành bệnh viện, phòng khám và hệ thống y tế." }
    //         ]
    //     },
    //     {
    //         job_category: "Nghệ thuật & Thiết kế",
    //         job_types: [
    //             { job_type: "Thiết kế đồ họa", description: "Sáng tạo hình ảnh, logo, ấn phẩm truyền thông." },
    //             { job_type: "Thiết kế thời trang", description: "Phát triển sản phẩm may mặc và phụ kiện." },
    //             { job_type: "Âm nhạc & Biểu diễn", description: "Ca sĩ, nhạc sĩ, đạo diễn sân khấu." },
    //             { job_type: "Nhiếp ảnh & Dựng phim", description: "Quay phim, chụp ảnh, hậu kỳ video." },
    //             { job_type: "Mỹ thuật & Truyền thông đa phương tiện", description: "Hội họa, điêu khắc, thiết kế tương tác." }
    //         ]
    //     },
    //     {
    //         job_category: "Xây dựng & Kiến trúc",
    //         job_types: [
    //             { job_type: "Kỹ sư xây dựng", description: "Thi công, kết cấu, giám sát công trình." },
    //             { job_type: "Kiến trúc sư", description: "Thiết kế nhà ở, đô thị, nội thất." },
    //             { job_type: "Quản lý dự án xây dựng", description: "Lập kế hoạch, giám sát và kiểm soát chi phí." },
    //             { job_type: "Kỹ sư cơ sở hạ tầng", description: "Giao thông, cầu đường, thoát nước." },
    //             { job_type: "Bất động sản", description: "Môi giới, đầu tư và phát triển dự án nhà đất." }
    //         ]
    //     },
    //     {
    //         job_category: "Dịch vụ & Du lịch",
    //         job_types: [
    //             { job_type: "Lễ tân & Quản lý khách sạn", description: "Tiếp đón, phục vụ và quản lý lưu trú." },
    //             { job_type: "Nhà hàng & Ẩm thực", description: "Đầu bếp, phục vụ, quản lý nhà hàng." },
    //             { job_type: "Hướng dẫn viên du lịch", description: "Dẫn đoàn, tổ chức tour du lịch." },
    //             { job_type: "Tổ chức sự kiện", description: "Lên kế hoạch và triển khai các chương trình." },
    //             { job_type: "Vận tải & Logistics", description: "Điều phối, giao hàng, và dịch vụ khách hàng." }
    //         ]
    //     },
    //     {
    //         job_category: "Pháp lý & Hành chính",
    //         job_types: [
    //             { job_type: "Luật sư & Tư vấn pháp lý", description: "Giải quyết tranh chấp, tư vấn pháp luật." },
    //             { job_type: "Nhân sự & Tuyển dụng", description: "Tuyển dụng, đào tạo và phúc lợi nhân viên." },
    //             { job_type: "Hành chính văn phòng", description: "Soạn thảo, lưu trữ hồ sơ, hỗ trợ điều hành." },
    //             { job_type: "Công chức nhà nước", description: "Thực hiện công việc hành chính tại cơ quan nhà nước." },
    //             { job_type: "Phiên dịch & Biên dịch", description: "Dịch tài liệu, hội thoại và đàm phán quốc tế." }
    //         ]
    //     }
    // ];

    // for (const jobSpec of jobSpecializedData) {
    //     const jobCate = jobCates.find((js) => js.job_category === jobSpec.job_category);
    //     if (!jobCate) continue;

    //     jobSpec.job_types.map(async (spec) => {
    //         const jobSpecialized = await prisma.jobSpecialized.create({
    //             data: {
    //                 job_type: spec.job_type,
    //                 description: spec.description,
    //                 jobcategory_id: jobCate.id
    //             }
    //         });

    //         const vector = await openai.embeddings.create({
    //             model: "text-embedding-3-large", // dimension = 3072
    //             input: spec.job_type,
    //         });

    //         const embedding = vector.data[0].embedding;

    //         await prisma.$queryRaw`UPDATE "jobSpecialized" SET embedding=${embedding} WHERE id=${jobSpecialized.id}`
    //     });
    // }
    // console.log("✅ Seed jobSpecialized completed!");

    // const fields = [
    //     "Công nghệ thông tin",
    //     "Thương mại điện tử",
    //     "Tài chính – Ngân hàng",
    //     "Bảo hiểm",
    //     "Bất động sản",
    //     "Xây dựng – Kiến trúc",
    //     "Sản xuất – Chế tạo",
    //     "Nông nghiệp – Lâm nghiệp – Thủy sản",
    //     "Năng lượng – Điện lực",
    //     "Vận tải – Logistics",
    //     "Giáo dục – Đào tạo",
    //     "Y tế – Chăm sóc sức khỏe",
    //     "Dược phẩm – Sinh học",
    //     "Du lịch – Nhà hàng – Khách sạn",
    //     "Truyền thông – Quảng cáo – Marketing",
    //     "Thiết kế – Mỹ thuật – Sáng tạo",
    //     "Luật – Tư vấn pháp lý",
    //     "Nhân sự – Tuyển dụng",
    //     "Hàng tiêu dùng – FMCG",
    //     "Thời trang – Làm đẹp – Mỹ phẩm",
    //     "Xuất nhập khẩu",
    //     "Môi trường – Tài nguyên",
    //     "Khoa học – Nghiên cứu & Phát triển",
    //     "Viễn thông",
    //     "Phi lợi nhuận – Tổ chức xã hội"
    // ];

    // for (const name of fields) {
    //     await prisma.fields.upsert({
    //         where: { field_name: name },
    //         update: {},
    //         create: { field_name: name },
    //     });
    // }

    // console.log("✅ Seeded company fields successfully!");


    await prisma.membershipPlans.createMany({
        data: [
            {
                plan_name: 'TRIAL EMPLOYER',
                description: 'Gói dùng thử – phù hợp người dùng cơ bản có nhu cầu tìm kiếm cộng tác viên / tình nguyện viên cho sự kiện hoặc công việc ngắn hạn.',
                price: 49000,
                duration_months: 1,
                is_active: true,
                urgent_jobs_limit: 0,
                quality_jobs_limit: 0,
                total_jobs_limit: 1,
                ai_matchings: false,
                ai_networking_limit: 0,
                verified_badge: false,
                recommended_labels: false,
                highlighted_hot_jobs: false,
            },
            {
                plan_name: 'BASIC EMPLOYER',
                description: 'Phù hợp với doanh nghiệp nhỏ, cần tuyển dụng thường xuyên với ngân sách hợp lý.',
                price: 990000,
                duration_months: 1,
                is_active: true,
                urgent_jobs_limit: 3,
                quality_jobs_limit: 5,
                total_jobs_limit: 10,
                ai_matchings: true,
                ai_networking_limit: 5,
                verified_badge: true,
                recommended_labels: false,
                highlighted_hot_jobs: false,
            },
            {
                plan_name: 'VIP EMPLOYER',
                description: 'Dành cho doanh nghiệp mở rộng quy mô, cần thu hút ứng viên chất lượng cao.',
                price: 2990000,
                duration_months: 4,
                is_active: true,
                urgent_jobs_limit: 12,
                quality_jobs_limit: 25,
                total_jobs_limit: 50,
                ai_matchings: true,
                ai_networking_limit: 10,
                verified_badge: true,
                recommended_labels: true,
                highlighted_hot_jobs: false,
            },
            {
                plan_name: 'PREMIUM EMPLOYER',
                description: 'Gói toàn diện dành cho doanh nghiệp có nhu cầu tuyển dụng liên tục & xây dựng thương hiệu lâu dài.',
                price: 5990000,
                duration_months: 12,
                is_active: true,
                urgent_jobs_limit: 36,
                quality_jobs_limit: 75,
                total_jobs_limit: 150,
                ai_matchings: true,
                ai_networking_limit: 12,
                verified_badge: true,
                recommended_labels: true,
                highlighted_hot_jobs: false,
            }
        ],
    });

    // Thêm features cho từng gói
    const plans = await prisma.membershipPlans.findMany();
    for (const plan of plans) {
        const featureList = [];
        if (plan.plan_name === 'TRIAL EMPLOYER') {
            featureList.push(
                { feature_name: 'Đăng tải tin cho sự kiện hoặc công việc lên hệ thống', plan_id: plan.id },
                { feature_name: 'Tối đa 01 tin đăng/tháng', plan_id: plan.id },
                { feature_name: 'Phê duyệt các ứng viên', plan_id: plan.id },
            );
        }

        if (plan.plan_name === 'BASIC EMPLOYER') {
            featureList.push(
                { feature_name: 'Tối đa 03 tin Việc gấp/tháng', plan_id: plan.id },
                { feature_name: 'Tối đa 05 tin Việc chất/tháng', plan_id: plan.id },
                { feature_name: 'AI Auto Matching, lọc các hồ sơ đã ứng tuyển phù hợp với công việc', plan_id: plan.id },
                { feature_name: 'AI Networking, đề xuất các hồ sơ(trong hệ thống) phù hợp với công việc (tối đa 5 hồ sơ/công việc)', plan_id: plan.id },
                { feature_name: 'Dấu tích xanh', plan_id: plan.id },
            );
        }

        if (plan.plan_name === 'VIP EMPLOYER') {
            featureList.push(
                { feature_name: 'Đăng 12 tin Việc gấp/4 tháng', plan_id: plan.id },
                { feature_name: 'Đăng 25 tin Việc chất/4 tháng', plan_id: plan.id },
                { feature_name: 'AI Auto Matching, lọc các hồ sơ đã ứng tuyển phù hợp với công việc', plan_id: plan.id },
                { feature_name: 'AI Networking, đề xuất các hồ sơ(trong hệ thống) phù hợp với công việc (tối đa 10 hồ sơ/công việc)', plan_id: plan.id },
                { feature_name: 'Hồ sơ doanh nghiệp được gắn nhãn đề xuất, tự động đề xuất trên trang chủ và trang chi tiết công việc', plan_id: plan.id },
                { feature_name: 'Dấu tích xanh', plan_id: plan.id },
            );
        }

        if (plan.plan_name === 'PREMIUM EMPLOYER') {
            featureList.push(
                { feature_name: '40 tin đặc biệt/tháng', plan_id: plan.id },
                { feature_name: 'AI Auto Matching, lọc các hồ sơ đã ứng tuyển phù hợp với công việc nâng cao', plan_id: plan.id },
                { feature_name: 'AI Networking, đề xuất các hồ sơ(trong hệ thống) phù hợp với công việc (tối đa 12 hồ sơ/công việc)', plan_id: plan.id },
                { feature_name: 'Hồ sơ doanh nghiệp được gắn nhãn đề xuất, tự động đề xuất trên trang chủ và trang chi tiết công việc', plan_id: plan.id },
                { feature_name: 'Dấu tích xanh', plan_id: plan.id },
            );
        }

        await prisma.features.createMany({ data: featureList });
    }

    console.log('✅ Seed pricing plan data inserted successfully!');

    const tagsData = [
        "Đề xuất",
        "Hàng đầu",
        "Đa quốc gia",
        "Đánh giá cao"
    ]

    for (const tag of tagsData) {
        await prisma.tags.upsert({
            where: { label_name: tag },
            update: {},
            create: { label_name: tag },
        });
    }

    console.log("✅ Seeded tags successfully!");

    const jobLabelsData = [
        {
            label_name: "Việc chất",
            duration_days: 30,
        },
        {
            label_name: "Việc gấp",
            duration_days: 15,
        },
        {
            label_name: "Việc Hot",
            duration_days: 30,
        },
    ]

    for (const label of jobLabelsData) {
        await prisma.jobLabels.upsert({
            where: { label_name: label.label_name },
            update: {},
            create: {
                label_name: label.label_name,
                duration_days: label.duration_days,
            },
        });
    }

    console.log("✅ Seeded job labels successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });