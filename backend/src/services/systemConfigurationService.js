import * as configRepository from '../repositories/systemConfigurationRepository.js';

const createError = (
    message,
    statusCode,
) => {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
};

const parseConfigValue = (config) => {
    if (!config) {
        return null;
    }

    switch (config.value_type) {
        case 'NUMBER':
            return Number(
                config.config_value,
            );

        case 'BOOLEAN':
            return (
                config.config_value ===
                'true'
            );

        case 'STRING':
        default:
            return config.config_value;
    }
};

const validateConfigValue = (
    config,
    newValue,
) => {
    if (
        newValue === undefined ||
        newValue === null
    ) {
        throw createError(
            'Giá trị cấu hình là bắt buộc.',
            400,
        );
    }

    if (
        config.value_type === 'NUMBER'
    ) {
        const numberValue =
            Number(newValue);

        if (
            !Number.isFinite(numberValue) ||
            numberValue < 0
        ) {
            throw createError(
                'Giá trị cấu hình phải là số không âm.',
                400,
            );
        }
    }

    if (
        config.value_type === 'BOOLEAN'
    ) {
        const validValues = [
            true,
            false,
            'true',
            'false',
        ];

        if (
            !validValues.includes(newValue)
        ) {
            throw createError(
                'Giá trị cấu hình phải là true hoặc false.',
                400,
            );
        }
    }

    if (
        config.value_type === 'STRING' &&
        String(newValue).trim() === ''
    ) {
        throw createError(
            'Giá trị cấu hình không được để trống.',
            400,
        );
    }
};

export const getAllConfigurations =
    async () => {
        const configurations =
            await configRepository.findAll();

        return configurations.map(
            (config) => ({
                ...config,
                parsed_value:
                    parseConfigValue(config),
            }),
        );
    };

export const getConfigurationByKey =
    async (configKey) => {
        const configuration =
            await configRepository.findByKey(
                configKey,
            );

        if (!configuration) {
            throw createError(
                'Không tìm thấy cấu hình hệ thống.',
                404,
            );
        }

        return {
            ...configuration,
            parsed_value:
                parseConfigValue(
                    configuration,
                ),
        };
    };

export const updateConfiguration =
    async (
        configKey,
        newValue,
    ) => {
        const configuration =
            await configRepository.findByKey(
                configKey,
            );

        if (!configuration) {
            throw createError(
                'Không tìm thấy cấu hình hệ thống.',
                404,
            );
        }

        validateConfigValue(
            configuration,
            newValue,
        );

        const updatedConfiguration =
            await configRepository.updateByKey(
                configKey,
                newValue,
            );

        return {
            ...updatedConfiguration,
            parsed_value:
                parseConfigValue(
                    updatedConfiguration,
                ),
        };
    };

export const getConfigValue = async (
    configKey,
    fallbackValue,
) => {
    const configuration =
        await configRepository.findByKey(
            configKey,
        );

    if (!configuration) {
        return fallbackValue;
    }

    const parsedValue =
        parseConfigValue(configuration);

    if (
        parsedValue === null ||
        parsedValue === undefined
    ) {
        return fallbackValue;
    }

    return parsedValue;
};