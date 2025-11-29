import { prisma } from "../libs/prisma";
import { HTTP_ERROR } from "../constants/httpCode";
import { errorHandler } from "../utils/error";
import { createNotificationData } from "../utils";
import { CreateCompanyRequestDto } from "../types/company.types";
import { activityRepository } from "../repositories/activity.repository";
import { PrismaClient } from "@prisma/client";
import { userNotificationRepository } from "../repositories/userNotification.repository";
import { userRepository } from "../repositories/user.repository";
import { companyFieldRepository } from "../repositories/companyField.repository";
import { companyRepository } from "../repositories/company.repository";

export const createCompanyService = async (user_id: string, company_id: string, data: CreateCompanyRequestDto) => {
    const validateFaxCodeUrl = `https://api.vietqr.io/v2/business/${data.fax_code}`;

    try {
        await Promise.all([
            // Validate mã số thuế (fax_code)
            (async () => {
                const response = await fetch(
                    `${validateFaxCodeUrl}`,
                    { method: "GET", headers: { "Content-Type": "application/json" } }
                );
                const responseData = await response.json() as { data: any };

                if (!responseData.data) {
                    throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Mã số thuế không hợp lệ!");
                }
            })(),

            // Validate lĩnh vực
            (async () => {
                const fieldData = await companyFieldRepository.findByName(data.field);

                if (!fieldData) {
                    throw errorHandler(HTTP_ERROR.BAD_REQUEST, "Lĩnh vực không hợp lệ!");
                }
            })(),

            // Validate user (2FA + trạng thái hồ sơ)
            (async () => {
                const user = await userRepository.findById(user_id, company_id);

                if (!user?.is_2fa_enabled) {
                    throw errorHandler(HTTP_ERROR.FORBIDDEN, "Bạn chưa bật xác thực hai yếu tố!");
                }

                if (user.companies && (user.companies.status === "pending" || user.companies.status === "approved")) {
                    throw errorHandler(HTTP_ERROR.FORBIDDEN, "Hồ sơ của bạn đang hoặc đã được phê duyệt!");
                }
            })()
        ]);

        const notificationData = createNotificationData(
            undefined,
            undefined,
            "system",
            "company"
        );

        const result = await prisma.$transaction(async (tx: PrismaClient) => {
            const [company] = await Promise.all([
                companyRepository.upsert(tx, data, user_id, company_id),

                activityRepository.create(tx, user_id, "Bạn đã tạo tài khoản doanh nghiệp."),

                userNotificationRepository.create(tx, { ...notificationData, user_id })
            ]);

            return company;
        });

        return result;
    } catch (error) {
        throw error;
    }
}