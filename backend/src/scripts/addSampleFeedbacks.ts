import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function addSampleFeedbacks() {
    try {
        // Lấy danh sách công ty đã được phê duyệt
        const companies = await prisma.companies.findMany({
            where: {
                status: "approved"
            },
            select: {
                id: true,
                users: {
                    select: {
                        username: true
                    }
                }
            },
            take: 3 // Lấy 3 công ty đầu tiên
        });

        if (companies.length === 0) {
            console.log("❌ Không có công ty nào được phê duyệt trong database");
            return;
        }

        // Lấy danh sách user để tạo feedback
        const users = await prisma.users.findMany({
            where: {
                role_id: 1 // User role
            },
            select: {
                id: true,
                username: true,
                gender: true,
                avatar_url: true
            },
            take: 20
        });

        if (users.length === 0) {
            console.log("❌ Không có user nào trong database");
            return;
        }

        console.log(`📊 Tìm thấy ${companies.length} công ty và ${users.length} users`);

        // Dữ liệu feedback mẫu
        const sampleFeedbacks = [
            {
                stars: 5,
                description: "Công ty có môi trường làm việc rất tốt, đồng nghiệp thân thiện và hỗ trợ lẫn nhau. Lãnh đạo luôn lắng nghe ý kiến của nhân viên và tạo điều kiện phát triển.",
                work_environment: "Môi trường làm việc năng động, sáng tạo. Có không gian làm việc thoải mái với đầy đủ trang thiết bị hiện đại.",
                benefit: "Lương thưởng cạnh tranh, bảo hiểm đầy đủ, nghỉ phép linh hoạt, có chương trình đào tạo nâng cao kỹ năng."
            },
            {
                stars: 4,
                description: "Công ty có tiềm năng phát triển tốt, dự án thú vị và đa dạng. Tuy nhiên cần cải thiện thêm về quy trình làm việc và giao tiếp nội bộ.",
                work_environment: "Văn phòng hiện đại, có khu vực nghỉ ngơi và thư giãn. Tuy nhiên đôi khi hơi ồn ào.",
                benefit: "Lương ổn định, có thưởng dự án, bảo hiểm sức khỏe. Cần cải thiện thêm về phúc lợi khác."
            },
            {
                stars: 5,
                description: "Rất hài lòng với công ty này. Có cơ hội học hỏi nhiều, được giao việc phù hợp với khả năng. Đồng nghiệp và sếp đều rất tốt.",
                work_environment: "Môi trường làm việc chuyên nghiệp, có sự cân bằng giữa công việc và cuộc sống. Được khuyến khích sáng tạo và đưa ra ý tưởng mới.",
                benefit: "Gói phúc lợi toàn diện: lương cao, thưởng hiệu suất, bảo hiểm, du lịch công ty, đào tạo kỹ năng."
            },
            {
                stars: 3,
                description: "Công ty ổn, có những điểm tốt và chưa tốt. Lương phù hợp nhưng áp lực công việc khá cao. Cần cân nhắc kỹ trước khi ứng tuyển.",
                work_environment: "Văn phòng đẹp nhưng đôi khi hơi căng thẳng. Cần cải thiện về work-life balance.",
                benefit: "Lương cạnh tranh, có thưởng cuối năm. Tuy nhiên phúc lợi khác còn hạn chế."
            },
            {
                stars: 4,
                description: "Công ty có văn hóa doanh nghiệp tốt, chú trọng phát triển nhân tài. Dự án đa dạng giúp mở rộng kiến thức và kỹ năng.",
                work_environment: "Môi trường làm việc tích cực, có sự hỗ trợ từ đồng nghiệp và quản lý. Được khuyến khích đưa ra ý kiến và sáng kiến.",
                benefit: "Chế độ đãi ngộ tốt, có chương trình đào tạo và phát triển nghề nghiệp. Bảo hiểm và phúc lợi đầy đủ."
            },
            {
                stars: 5,
                description: "Công ty tuyệt vời! Có cơ hội thăng tiến rõ ràng, được đào tạo bài bản và có môi trường làm việc rất tích cực. Rất recommend!",
                work_environment: "Văn phòng hiện đại, có khu vực teamwork và cá nhân. Được trang bị đầy đủ công cụ làm việc.",
                benefit: "Gói lương thưởng hấp dẫn, bảo hiểm toàn diện, có chương trình du lịch và team building thường xuyên."
            },
            {
                stars: 4,
                description: "Công ty có tiềm năng, dự án thú vị và đa dạng. Đồng nghiệp thân thiện, sếp quan tâm đến nhân viên. Tuy nhiên cần cải thiện về quy trình.",
                work_environment: "Môi trường làm việc thoải mái, có sự linh hoạt về thời gian. Được khuyến khích sáng tạo và đổi mới.",
                benefit: "Lương ổn định, có thưởng dự án và hiệu suất. Bảo hiểm sức khỏe và các phúc lợi cơ bản."
            },
            {
                stars: 3,
                description: "Công ty ổn định, có những ưu điểm nhưng cũng có những hạn chế. Cần cân nhắc kỹ về mục tiêu nghề nghiệp trước khi quyết định.",
                work_environment: "Văn phòng cơ bản, cần cải thiện về trang thiết bị và không gian làm việc.",
                benefit: "Lương cạnh tranh nhưng phúc lợi còn hạn chế. Cần cải thiện thêm về chế độ đãi ngộ."
            }
        ];

        // Xóa feedback cũ (nếu có)
        await prisma.feedbacks.deleteMany({});

        let feedbackCount = 0;

        // Tạo feedback cho mỗi công ty
        for (const company of companies) {
            console.log(`\n🏢 Thêm feedback cho công ty: ${company.users?.username}`);
            
            // Tạo 2-4 feedback cho mỗi công ty
            const numFeedbacks = Math.floor(Math.random() * 3) + 2; // 2-4 feedbacks
            
            for (let i = 0; i < numFeedbacks; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomFeedback = sampleFeedbacks[Math.floor(Math.random() * sampleFeedbacks.length)];
                
                // Tạo ngày ngẫu nhiên trong 6 tháng qua
                const randomDate = new Date();
                randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 180));
                
                try {
                    await prisma.feedbacks.create({
                        data: {
                            user_id: randomUser.id,
                            company_id: company.id,
                            stars: randomFeedback.stars,
                            description: randomFeedback.description,
                            work_environment: randomFeedback.work_environment,
                            benefit: randomFeedback.benefit,
                            created_at: randomDate
                        }
                    });
                    
                    feedbackCount++;
                    console.log(`  ✅ Đã thêm feedback từ ${randomUser.username} (${randomFeedback.stars}⭐)`);
                } catch (error) {
                    console.log(`  ❌ Lỗi khi thêm feedback: ${error}`);
                }
            }
        }

        console.log(`\n🎉 Hoàn thành! Đã thêm ${feedbackCount} feedback mẫu cho ${companies.length} công ty`);
        
        // Hiển thị thống kê
        const totalFeedbacks = await prisma.feedbacks.count();
        const avgRating = await prisma.feedbacks.aggregate({
            _avg: {
                stars: true
            }
        });
        
        console.log(`\n📊 Thống kê:`);
        console.log(`   - Tổng số feedback: ${totalFeedbacks}`);
        console.log(`   - Đánh giá trung bình: ${avgRating._avg.stars?.toFixed(1)}⭐`);

    } catch (error) {
        console.error("❌ Lỗi khi thêm feedback mẫu:", error);
    } finally {
        await prisma.$disconnect();
    }
}

addSampleFeedbacks();
