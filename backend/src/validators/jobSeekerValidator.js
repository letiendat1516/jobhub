import { z } from 'zod';

const educationItem = z.object({
  schoolName: z.string().trim().min(1, 'Tên trường không được để trống.').max(255),
  degree: z.string().trim().max(100).optional().or(z.literal('')),
  major: z.string().trim().max(255).optional().or(z.literal('')),
  startYear: z.number().int().min(1900).max(9999).optional(),
  endYear: z.number().int().min(1900).max(9999).optional(),
});

const experienceItem = z.object({
  companyName: z.string().trim().min(1, 'Tên công ty không được để trống.').max(255),
  position: z.string().trim().min(1, 'Vị trí không được để trống.').max(255),
  startDate: z.string().trim().optional().or(z.literal('')),
  endDate: z.string().trim().optional().or(z.literal('')),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
});

const skillItem = z.object({
  name: z.string().trim().min(1, 'Tên kỹ năng không được để trống.').max(100),
  experienceYears: z.number().min(0).max(50).optional(),
  detail: z.string().trim().max(500).optional().or(z.literal('')),
});

const updateProfile = z.object({
  fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự.').max(255).optional(),
  phone: z.string().trim().max(20, 'Số điện thoại quá dài.').optional().or(z.literal('')),
  address: z.string().trim().max(500, 'Địa chỉ quá dài.').optional().or(z.literal('')),
  city: z.string().trim().max(100, 'Tên thành phố quá dài.').optional().or(z.literal('')),
  headline: z.string().trim().max(255, 'Tiêu đề hồ sơ quá dài.').optional().or(z.literal('')),
  profileSummary: z
    .string()
    .trim()
    .max(5000, 'Giới thiệu bản thân quá dài.')
    .optional()
    .or(z.literal('')),
  isOpenToWork: z.boolean().optional(),
  education: z.array(educationItem).optional(),
  experience: z.array(experienceItem).optional(),
  skills: z.array(skillItem).optional(),
});

export default {
  updateProfile,
};