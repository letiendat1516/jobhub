import { z } from 'zod';

const updateProfile = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự.')
    .max(255, 'Tên công ty quá dài.')
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, 'Số điện thoại quá dài.')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .trim()
    .max(255, 'Website quá dài.')
    .optional()
    .or(z.literal('')),

  companyDescription: z
    .string()
    .trim()
    .max(5000, 'Giới thiệu công ty quá dài.')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .trim()
    .max(100, 'Tên thành phố quá dài.')
    .optional()
    .or(z.literal('')),

  contactName: z
    .string()
    .trim()
    .max(255, 'Tên người liên hệ quá dài.')
    .optional()
    .or(z.literal('')),

  gender: z
    .string()
    .trim()
    .max(10, 'Giới tính không hợp lệ.')
    .optional()
    .or(z.literal('')),
});

export default {
  updateProfile,
};