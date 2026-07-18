import apiClient from './apiClient.js';

const unwrapResponse = (response) => {
    return (
        response?.data?.data ??
        response?.data ??
        response
    );
};

const getAllConfigurations = async () => {
    const response = await apiClient.get(
        '/system-configurations',
    );

    return unwrapResponse(response);
};

const updateConfiguration = async (
    configKey,
    value,
) => {
    const response = await apiClient.patch(
        `/system-configurations/${configKey}`,
        {
            value,
        },
    );

    return unwrapResponse(response);
};

export default {
    getAllConfigurations,
    updateConfiguration,
};