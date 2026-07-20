/**
 * Barrel export for all API service modules.
 * Import from "@/services" in components/hooks rather than deep paths.
 */
export { default as apiClient } from './apiClient.js';
export { default as authService } from './authService.js';
export { default as jobService } from './jobService.js';
export { default as employerService } from './employerService.js';
export { default as resumeService } from './resumeService.js';
export { default as applicationService } from './applicationService.js';
export { default as jobSeekerService } from './jobSeekerService.js';
export { default as recommendationService } from './recommendationService.js';
