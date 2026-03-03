import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, GraduationCap, Users, TrendingUp, BookOpen, BarChart3, FileText, 
  AlertCircle, UserPlus, PlusCircle, Clock, Plus 
} from 'lucide-react';
import { User } from '../../types';
import { fetchJson } from '../../lib/utils';
import { Card, Badge } from '../../components/ui';

export const AdminDashboard = ({ user }: { user: User }) => {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchJson('/api/admin/stats'),
      fetchJson('/api/admin/all-submissions')
    ]).then(([stats, subs]) => {
      setAdminStats(stats);
      setSubmissions(subs);
      setLoading(false);
    }).catch(err => {
      console.error("Admin dashboard fetch failed:", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Banner */}
      <div className="bg-navy rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-navy/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <Shield size={20} className="text-brand-orange" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Administrator Portal</span>
          </div>
          <h2 className="text-4xl font-bold mb-2">Welcome back, {user.full_name}</h2>
          <p className="text-white/70 max-w-xl text-lg">
            The institution is running smoothly. You have <span className="text-brand-orange font-bold">{adminStats.pendingApprovals.count} pending applications</span> and <span className="text-brand-red font-bold">{adminStats.unpaidUsers.count} students</span> with outstanding payments.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/admin/users?status=pending" className="px-6 py-3 bg-brand-orange text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all">
              Review Applications
            </Link>
            <Link to="/admin?tab=reports" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md hover:bg-white/20 transition-all">
              System Reports
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <GraduationCap size={240} />
        </div>
      </div>

      {/* Institutional Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
            <Badge variant="info">{adminStats.activeStudents.count} Active</Badge>
          </div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Students</div>
          <div className="text-3xl font-bold text-navy">{adminStats.users.count}</div>
          <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp size={12} /> +12% growth
          </div>
        </Card>
        <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen size={20} /></div>
            <Badge variant="success">{adminStats.activeLecturers.count} Staff</Badge>
          </div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Academic Programs</div>
          <div className="text-3xl font-bold text-navy">{adminStats.courses.count}</div>
          <div className="mt-2 text-[10px] text-slate-400 font-bold">In 6 Departments</div>
        </Card>
        <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-xl"><BarChart3 size={20} /></div>
            <Badge variant="warning">{adminStats.unpaidUsers.count} Unpaid</Badge>
          </div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Course Enrollments</div>
          <div className="text-3xl font-bold text-navy">{adminStats.enrollments.count}</div>
          <div className="mt-2 text-[10px] text-brand-orange font-bold flex items-center gap-1">
            <Users size={12} /> 2.4 avg per student
          </div>
        </Card>
        <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-red/10 text-brand-red rounded-xl"><FileText size={20} /></div>
            <Badge variant="error">Critical</Badge>
          </div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Submissions</div>
          <div className="text-3xl font-bold text-navy">{adminStats.submissions.count}</div>
          <div className="mt-2 text-[10px] text-brand-red font-bold flex items-center gap-1">
            <AlertCircle size={12} /> 14 pending grading
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users?status=pending" className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-navy hover:shadow-lg transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-xl group-hover:bg-brand-orange group-hover:text-white transition-colors">
              <UserPlus size={20} />
            </div>
            <div>
              <div className="font-bold text-navy">User Management</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Review & Approve</div>
            </div>
          </div>
        </Link>
        <Link to="/admin?tab=courses" className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-navy hover:shadow-lg transition-all group text-left w-full">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <PlusCircle size={20} />
            </div>
            <div>
              <div className="font-bold text-navy">Course Catalog</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Create & Edit</div>
            </div>
          </div>
        </Link>
        <Link to="/admin?tab=reports" className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-navy hover:shadow-lg transition-all group text-left w-full">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="font-bold text-navy">Analytics Hub</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Performance Metrics</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <Clock size={18} className="text-slate-400" />
                Audit Log
              </h3>
              <Link to="/admin?tab=reports" className="text-[10px] font-bold text-navy uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {adminStats.recentLogs.map((log: any) => (
                <div key={log.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 text-xs font-bold">
                    {log.user_name ? log.user_name.charAt(0) : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-bold text-navy truncate">{log.user_name || 'System'}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      <span className="text-brand-orange font-bold uppercase text-[9px] mr-2">{log.action}</span>
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <FileText size={18} className="text-slate-400" />
                Recent Submissions
              </h3>
              <Link to="/admin?tab=submissions" className="text-[10px] font-bold text-navy uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {submissions?.assignmentSubmissions?.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-bold text-navy">
                      {s.student_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy">{s.student_name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{s.assignment_title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={s.grade !== null ? 'success' : 'warning'}>
                      {s.grade !== null ? `${s.grade} pts` : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <TrendingUp size={18} className="text-slate-400" />
                Top Courses
              </h3>
            </div>
            <div className="space-y-4">
              {adminStats.popularCourses.map((course: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-navy shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy">{course.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{course.code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-navy">{course.student_count}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Enrolled</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <UserPlus size={18} className="text-slate-400" />
                New Users
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {adminStats.recentUsers.map((user: any) => (
                <div key={user.id} className="group relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 group-hover:bg-navy group-hover:text-white transition-all cursor-pointer">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-navy text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl">
                    {user.full_name}
                  </div>
                </div>
              ))}
              <Link to="/admin/users" className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-navy hover:text-navy transition-all">
                <Plus size={20} />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
