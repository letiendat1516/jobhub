import * as configService from '../services/systemConfigurationService.js';

export const getAllConfigurations = async (
    req,
    res,
    next,
) => {
    try {
        const configurations =
            await configService.getAllConfigurations();

        return res.status(200).json({
            success: true,
            data: configurations,
        });
    } catch (error) {
        console.error(
            'GET SYSTEM CONFIGURATIONS ERROR:',
            error,
        );

        next(error);
    }
};

export const getConfigurationByKey = async (
    req,
    res,
    next,
) => {
    try {
        const configKey =
            req.params.key.toUpperCase();

        const configuration =
            await configService.getConfigurationByKey(
                configKey,
            );

        return res.status(200).json({
            success: true,
            data: configuration,
        });
    } catch (error) {
        console.error(
            'GET CONFIGURATION BY KEY ERROR:',
            error,
        );

        next(error);
    }
};

export const updateConfiguration = async (
    req,
    res,
    next,
) => {
    try {
        const configKey =
            req.params.key.toUpperCase();

        const { value } = req.body;

        if (
            value === undefined ||
            value === null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Giá trị cấu hình là bắt buộc.',
            });
        }

        const configuration =
            await configService.updateConfiguration(
                configKey,
                value,
            );

        return res.status(200).json({
            success: true,
            message:
                'Cập nhật cấu hình hệ thống thành công.',
            data: configuration,
        });
    } catch (error) {
        console.error(
            'UPDATE SYSTEM CONFIGURATION ERROR:',
            error,
        );

        next(error);
    }
};