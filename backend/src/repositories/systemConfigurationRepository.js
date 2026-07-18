
import getSupabaseClient
  from '../config/supabase.js';

import ApiError
  from '../utils/ApiError.js';

import logger
  from '../utils/logger.js';

const getClient = () => {
  const client = getSupabaseClient();

  if (!client) {
    throw ApiError.internal(
      'Chưa cấu hình database Supabase.',
    );
  }

  return client;
};

const handleError = (
  error,
  context,
) => {
  console.error(
    'SYSTEM CONFIG SUPABASE ERROR:',
    {
      context,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    },
  );

  logger.error(
    {
      err: error,
      context,
    },
    'Supabase query failed',
  );

  throw ApiError.internal(
    'Lỗi truy vấn database.',
  );
};

export const findAll = async () => {
  const { data, error } =
    await getClient()
      .from('system_configurations')
      .select('*')
      .order('config_key', {
        ascending: true,
      });

  if (error) {
    return handleError(
      error,
      'SystemConfigurationRepository.findAll',
    );
  }

  return data ?? [];
};

export const findByKey = async (
  configKey,
) => {
  const { data, error } =
    await getClient()
      .from('system_configurations')
      .select('*')
      .eq('config_key', configKey)
      .maybeSingle();

  if (error) {
    return handleError(
      error,
      'SystemConfigurationRepository.findByKey',
    );
  }

  return data;
};

export const updateByKey = async (
  configKey,
  configValue,
) => {
  console.log(
    'UPDATING SYSTEM CONFIG:',
    configKey,
    configValue,
  );

  const { error } =
    await getClient()
      .from('system_configurations')
      .update({
        config_value:
          String(configValue),

        updated_at:
          new Date().toISOString(),
      })
      .eq('config_key', configKey);

  if (error) {
    return handleError(
      error,
      'SystemConfigurationRepository.updateByKey',
    );
  }

  const updatedConfiguration =
    await findByKey(configKey);

  if (!updatedConfiguration) {
    throw ApiError.internal(
      'Không thể đọc lại cấu hình sau khi cập nhật.',
    );
  }

  return updatedConfiguration;
};