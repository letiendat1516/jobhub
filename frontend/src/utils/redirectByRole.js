/**
 * redirectPathByRole — trả về path mặc định sau khi đăng nhập theo role.
 *
 * Dashboards riêng sẽ được xây ở các phase sau (docs/07 §22 workflow).
 * Tạm thời cả 3 role đều về trang chủ khi chưa có dashboard.
 *
 * @param {'job_seeker'|'employer'|'admin'} role
 * @returns {string}
 */
export default function redirectPathByRole(role) {
  switch (role) {
    case 'employer':
      return '/';
    case 'admin':
      return '/admin/users';
    case 'job_seeker':
    default:
      return '/';
  }
}
