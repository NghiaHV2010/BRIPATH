import { NextFunction, Request, Response } from "express";
import { HTTP_ERROR, HTTP_SUCCESS } from "../constants/httpCode";
import { errorHandler } from "../utils/error";
import { prisma } from "../libs/prisma";

/**
 * GET /api/settings/:userId
 * Trả về danh sách setting cho user
 */
export const getUserSettings = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user_id = req.user.id;

    // @ts-ignore
    const role_name = req.user.roles.role_name;

    try {
        // Lấy danh sách setting cho role tương ứng hoặc all (role = null)
        const settingsList = await prisma.settings.findMany({
            where: {
                OR: [
                    { role: role_name },
                    { role: null },
                ],
            },
            include: {
                settingsOptions: true,
            },
        });
        // Kiểm tra xem user đã có userSettings chưa
        for (const setting of settingsList) {
            const existing = await prisma.userSettings.findFirst({
                where: { user_id, setting_id: setting.id },
            });

            // Nếu chưa có thì khởi tạo giá trị mặc định
            if (!existing) {
                const defaultOption = setting.settingsOptions.find((opt) => opt.is_default);

                await prisma.userSettings.create({
                    data: {
                        user_id,
                        setting_id: setting.id,
                        setting_option_id: defaultOption ? defaultOption.id : null,
                    },
                });
            }
        }

        // Trả kết quả(bao gồm cả custom_value nếu có)
        const userSettings = await prisma.userSettings.findMany({
            where: { user_id },
            include: {
                settings: {
                    include: { settingsOptions: true },
                },
                settingsOptions: true,
            },
        });

        const formatted = userSettings.map((us) => ({
            id: us.id,
            key: us.settings.key,
            name: us.settings.name,
            type: us.settings.type,
            options: us.settings.settingsOptions,
            selectedOption: us.settingsOptions?.option || null,
            customValue: us.custom_value || null,
            role: us.settings.role,
        }));

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        next(error);
    }
};


/**
 * PUT /api/settings
 * body: { settingKey: string, optionId?: number, customValue?: string }
 */
export const updateUserSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const user_id = req.user.id;
        const { settingKey, optionId, customValue } = req.body;

        const isUserSettingExists = await prisma.userSettings.findFirst({
            where: {
                user_id,
                settings: {
                    key: settingKey
                }
            },
        });

        if (!isUserSettingExists)
            return next(errorHandler(HTTP_ERROR.NOT_FOUND, "Không tìm thấy setting"));

        const userSetting = await prisma.userSettings.update({
            where: { id: isUserSettingExists.id },
            data: {
                setting_option_id: optionId || null,
                custom_value: customValue || null,
            },
        });

        return res.status(HTTP_SUCCESS.OK).json({
            success: true,
            data: userSetting,
        });

    } catch (error) {
        next(error);
    }
};


/**
 * GET /api/settings/:userId
 * Trả về danh sách setting cho user
 */
export const mockUserSettings = async (req: Request, res: Response, next: NextFunction) => {

    try {
        let count = 0;

        const usersList = await prisma.users.findMany({
            include: { roles: true },
        });

        for (const user of usersList) {
            console.log(++count, '/', usersList.length);

            // Lấy danh sách setting cho role tương ứng hoặc all (role = null)
            const settingsList = await prisma.settings.findMany({
                where: {
                    OR: [
                        { role: user.roles.role_name }, // user chỉ thấy setting cùng role
                        { role: null }, // hoặc setting chung cho tất cả
                    ],
                },
                include: {
                    settingsOptions: true,
                },
            });
            // Kiểm tra xem user đã có userSettings chưa
            for (const setting of settingsList) {
                const existing = await prisma.userSettings.findFirst({
                    where: { user_id: user.id, setting_id: setting.id },
                });

                // Nếu chưa có thì khởi tạo giá trị mặc định
                if (!existing) {
                    const defaultOption = setting.settingsOptions.find((opt) => opt.is_default);

                    await prisma.userSettings.create({
                        data: {
                            user_id: user.id,
                            setting_id: setting.id,
                            setting_option_id: defaultOption ? defaultOption.id : null,
                        },
                    });
                }
            }
        }


        return res.status(200).json({
            message: "User settings retrieved successfully",
            // data: formatted,
        });
    } catch (error) {
        next(error);
    }
};
