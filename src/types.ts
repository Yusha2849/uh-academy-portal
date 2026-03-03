export interface User {
  id: number;
  email: string;
  role: 'student' | 'lecturer' | 'admin' | 'sysadmin';
  name: string;
  full_name?: string;
  phone_number?: string;
  status?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  code: string;
  lecturer_name: string;
  thumbnail_url?: string;
  lecturers?: User[];
  modules?: any[];
  isEnrolled?: boolean;
}
