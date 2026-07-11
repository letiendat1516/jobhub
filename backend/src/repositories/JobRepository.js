/**
 * JobRepository
 * ------------------------------------------------------------------
 * Data access for job postings, including filtered search across the
 * dimensions defined in docs/01_PROJECT_OVERVIEW.md §5. Only this
 * layer issues SQL against the jobs tables. Implemented in Phase 7.
 */
import getSupabaseClient from '../config/supabase.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const getClient = () => {
  const client = getSupabaseClient();

  if (!client) {
    throw ApiError.internal('Chưa cấu hình database Supabase.');
  }

  return client;
};

const handleError = (error, context) => {
  logger.error({ err: error, context }, 'Supabase query failed');
  throw ApiError.internal('Lỗi truy vấn database.');
};

const JOB_SELECT = `
  job_id,
  employer_id,
  category_id,
  job_title,
  job_description,
  salary_min,
  salary_max,
  salary_currency,
  salary_period,
  location,
  city,
  country,
  work_mode,
  job_type,
  experience_level,
  positions_available,
  application_deadline,
  status,
  is_approved,
  created_at,
  updated_at,
  employer:employer_id (
    employer_id,
    company_name,
    city,
    website
  ),
  category:category_id (
    category_id,
    name
  ),
  job_skill (
    is_required,
    min_experience_years,
    weight,
    skill:skill_id (
      skill_id,
      skill_name
    )
  )
`;

class JobRepository {
  static async searchJobs(filters = {}) {
    const {
      keyword,
      city,
      location,
      workMode,
      jobType,
      categoryId,
      salaryMin,
      salaryMax,
      includeUnapproved = false,
      employerId,
      status,
      page = 1,
      limit = 20,
    } = filters;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = getClient()
      .from('job')
      .select(JOB_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!includeUnapproved) {
      query = query.eq('is_approved', true).eq('status', 'OPEN');
    }

    if (employerId) {
      query = query.eq('employer_id', employerId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (keyword) {
      query = query.or(`job_title.ilike.%${keyword}%,job_description.ilike.%${keyword}%`);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (workMode) {
      query = query.eq('work_mode', workMode);
    }

    if (jobType) {
      query = query.eq('job_type', jobType);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (salaryMin) {
      query = query.gte('salary_max', salaryMin);
    }

    if (salaryMax) {
      query = query.lte('salary_min', salaryMax);
    }

    const { data, error, count } = await query;

    if (error) {
      return handleError(error, 'JobRepository.searchJobs');
    }

    return {
      items: data ?? [],
      total: count ?? 0,
      page: Number(page),
      limit: Number(limit),
    };
  }

  static async findJobById(id) {
    const { data, error } = await getClient()
      .from('job')
      .select(JOB_SELECT)
      .eq('job_id', id)
      .maybeSingle();

    if (error) {
      return handleError(error, 'JobRepository.findJobById');
    }

    return data;
  }

  static async createJob(payload) {
    const { data, error } = await getClient()
      .from('job')
      .insert(payload)
      .select(JOB_SELECT)
      .single();

    if (error) {
      return handleError(error, 'JobRepository.createJob');
    }

    return data;
  }

  static async updateJob(id, payload) {
    const { data, error } = await getClient()
      .from('job')
      .update(payload)
      .eq('job_id', id)
      .select(JOB_SELECT)
      .single();

    if (error) {
      return handleError(error, 'JobRepository.updateJob');
    }

    return data;
  }

  static async deleteJob(id) {
    const { error } = await getClient().from('job').delete().eq('job_id', id);

    if (error) {
      return handleError(error, 'JobRepository.deleteJob');
    }

    return true;
  }

  static async setJobStatus(id, status, extra = {}) {
    return JobRepository.updateJob(id, {
      status,
      ...extra,
    });
  }

  static async replaceJobSkills(jobId, skills = []) {
    const client = getClient();

    const { error: deleteError } = await client
      .from('job_skill')
      .delete()
      .eq('job_id', jobId);

    if (deleteError) {
      return handleError(deleteError, 'JobRepository.replaceJobSkills.delete');
    }

    if (skills.length === 0) {
      return [];
    }

    const rows = skills.map((skill) => ({
      job_id: jobId,
      skill_id: skill.skill_id,
      is_required: skill.is_required ?? true,
      min_experience_years: skill.min_experience_years ?? 0,
      weight: skill.weight ?? 1,
    }));

    const { data, error } = await client.from('job_skill').insert(rows).select('*');

    if (error) {
      return handleError(error, 'JobRepository.replaceJobSkills.insert');
    }

    return data ?? [];
  }

  static async listCategories() {
    const { data, error } = await getClient()
      .from('category')
      .select('category_id, name')
      .order('name', { ascending: true });

    if (error) {
      return handleError(error, 'JobRepository.listCategories');
    }

    return data ?? [];
  }

  static async findCategoryByName(name) {
    const { data, error } = await getClient()
      .from('category')
      .select('category_id, name')
      .ilike('name', name.trim())
      .maybeSingle();

    if (error) {
      return handleError(error, 'JobRepository.findCategoryByName');
    }

    return data;
  }

  static async createCategory(name) {
    const { data, error } = await getClient()
      .from('category')
      .insert({ name: name.trim() })
      .select('category_id, name')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw ApiError.conflict('Ngành nghề này đã tồn tại.');
      }

      return handleError(error, 'JobRepository.createCategory');
    }

    return data;
  }

  static async updateCategory(id, name) {
    const { data, error } = await getClient()
      .from('category')
      .update({ name: name.trim() })
      .eq('category_id', id)
      .select('category_id, name')
      .single();

    if (error) {
      return handleError(error, 'JobRepository.updateCategory');
    }

    return data;
  }

  static async deleteCategory(id) {
    const { error } = await getClient().from('category').delete().eq('category_id', id);

    if (error) {
      return handleError(error, 'JobRepository.deleteCategory');
    }

    return true;
  }

  static async listSkills() {
    const { data, error } = await getClient()
      .from('skill')
      .select('skill_id, skill_name')
      .order('skill_name', { ascending: true });

    if (error) {
      return handleError(error, 'JobRepository.listSkills');
    }

    return data ?? [];
  }

  static async findSkillByName(skillName) {
    const { data, error } = await getClient()
      .from('skill')
      .select('skill_id, skill_name')
      .ilike('skill_name', skillName.trim())
      .maybeSingle();

    if (error) {
      return handleError(error, 'JobRepository.findSkillByName');
    }

    return data;
  }

  static async createSkill(skillName) {
    const { data, error } = await getClient()
      .from('skill')
      .insert({ skill_name: skillName.trim() })
      .select('skill_id, skill_name')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw ApiError.conflict('Kỹ năng này đã tồn tại.');
      }

      return handleError(error, 'JobRepository.createSkill');
    }

    return data;
  }

  static async updateSkill(id, skillName) {
    const { data, error } = await getClient()
      .from('skill')
      .update({ skill_name: skillName.trim() })
      .eq('skill_id', id)
      .select('skill_id, skill_name')
      .single();

    if (error) {
      return handleError(error, 'JobRepository.updateSkill');
    }

    return data;
  }

  static async deleteSkill(id) {
    const { error } = await getClient().from('skill').delete().eq('skill_id', id);

    if (error) {
      return handleError(error, 'JobRepository.deleteSkill');
    }

    return true;
  }

  static async createEmployerNotification(payload) {
    const { data, error } = await getClient()
      .from('notification')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return handleError(error, 'JobRepository.createEmployerNotification');
    }

    return data;
  }
}

export default JobRepository;