/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import Markdown from 'react-markdown';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Search,
  Bell,
  MessageSquare,
  FileText,
  PlayCircle,
  Mic,
  Video,
  Download,
  ExternalLink,
  CheckCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  MoreVertical,
  ArrowLeft,
  Award,
  BookMarked,
  Flag,
  Pin,
  Upload,
  User as UserIcon,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Moon,
  Sun,
  Save,
  Trash2,
  PlusCircle,
  Paperclip,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, fetchJson } from './lib/utils';
import { User, Course } from './types';
import { StudentDashboard } from './pages/student/Dashboard';
import { Card, Badge, SidebarItem } from './components/ui';


// --- Components ---



// --- Pages ---

const LoginPage = ({ onLogin }: any) => {
  const [email, setEmail] = useState('student@uhacademy.edu');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        window.location.href = '/dashboard';
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy text-white mb-4 shadow-xl shadow-navy/20">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-navy">UH Academy</h1>
          <p className="text-slate-500 mt-2 text-lg">Online Student Portal</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">{error}</div>}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="name@uhacademy.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => alert("Google Sign-In is currently disabled for security updates. Please use your email and password.")}
              className="w-full py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Globe size={18} />
              Google (Disabled)
            </button>
            <p className="text-center text-sm text-slate-500 mt-4">
              Don't have an account? <Link to="/register" className="text-emerald-600 font-bold">Register Now</Link>
            </p>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Demo Accounts:<br/>
              <span className="font-mono text-xs">student@uhacademy.edu / student123</span><br/>
              <span className="font-mono text-xs">lecturer@uhacademy.edu / lecturer123</span><br/>
              <span className="font-mono text-xs">admin@uhacademy.edu / admin123</span>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setSuccess(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, role, phone_number: phoneNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        if (role === 'student') {
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy text-white mb-4 shadow-xl shadow-navy/20">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-navy">Join UH Academy</h1>
          <p className="text-slate-500 mt-2 text-lg">Create your account to get started</p>
        </div>

        <Card className="p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Registration Successful!</h2>
              <p className="text-slate-500">
                Your account is pending approval by an administrator. You will be able to log in once your request has been reviewed.
              </p>
              <Link to="/login" className="block text-emerald-600 font-bold">Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="name@uhacademy.edu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={cn(
                      "py-2 px-4 rounded-xl border font-semibold text-sm transition-all",
                      role === 'student' ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('lecturer')}
                    className={cn(
                      "py-2 px-4 rounded-xl border font-semibold text-sm transition-all",
                      role === 'lecturer' ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Lecturer
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all mt-4"
              >
                Create Account
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => alert("Google Registration is currently disabled for security updates. Please use the form above.")}
                className="w-full py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Globe size={18} />
                Google (Disabled)
              </button>
              <p className="text-center text-sm text-slate-500 mt-4">
                Already have an account? <Link to="/login" className="text-emerald-600 font-bold">Sign In</Link>
              </p>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [data, setData] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'admin' || user.role === 'sysadmin') {
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
    } else {
      fetchJson('/api/student/dashboard')
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Student dashboard fetch failed:", err);
          setLoading(false);
        });
    }
  }, [user.role]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  if (user.role === 'admin' || user.role === 'sysadmin') {
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
  }

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Banner */}
      <div className="bg-navy rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-navy/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <GraduationCap size={20} className="text-emerald-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Student Portal</span>
          </div>
          <h2 className="text-4xl font-bold mb-2">Welcome back, {user.full_name}</h2>
          <p className="text-white/70 max-w-xl text-lg">
            You're making great progress! You have <span className="text-emerald-400 font-bold">{data.stats.upcoming} upcoming deadlines</span> to focus on this week.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/courses/my" className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all">
              Continue Learning
            </Link>
            <Link to="/courses" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md hover:bg-white/20 transition-all">
              Browse Catalog
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BookOpen size={240} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-navy text-white border-none shadow-xl shadow-navy/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Active Courses</span>
          </div>
          <div className="text-4xl font-bold mb-1">{data.stats.enrolled}</div>
          <p className="text-emerald-100 text-sm">Enrolled this semester</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Tasks</span>
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-1">{data.stats.upcoming}</div>
          <p className="text-slate-500 text-sm">Assignments due soon</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <BarChart3 size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current GPA</span>
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-1">{data.stats.gpa}</div>
          <p className="text-slate-500 text-sm">Overall academic performance</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Course Progress</h2>
              <Link to="/courses/my" className="text-emerald-600 font-semibold text-sm hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.courseProgress.map((course: any) => (
                <Card key={course.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{course.title}</h4>
                      <p className="text-xs text-slate-400">{course.code}</p>
                    </div>
                    <Link 
                      to={`/courses/${course.id}`}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-emerald-600">
                      {course.total_content > 0 ? Math.round((course.viewed_content / course.total_content) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${course.total_content > 0 ? (course.viewed_content / course.total_content) * 100 : 0}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {data.recentActivity.map((activity: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    activity.type === 'content' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {activity.type === 'content' ? <PlayCircle size={20} /> : <MessageSquare size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {activity.type === 'content' ? 'Viewed lesson:' : 'Posted in forum:'} <span className="font-bold">{activity.title}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{activity.course_title} • {new Date(activity.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm italic bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  No recent activity to show.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {data.upcomingAssignments.map((assignment: any) => (
                <Link key={assignment.id} to={`/assignments/${assignment.id}`} className="block group">
                  <Card className="p-4 border-l-4 border-l-amber-500 group-hover:border-l-navy group-hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-navy transition-colors">{assignment.title}</h4>
                      <Badge variant="warning" className="text-[10px]">{assignment.course_code}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={14} />
                      <span>Due {new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                  </Card>
                </Link>
              ))}
              {data.upcomingAssignments.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                  No upcoming deadlines!
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const CourseCatalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [enrolledCourse, setEnrolledCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchJson('/api/courses')
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleEnroll = async (course: Course) => {
    const res = await fetch(`/api/courses/${course.id}/enroll`, { method: 'POST' });
    if (res.ok) {
      setEnrolledCourse(course);
      setShowSuccessModal(true);
    } else {
      const data = await res.json();
      alert(data.error || 'Enrollment failed');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Course Catalog</h1>
        <p className="text-slate-500 mt-1">Discover and enroll in new subjects.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search courses, lecturers, or topics..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          Filter
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="group">
              <div className="h-48 bg-slate-200 overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${course.code}/800/600`} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="info">{course.code}</Badge>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-sm font-bold">4.9</span>
                    <span className="text-xs text-slate-400">(120)</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {course.lecturer_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">{course.lecturer_name || 'Unknown'}</span>
                      <span className="text-[10px] text-slate-400">Senior Lecturer</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEnroll(course)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Enroll
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showSuccessModal && enrolledCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enrollment Successful!</h3>
              <p className="text-slate-500 mb-8">
                You have successfully enrolled in <span className="font-bold text-slate-900">{enrolledCourse.title}</span>. 
                You can now access all course materials and assignments.
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  to={`/courses/${enrolledCourse.id}`}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  Go to Course
                </Link>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Browse More Courses
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AssignmentView = ({ user }: { user: User }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeData, setGradeData] = useState<{ grade: number | string, feedback: string, rubric_scores: any }>({ grade: 0, feedback: '', rubric_scores: {} });
  const [submissionData, setSubmissionData] = useState({ text: '', file: null as File | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [aData, sData] = await Promise.all([
        fetchJson(`/api/assignments/${id}`),
        fetchJson(`/api/assignments/${id}/submissions`)
      ]);
      setAssignment(aData);
      setSubmissions(sData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch assignment data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleGrade = async () => {
    const res = await fetch(`/api/submissions/${selectedSubmission.id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...gradeData, grade: Number(gradeData.grade) || 0 })
    });
    if (res.ok) {
      alert('Grade saved!');
      setSelectedSubmission(null);
      fetchData();
    }
  };

  const handleSubmit = async () => {
    const wordCount = submissionData.text.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (assignment.min_word_count > 0 && wordCount < assignment.min_word_count) {
      alert(`Your submission does not meet the minimum word count of ${assignment.min_word_count}. Current count: ${wordCount}`);
      return;
    }

    const res = await fetch(`/api/assignments/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: submissionData.file?.name || 'submission.pdf',
        file_url: 'https://example.com/files/submission.pdf', // Mock URL
        text_content: submissionData.text,
        word_count: wordCount
      })
    });
    if (res.ok) {
      alert('Assignment submitted!');
      fetchData();
    }
  };

  const handleReleaseGrades = async () => {
    const res = await fetch(`/api/assignments/${id}/release-grades`, { method: 'POST' });
    if (res.ok) {
      alert('Grades released to students!');
      fetchData();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading assignment...</div>;

  const isLate = new Date() > new Date(assignment.due_date);
  const mySubmission = user.role === 'student' ? submissions[0] : null;

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
      >
        <ArrowLeft size={16} /> Back to Course
      </button>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{assignment.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award size={16} />
              <span>Max Points: {assignment.max_points}</span>
            </div>
            {assignment.min_word_count > 0 && (
              <div className="flex items-center gap-1.5">
                <FileText size={16} />
                <span>Min Words: {assignment.min_word_count}</span>
              </div>
            )}
            {assignment.allowed_file_types && assignment.allowed_file_types !== '*' && (
              <div className="flex items-center gap-1.5">
                <Paperclip size={16} />
                <span>Types: {assignment.allowed_file_types}</span>
              </div>
            )}
          </div>
        </div>
        {user.role === 'lecturer' && !assignment.grades_released && (
          <button 
            onClick={handleReleaseGrades}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            Release Grades
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Description</h3>
            <div className="prose prose-slate max-w-none text-slate-600">
              <Markdown>{assignment.description}</Markdown>
            </div>
          </Card>

          {assignment.rubric && assignment.rubric.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Grading Rubric</h3>
              <div className="space-y-4">
                {assignment.rubric.map((criterion: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-900">{criterion.name}</span>
                      <span className="text-emerald-600 font-bold">{criterion.points} pts</span>
                    </div>
                    <p className="text-sm text-slate-500">{criterion.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {user.role === 'lecturer' && (
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Student Submissions</h3>
                <Badge variant="info">{submissions.length} Total</Badge>
              </div>
              <div className="divide-y divide-slate-100">
                {submissions.map((s: any) => (
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">{s.full_name}</p>
                      <p className="text-xs text-slate-400">Submitted: {new Date(s.submitted_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {s.grade !== null ? (
                        <Badge variant="success">{s.grade} / {assignment.max_points}</Badge>
                      ) : (
                        <Badge variant="warning">Not Graded</Badge>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedSubmission(s);
                          setGradeData({ grade: s.grade || 0, feedback: s.feedback || '', rubric_scores: s.rubric_scores || {} });
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Grade
                      </button>
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <div className="p-12 text-center text-slate-400">No submissions yet.</div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {user.role === 'student' && (
            <>
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Your Submission</h3>
                {mySubmission ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{mySubmission.file_name}</p>
                        <p className="text-[10px] text-slate-400">Submitted {new Date(mySubmission.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {assignment.grades_released && mySubmission.grade !== null && (
                      <div className="p-4 rounded-xl bg-slate-900 text-white">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Your Grade</div>
                        <div className="text-3xl font-black">{mySubmission.grade} <span className="text-sm font-normal text-slate-400">/ {assignment.max_points}</span></div>
                        {mySubmission.feedback && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Feedback</div>
                            <p className="text-sm text-slate-300 italic">"{mySubmission.feedback}"</p>
                          </div>
                        )}
                      </div>
                    )}
                    {!assignment.grades_released && (
                      <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-center text-sm">
                        Grades have not been released yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isLate && !assignment.allow_late ? (
                      <div className="p-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium border border-rose-100">
                        Submission closed. The due date has passed.
                      </div>
                    ) : (
                      <>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2 hover:border-emerald-500 transition-colors cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                            <Upload size={24} />
                          </div>
                          <p className="text-sm font-bold text-slate-900">Click to upload file</p>
                          <p className="text-xs text-slate-400">PDF, DOCX, or ZIP (Max 50MB)</p>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            onChange={(e) => setSubmissionData({ ...submissionData, file: e.target.files?.[0] || null })}
                          />
                        </div>
                        {submissionData.file && (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                            <CheckCircle2 size={16} />
                            <span>{submissionData.file.name}</span>
                          </div>
                        )}
                        <textarea 
                          placeholder="Additional comments (optional)"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                          value={submissionData.text}
                          onChange={(e) => setSubmissionData({ ...submissionData, text: e.target.value })}
                        />
                        <button 
                          onClick={handleSubmit}
                          disabled={!submissionData.file}
                          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                          Submit Assignment
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Card>
            </>
          )}

          {user.role === 'lecturer' && selectedSubmission && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Grading: {selectedSubmission.full_name}</h3>
                  <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{selectedSubmission.file_name}</span>
                  </div>
                  <a href={selectedSubmission.file_url} className="text-emerald-600 text-xs font-bold hover:underline">Download</a>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rubric Scoring</h4>
                  {assignment.rubric.map((criterion: any) => (
                    <div key={criterion.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{criterion.name}</span>
                        <span className="text-slate-400">{gradeData.rubric_scores[criterion.name] || 0} / {criterion.points}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={criterion.points}
                        value={gradeData.rubric_scores[criterion.name] || 0}
                        onChange={(e) => {
                          const newScores = { ...gradeData.rubric_scores, [criterion.name]: parseInt(e.target.value) || 0 };
                          const totalGrade = Object.values(newScores).reduce((a: any, b: any) => a + b, 0) as number;
                          setGradeData({ ...gradeData, rubric_scores: newScores, grade: totalGrade });
                        }}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Final Grade</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={gradeData.grade}
                        onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                        className="w-24 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                      />
                      <span className="text-slate-400">/ {assignment.max_points}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Feedback</label>
                    <textarea 
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] text-sm"
                      placeholder="Provide constructive feedback..."
                    />
                  </div>
                </div>

                <button 
                  onClick={handleGrade}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Save Grade & Feedback
                </button>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestionBank = ({ courseId }: { courseId: number }) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ name: '', description: '' });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ 
    question_text: '', 
    type: 'multiple_choice', 
    options: [] as string[], 
    correct_answer: '', 
    points: 1 
  });
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    fetchJson(`/api/courses/${courseId}/question-banks`).then(setBanks).catch(err => console.error(err));
  }, [courseId]);

  useEffect(() => {
    if (selectedBank) {
      fetchJson(`/api/question-banks/${selectedBank.id}/questions`).then(setQuestions).catch(err => console.error(err));
    }
  }, [selectedBank]);

  const handleAddBank = async () => {
    const res = await fetch(`/api/courses/${courseId}/question-banks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBank)
    });
    if (res.ok) {
      const data = await res.json();
      setBanks([...banks, { ...newBank, id: data.id }]);
      setShowAddBank(false);
      setNewBank({ name: '', description: '' });
    }
  };

  const handleAddQuestion = async () => {
    const res = await fetch(`/api/question-banks/${selectedBank.id}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestion)
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions([...questions, { ...newQuestion, id: data.id }]);
      setShowAddQuestion(false);
      setNewQuestion({ question_text: '', type: 'multiple_choice', options: [], correct_answer: '', points: 1 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Question Banks</h2>
        <button 
          onClick={() => setShowAddBank(true)}
          className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
        >
          <Plus size={16} /> New Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          {banks.map(bank => (
            <button
              key={bank.id}
              onClick={() => setSelectedBank(bank)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                selectedBank?.id === bank.id ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold" : "bg-white border-slate-200 hover:bg-slate-50"
              )}
            >
              {bank.name}
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {selectedBank ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{selectedBank.name} Questions</h3>
                <button 
                  onClick={() => setShowAddQuestion(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                >
                  Add Question
                </button>
              </div>

              {showAddQuestion && (
                <Card className="p-6 space-y-4 border-emerald-200 bg-emerald-50/30">
                  <textarea 
                    placeholder="Question Text"
                    value={newQuestion.question_text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
                      className="px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="essay">Essay</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Points"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 0 })}
                      className="px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>

                  {newQuestion.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Add Option"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none"
                        />
                        <button 
                          onClick={() => {
                            setNewQuestion({ ...newQuestion, options: [...newQuestion.options, newOption] });
                            setNewOption('');
                          }}
                          className="px-4 py-2 bg-slate-200 rounded-xl"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newQuestion.options.map((opt, i) => (
                          <Badge key={i} className="flex items-center gap-2">
                            {opt}
                            <button onClick={() => setNewQuestion({ ...newQuestion, options: newQuestion.options.filter((_, idx) => idx !== i) })}>
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <input 
                    type="text" 
                    placeholder="Correct Answer"
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddQuestion(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                    <button onClick={handleAddQuestion} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Save Question</button>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                {questions.map(q => (
                  <Card key={q.id} className="p-4">
                    <div className="flex justify-between mb-2">
                      <Badge variant="info">{q.type}</Badge>
                      <span className="text-xs font-bold text-slate-400">{q.points} pts</span>
                    </div>
                    <p className="text-slate-900 font-medium">{q.question_text}</p>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              Select a bank to view questions
            </div>
          )}
        </div>
      </div>

      {showAddBank && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">New Question Bank</h3>
            <input 
              type="text" 
              placeholder="Bank Name"
              value={newBank.name}
              onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
            />
            <textarea 
              placeholder="Description"
              value={newBank.description}
              onChange={(e) => setNewBank({ ...newBank, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddBank(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
              <button onClick={handleAddBank} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Create Bank</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};


const ForumView = ({ url, user }: { url: string, user: User }) => {
  const [forum, setForum] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchForum = async () => {
    try {
      const fData = await fetchJson(url);
      setForum(fData);
      
      const pData = await fetchJson(`/api/forums/${fData.id}/posts`);
      setPosts(pData);
    } catch (err) {
      console.error("Failed to fetch forum data:", err);
    }
  };

  useEffect(() => {
    fetchForum();
  }, [url]);

  const handleCreateThread = async () => {
    const res = await fetch(`/api/forums/${forum.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newThread)
    });
    if (res.ok) {
      setShowNewThread(false);
      setNewThread({ title: '', content: '' });
      fetchForum();
    }
  };

  const handleReply = async (parentId: number) => {
    const res = await fetch(`/api/forums/${forum.id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent, parent_id: parentId })
    });
    if (res.ok) {
      setReplyingTo(null);
      setReplyContent('');
      fetchForum();
    }
  };

  const handlePin = async (postId: number, isPinned: boolean) => {
    await fetch(`/api/posts/${postId}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: !isPinned })
    });
    fetchForum();
  };

  const handleReport = async (postId: number) => {
    const reason = prompt("Reason for reporting:");
    if (reason) {
      await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      alert("Post reported to moderators.");
    }
  };

  if (!forum) return null;

  const threads = posts.filter(p => !p.parent_id);
  const getReplies = (parentId: number) => posts.filter(p => p.parent_id === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{forum.title}</h2>
          <p className="text-sm text-slate-500">{forum.description}</p>
        </div>
        <button 
          onClick={() => setShowNewThread(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20"
        >
          New Thread
        </button>
      </div>

      {showNewThread && (
        <Card className="p-6 space-y-4 border-emerald-200 bg-emerald-50/30">
          <input 
            type="text" 
            placeholder="Thread Title"
            value={newThread.title}
            onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <textarea 
            placeholder="What's on your mind?"
            value={newThread.content}
            onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowNewThread(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
            <button onClick={handleCreateThread} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Post Thread</button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {threads.map(thread => (
          <Card key={thread.id} className={cn("overflow-hidden", thread.is_pinned && "border-emerald-200 ring-1 ring-emerald-100")}>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                    {thread.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{thread.title}</h4>
                      {thread.is_pinned && <Badge variant="success" className="text-[10px] py-0 px-1.5"><Pin size={10} className="mr-1" /> Pinned</Badge>}
                    </div>
                    <p className="text-xs text-slate-400">By {thread.full_name} • {new Date(thread.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(user.role === 'lecturer' || user.role === 'admin') && (
                    <button 
                      onClick={() => handlePin(thread.id, thread.is_pinned)}
                      className={cn("p-2 rounded-lg transition-colors", thread.is_pinned ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:bg-slate-50")}
                      title={thread.is_pinned ? "Unpin" : "Pin"}
                    >
                      <Pin size={16} />
                    </button>
                  )}
                  <button onClick={() => handleReport(thread.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Report">
                    <Flag size={16} />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{thread.content}</p>
              
              <div className="flex items-center gap-4 pt-2">
                <button 
                  onClick={() => setReplyingTo(replyingTo === thread.id ? null : thread.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                >
                  <MessageSquare size={14} />
                  Reply
                </button>
              </div>

              {replyingTo === thread.id && (
                <div className="mt-4 space-y-3">
                  <textarea 
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                    <button onClick={() => handleReply(thread.id)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Reply</button>
                  </div>
                </div>
              )}

              {/* Replies */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {getReplies(thread.id).map(reply => (
                  <div key={reply.id} className="flex gap-3 pl-6 border-l-2 border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 text-xs font-bold">
                      {reply.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">{reply.full_name} <span className="font-normal text-slate-400 ml-1">• {new Date(reply.created_at).toLocaleDateString()}</span></p>
                        <button onClick={() => handleReport(reply.id)} className="text-slate-300 hover:text-rose-600"><Flag size={12} /></button>
                      </div>
                      <p className="text-sm text-slate-600">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
        {threads.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            No discussions yet. Start a new thread!
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleContent = ({ moduleId, user }: { moduleId: number, user: User }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const json = await fetchJson(`/api/modules/${moduleId}/content`);
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch module content:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const toggleViewed = async (contentId: number, currentStatus: boolean) => {
    await fetch(`/api/content/${contentId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_viewed: !currentStatus })
    });
    fetchData();
  };

  if (loading) return <div className="py-4 text-center text-xs text-slate-400">Loading content...</div>;

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      {data.content.map((item: any) => (
        <div key={item.id} className="flex items-center justify-between group/item">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              item.type === 'video' ? "bg-rose-50 text-rose-600" :
              item.type === 'audio' || item.type === 'podcast' ? "bg-amber-50 text-amber-600" :
              "bg-blue-50 text-blue-600"
            )}>
              {item.type === 'video' ? <Video size={16} /> :
               item.type === 'audio' || item.type === 'podcast' ? <Mic size={16} /> :
               <FileText size={16} />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.type} {item.is_external ? '• External' : ''}</p>
                {item.creator_name && <span className="text-[10px] text-slate-400">• {item.creator_name}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user.role === 'student' && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleViewed(item.id, !!item.is_viewed); }}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  item.is_viewed ? "text-emerald-600 bg-emerald-50" : "text-slate-300 hover:text-slate-400"
                )}
                title={item.is_viewed ? "Mark as unviewed" : "Mark as viewed"}
              >
                <CheckCircle size={16} fill={item.is_viewed ? "currentColor" : "none"} />
              </button>
            )}
            
            {item.allow_download && (
              <a 
                href={item.url} 
                download 
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                title="Download"
              >
                <Download size={16} />
              </a>
            )}
            
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      ))}
      
      {data.assignments.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignments</p>
          {data.assignments.map((a: any) => (
            <Link key={a.id} to={`#assignments`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText size={12} />
                </div>
                <span className="text-xs font-medium text-slate-700">{a.title}</span>
              </div>
              <ChevronRight size={12} className="text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const MyCourses = ({ user }: { user: User }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCourses = () => {
    fetchJson('/api/courses/my')
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading courses...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user.role === 'lecturer' ? 'Courses I Teach' : 'My Enrolled Courses'}
          </h1>
          <p className="text-slate-500 mt-1">
            {user.role === 'lecturer' 
              ? 'Manage your curriculum, students, and academic materials.' 
              : 'Access your learning materials, assignments, and track your progress.'}
          </p>
        </div>
        {user.role === 'lecturer' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Plus size={20} />
            <span>New Course</span>
          </button>
        )}
      </header>

      <NewCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchCourses} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <motion.div key={course.id} whileHover={{ y: -4 }}>
            <Card className="h-full flex flex-col group cursor-pointer overflow-hidden">
              <div className="h-40 bg-slate-200 relative">
                <img 
                  src={`https://picsum.photos/seed/${course.code}/800/400`} 
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="info">{course.code}</Badge>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{course.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                      {course.lecturer_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{course.lecturer_name || 'Unknown'}</span>
                  </div>
                  <Link 
                    to={`/courses/${course.id}`} 
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                  >
                    Open Course
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="mb-4 flex justify-center">
              <BookOpen size={48} className="text-slate-200" />
            </div>
            <p className="mb-4">You are not enrolled in any courses yet.</p>
            <Link to="/courses" className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Browse Catalog</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const NewCourseModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ title: '', description: '', code: '', thumbnail_url: '' });
  const [loading, setLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const presetImages = [
    'https://picsum.photos/seed/tech/800/600',
    'https://picsum.photos/seed/science/800/600',
    'https://picsum.photos/seed/art/800/600',
    'https://picsum.photos/seed/business/800/600',
    'https://picsum.photos/seed/code/800/600',
    'https://picsum.photos/seed/design/800/600',
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setFormData({ title: '', description: '', code: '', thumbnail_url: '' });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create course");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Create New Course</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              placeholder="e.g. Advanced Web Development"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Course Code</label>
            <input 
              required
              type="text" 
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              placeholder="e.g. CS405"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
              placeholder="What will students learn in this course?"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {formData.thumbnail_url ? (
                  <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="text-slate-300" size={24} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  >
                    Select Preset
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter image URL:");
                      if (url) setFormData({ ...formData, thumbnail_url: url });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  >
                    Custom URL
                  </button>
                </div>
                {showImagePicker && (
                  <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {presetImages.map((img, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, thumbnail_url: img });
                          setShowImagePicker(false);
                        }}
                        className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all"
                      >
                        <img src={img} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const CourseSettingsModal = ({ course, isOpen, onClose, onSuccess }: { course: any, isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ 
    title: course?.title || '', 
    description: course?.description || '', 
    code: course?.code || '',
    thumbnail_url: course?.thumbnail_url || ''
  });
  const [loading, setLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const presetImages = [
    'https://picsum.photos/seed/tech/800/600',
    'https://picsum.photos/seed/science/800/600',
    'https://picsum.photos/seed/art/800/600',
    'https://picsum.photos/seed/business/800/600',
    'https://picsum.photos/seed/code/800/600',
    'https://picsum.photos/seed/design/800/600',
  ];

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        code: course.code,
        thumbnail_url: course.thumbnail_url || ''
      });
    }
  }, [course]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update course");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Course Settings</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Course Code</label>
            <input 
              required
              type="text" 
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {formData.thumbnail_url ? (
                  <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="text-slate-300" size={24} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  >
                    Select Preset
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter image URL:");
                      if (url) setFormData({ ...formData, thumbnail_url: url });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  >
                    Custom URL
                  </button>
                </div>
                {showImagePicker && (
                  <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {presetImages.map((img, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, thumbnail_url: img });
                          setShowImagePicker(false);
                        }}
                        className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all"
                      >
                        <img src={img} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Students = ({ user }: { user: User }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchJson('/api/lecturer/students')
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(filter.toLowerCase()) ||
    s.course_title.toLowerCase().includes(filter.toLowerCase()) ||
    s.course_code.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading students...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
          <p className="text-slate-500 mt-1">Manage and view details of students enrolled in your courses.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search students or courses..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-sm"
          />
        </div>
      </header>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student: any) => (
                <tr key={`${student.id}-${student.course_code}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{student.full_name}</div>
                        <div className="text-xs text-slate-400">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 font-medium">{student.course_title}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{student.course_code}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(student.enrolled_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 font-bold text-sm">View Profile</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    No students enrolled in your courses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const LecturerCourseGrades = ({ courseId }: { courseId: number }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`/api/courses/${courseId}/lecturer-grades`)
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [courseId]);

  if (loading) return <div className="py-8 text-center text-slate-400">Loading grading data...</div>;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Assignment Submissions</h3>
        <div className="space-y-4">
          {data.submissions.map((sub: any) => (
            <Card key={sub.id} className="p-5 hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {sub.student_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{sub.student_name}</h4>
                    <p className="text-xs text-slate-400">{sub.assignment_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {sub.grade !== null ? `${sub.grade} / ${sub.max_points}` : 'Pending'}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      {sub.grade !== null ? 'Graded' : 'Needs Marking'}
                    </div>
                  </div>
                  <Link 
                    to={`/assignments/${sub.assignment_id}`}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    {sub.grade !== null ? 'Edit Grade' : 'Mark Now'}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {data.submissions.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              No submissions yet.
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Test Results</h3>
        <div className="space-y-4">
          {data.testResults.map((res: any) => (
            <Card key={res.id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    {res.student_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{res.student_name}</h4>
                    <p className="text-xs text-slate-400">{res.test_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{res.score} / {res.max_score}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{res.status}</div>
                  </div>
                  <Link 
                    to={`/test-attempts/${res.id}`}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                  >
                    View Attempt
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {data.testResults.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              No test results yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const TestAttemptView = ({ user }: { user: User }) => {
  const { id } = useParams();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState<number | string>(0);
  const [questionScores, setQuestionScores] = useState<Record<number, number | string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchJson(`/api/test-results/${id}`)
      .then(data => {
        setAttempt(data);
        setGrade(data.score || 0);
        
        // Initialize scores
        const initialScores: Record<number, number> = data.scores || {};
        if (Object.keys(initialScores).length === 0) {
           const answers = JSON.parse(data.answers_json || '{}');
           data.questions.forEach((q: any) => {
             if (q.type === 'multiple_choice' || q.type === 'true_false') {
               initialScores[q.id] = (answers[q.id] === q.correct_answer) ? q.points : 0;
             } else {
               initialScores[q.id] = 0; // Default to 0 for manual grading
             }
           });
        }
        setQuestionScores(initialScores);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [id]);

  // Update total grade when question scores change
  useEffect(() => {
    if (!loading) {
        const total = Object.values(questionScores).reduce((a, b) => a + (Number(b) || 0), 0);
        setGrade(total);
    }
  }, [questionScores, loading]);

  const handleScoreChange = (qId: number, value: string, maxPoints: number) => {
    if (value === '') {
      setQuestionScores(prev => ({ ...prev, [qId]: '' }));
      return;
    }
    
    let numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    
    // Clamp value
    if (numVal < 0) numVal = 0;
    if (numVal > maxPoints) numVal = maxPoints;
    
    setQuestionScores(prev => ({ ...prev, [qId]: numVal }));
  };

  const handleGrade = async () => {
    const res = await fetch(`/api/test-results/${id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: Number(grade) || 0, scores: questionScores })
    });
    if (res.ok) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading attempt...</div>;

  const answers = JSON.parse(attempt.answers_json || '{}');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link 
        to={`/courses/${attempt.course_id}`} 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Course
      </Link>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Test Attempt</h1>
          <p className="text-slate-500 mt-1">
            Student: <span className="font-bold text-slate-900">{attempt.full_name}</span> • 
            Test: <span className="font-bold text-slate-900">{attempt.test_title}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase">Current Score</div>
            <div className="text-2xl font-black text-emerald-600">{attempt.score} / {attempt.max_score}</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6">Student Answers</h3>
            <div className="space-y-8">
              {attempt.questions.map((q: any, idx: number) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">{idx + 1}</span>
                    <p className="font-medium text-slate-900">{q.question_text}</p>
                  </div>
                  <div className="ml-9 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Answer</div>
                    <p className="text-slate-700">{answers[q.id] || <span className="italic text-slate-400">No answer provided</span>}</p>
                  </div>
                  <div className="ml-9 flex flex-col gap-2">
                    {q.type === 'multiple_choice' || q.type === 'true_false' ? (
                      <div className="flex items-center gap-2">
                        {answers[q.id] === q.correct_answer ? (
                          <Badge variant="success">Correct</Badge>
                        ) : (
                          <Badge variant="error">Incorrect (Correct: {q.correct_answer})</Badge>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Manual grading required.</div>
                    )}
                    
                    {(user.role === 'lecturer' || user.role === 'admin') && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                        <label className="text-xs font-bold text-slate-500 uppercase">Score:</label>
                        <input 
                          type="number" 
                          value={questionScores[q.id] !== undefined ? questionScores[q.id] : 0}
                          onChange={(e) => handleScoreChange(q.id, e.target.value, q.points)}
                          className="w-16 px-2 py-1 rounded border border-slate-200 text-sm font-bold text-center outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-slate-400 font-bold">/ {q.points}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {(user.role === 'lecturer' || user.role === 'admin') && (
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4">Grading Summary</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Total Score</label>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-emerald-600">{grade}</div>
                    <span className="text-slate-400 font-bold text-xl">/ {attempt.max_score}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Calculated from individual question scores.</p>
                </div>
                
                {showSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={16} />
                    Grades saved successfully!
                  </div>
                )}

                <button 
                  onClick={handleGrade}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Save Grades
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const Community = ({ user }: { user: User }) => {
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson('/api/community/forums')
      .then(data => {
        setForums(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading community...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Learning Community</h1>
        <p className="text-slate-500 mt-1">Join discussions with your peers and lecturers across all your subjects.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forums.map(forum => (
          <Card key={forum.id} className="p-6 hover:border-emerald-200 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{forum.title}</h3>
                  <p className="text-xs text-slate-400">{forum.course_code} • {forum.course_title}</p>
                </div>
              </div>
              <Badge variant="info">{forum.post_count} Posts</Badge>
            </div>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{forum.description}</p>
            <Link 
              to={`/courses/${forum.course_id}?tab=forum`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all"
            >
              Enter Discussion
              <ChevronRight size={16} />
            </Link>
          </Card>
        ))}
        {forums.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            You are not enrolled in any courses with active forums.
          </div>
        )}
      </div>
    </div>
  );
};

const ResourcesTab = ({ courseId, user }: { courseId: number, user: User }) => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const data = await fetchJson(`/api/courses/${courseId}/resources`);
      setResources(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  const toggleViewed = async (contentId: number, currentStatus: boolean) => {
    await fetch(`/api/content/${contentId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_viewed: !currentStatus })
    });
    fetchResources();
  };

  if (loading) return <div className="py-8 text-center text-slate-400">Loading resources...</div>;

  const groupedResources = resources.reduce((acc: any, res: any) => {
    if (!acc[res.module_title]) acc[res.module_title] = [];
    acc[res.module_title].push(res);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Course Resources</h2>
        <p className="text-sm text-slate-500">Recorded lectures, podcasts, and all learning materials organized by module.</p>
      </header>

      <div className="space-y-6">
        {Object.entries(groupedResources).map(([moduleTitle, items]: [string, any]) => (
          <div key={moduleTitle} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">{moduleTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item: any) => (
                <Card key={item.id} className="p-4 hover:border-emerald-200 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        item.type === 'video' ? "bg-rose-50 text-rose-600" :
                        item.type === 'audio' || item.type === 'podcast' ? "bg-amber-50 text-amber-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {item.type === 'video' ? <Video size={20} /> :
                         item.type === 'audio' || item.type === 'podcast' ? <Mic size={20} /> :
                         <FileText size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.type} {item.is_external ? '• External' : ''}</p>
                          {item.creator_name && <span className="text-[10px] text-slate-400">• {item.creator_name}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {user.role === 'student' && (
                        <button 
                          onClick={() => toggleViewed(item.id, !!item.is_viewed)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            item.is_viewed ? "text-emerald-600 bg-emerald-50" : "text-slate-300 hover:text-slate-400"
                          )}
                        >
                          <CheckCircle size={18} fill={item.is_viewed ? "currentColor" : "none"} />
                        </button>
                      )}
                      
                      {item.allow_download && (
                        <a 
                          href={item.url} 
                          download 
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Download size={18} />
                        </a>
                      )}
                      
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            No resources available for this course yet.
          </div>
        )}
      </div>
    </div>
  );
};

const CourseGrades = ({ courseId, user }: { courseId: number, user: User }) => {
  const [grades, setGrades] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`/api/courses/${courseId}/my-grades`)
      .then(data => {
        setGrades(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [courseId]);

  if (loading) return <div className="py-8 text-center text-slate-400">Loading grades...</div>;

  const totalPossible = (grades.assignments?.reduce((acc: number, a: any) => acc + (a.max_points || 0), 0) || 0) +
                        (grades.tests?.reduce((acc: number, t: any) => acc + (t.max_score || 0), 0) || 0);
  
  const totalEarned = (grades.assignments?.reduce((acc: number, a: any) => acc + (a.grades_released ? (a.grade || 0) : 0), 0) || 0) +
                      (grades.tests?.reduce((acc: number, t: any) => acc + (t.score || 0), 0) || 0);

  const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  const isCompleted = percentage >= 60; // Assume 60% is passing

  const handleDownloadCertificate = () => {
    // Mock certificate download
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 800, 600);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 20;
      ctx.strokeRect(20, 20, 760, 560);
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 40px serif';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF COMPLETION', 400, 150);
      
      ctx.font = '24px sans-serif';
      ctx.fillText('This is to certify that', 400, 220);
      
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText(user.full_name || 'Student', 400, 280);
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '24px sans-serif';
      ctx.fillText('has successfully completed the course', 400, 340);
      
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Course ID: ' + courseId, 400, 390);
      
      ctx.font = '18px sans-serif';
      ctx.fillText('Date: ' + new Date().toLocaleDateString(), 400, 480);
      
      const link = document.createElement('a');
      link.download = `Certificate_Course_${courseId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Grades</h2>
          <p className="text-sm text-slate-500">Track your performance across assignments and tests.</p>
        </div>
        {isCompleted && (
          <button 
            onClick={handleDownloadCertificate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Download size={16} /> Download Certificate
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Overall Grade</div>
          <div className="text-4xl font-bold text-emerald-600">{percentage}%</div>
          <div className="text-xs text-slate-400 mt-1">{totalEarned} / {totalPossible} Points</div>
        </Card>
        
        <Card className="p-6 md:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4">Grade Breakdown</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Assignments</span>
                <span className="font-bold text-slate-900">
                  {grades.assignments?.reduce((acc: number, a: any) => acc + (a.grades_released ? (a.grade || 0) : 0), 0)} / {grades.assignments?.reduce((acc: number, a: any) => acc + (a.max_points || 0), 0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500" 
                  style={{ width: `${(grades.assignments?.reduce((acc: number, a: any) => acc + (a.max_points || 0), 0) > 0 ? (grades.assignments?.reduce((acc: number, a: any) => acc + (a.grades_released ? (a.grade || 0) : 0), 0) / grades.assignments?.reduce((acc: number, a: any) => acc + (a.max_points || 0), 0)) * 100 : 0)}%` }} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tests & Quizzes</span>
                <span className="font-bold text-slate-900">
                  {grades.tests?.reduce((acc: number, t: any) => acc + (t.score || 0), 0)} / {grades.tests?.reduce((acc: number, t: any) => acc + (t.max_score || 0), 0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${(grades.tests?.reduce((acc: number, t: any) => acc + (t.max_score || 0), 0) > 0 ? (grades.tests?.reduce((acc: number, t: any) => acc + (t.score || 0), 0) / grades.tests?.reduce((acc: number, t: any) => acc + (t.max_score || 0), 0)) * 100 : 0)}%` }} 
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Assignments</h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {grades.assignments?.map((a: any, i: number) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{a.title}</p>
                  {!a.grades_released && <p className="text-[10px] text-amber-600 font-bold uppercase">Pending Release</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{a.grades_released ? (a.grade ?? '-') : '-'}</p>
                  <p className="text-xs text-slate-400">out of {a.max_points}</p>
                </div>
              </div>
            ))}
            {grades.assignments?.length === 0 && <div className="p-8 text-center text-slate-400 text-sm italic">No assignments found</div>}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Tests</h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {grades.tests?.map((t: any, i: number) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <p className="font-bold text-slate-900">{t.title}</p>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{t.score ?? '-'}</p>
                  <p className="text-xs text-slate-400">out of {t.max_score}</p>
                </div>
              </div>
            ))}
            {grades.tests?.length === 0 && <div className="p-8 text-center text-slate-400 text-sm italic">No tests found</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestQuestionBuilder = ({ questions, setQuestions }: { questions: any[], setQuestions: (q: any[]) => void }) => {
  const [newQ, setNewQ] = useState({
    question_text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const addQuestion = () => {
    if (!newQ.question_text) return;
    
    if (editingIndex >= 0) {
      const updated = [...questions];
      updated[editingIndex] = newQ;
      setQuestions(updated);
      setEditingIndex(-1);
    } else {
      setQuestions([...questions, newQ]);
    }
    
    setNewQ({
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });
  };

  const startEdit = (index: number) => {
    setNewQ(questions[index]);
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setNewQ({
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200">
      <h4 className="font-bold text-slate-900 flex items-center gap-2">
        <PlusCircle size={18} className="text-emerald-600" />
        {editingIndex >= 0 ? 'Edit Question' : 'Add Questions'}
      </h4>
      
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Question Text</label>
            <input 
              type="text" 
              value={newQ.question_text}
              onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter question..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Type</label>
            <select 
              value={newQ.type}
              onChange={(e) => setNewQ({ ...newQ, type: e.target.value, options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : [] })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True / False</option>
              <option value="short_answer">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>
        </div>

        {newQ.type === 'multiple_choice' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Options (Select radio for correct answer)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {newQ.options.map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="correct" 
                    checked={newQ.correct_answer === opt && opt !== ''}
                    onChange={() => setNewQ({ ...newQ, correct_answer: opt })}
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => {
                      const next = [...newQ.options];
                      next[i] = e.target.value;
                      setNewQ({ ...newQ, options: next });
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {newQ.type === 'true_false' && (
          <div className="flex gap-4">
            {['True', 'False'].map(val => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tf" 
                  checked={newQ.correct_answer === val}
                  onChange={() => setNewQ({ ...newQ, correct_answer: val })}
                />
                <span className="text-sm font-medium">{val}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Points</label>
              <input 
                type="number" 
                value={newQ.points}
                onChange={(e) => setNewQ({ ...newQ, points: parseInt(e.target.value) || 1 })}
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editingIndex >= 0 && (
              <button 
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-700 transition-all"
              >
                Cancel
              </button>
            )}
            <button 
              type="button"
              onClick={addQuestion}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              {editingIndex >= 0 ? 'Update Question' : 'Add to Test'}
            </button>
          </div>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Added Questions ({questions.length})</h5>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className={cn(
                "p-3 bg-white rounded-xl border flex items-center justify-between transition-all",
                editingIndex === i ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/50" : "border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{q.question_text}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{q.type.replace('_', ' ')} • {q.points} pts</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => startEdit(i)}
                    className="p-1.5 text-slate-300 hover:text-emerald-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setQuestions(questions.filter((_, idx) => idx !== i));
                      if (editingIndex === i) cancelEdit();
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseDetail = ({ user }: { user: User }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'modules');
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState<{
    title: string;
    description: string;
    due_date: string;
    max_points: number | string;
    allow_late: boolean;
    late_penalty_percent: number;
    rubric: any[];
    min_word_count: number | string;
    allowed_file_types: string;
    moduleId: number | undefined;
  }>({
    title: '',
    description: '',
    due_date: '',
    max_points: 100,
    allow_late: false,
    late_penalty_percent: 0,
    rubric: [] as any[],
    min_word_count: 0,
    allowed_file_types: '.pdf,.docx',
    moduleId: undefined as number | undefined
  });
  const [newRubricItem, setNewRubricItem] = useState<{ name: string, points: number | string, description: string }>({ name: '', points: 0, description: '' });
  const [showAddTest, setShowAddTest] = useState(false);
  const [newTest, setNewTest] = useState<{
    title: string;
    description: string;
    time_limit_minutes: number | string;
    attempt_limit: number | string;
    is_randomized: boolean;
    random_count: number | string;
    passing_score: number | string;
    show_results_immediately: boolean;
    questions: any[];
    moduleId: number | undefined;
  }>({
    title: '',
    description: '',
    time_limit_minutes: 60,
    attempt_limit: 1,
    is_randomized: false,
    random_count: 5,
    passing_score: 50,
    show_results_immediately: true,
    questions: [] as any[],
    moduleId: undefined as number | undefined
  });

  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const fetchCourse = () => {
    fetchJson(`/api/courses/${id}`)
      .then(data => {
        setCourseData(data);
        if (data.modules && data.modules.length > 0 && expandedModule === null) {
          setExpandedModule(data.modules[0].id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleAddModule = async () => {
    const res = await fetch(`/api/courses/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newModuleTitle, order_index: courseData.modules.length + 1 })
    });
    if (res.ok) {
      setNewModuleTitle('');
      setShowAddModule(false);
      fetchCourse();
    }
  };

  const [showAddContent, setShowAddContent] = useState<number | null>(null);
  const [newContent, setNewContent] = useState({ 
    title: '', 
    type: 'document', 
    url: '', 
    description: '',
    allow_download: false,
    is_external: false
  });

  const handleAddContent = async (moduleId: number) => {
    const res = await fetch(`/api/modules/${moduleId}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newContent, order_index: 1 })
    });
    if (res.ok) {
      setNewContent({ 
        title: '', 
        type: 'document', 
        url: '', 
        description: '',
        allow_download: false,
        is_external: false
      });
      setShowAddContent(null);
      fetchCourse();
    }
  };

  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const handleAddAssignment = async (moduleId?: number) => {
    if (!moduleId || isNaN(moduleId)) {
      alert("Please select a module first.");
      return;
    }
    
    setIsCreatingAssignment(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newAssignment, 
          max_points: Number(newAssignment.max_points) || 0,
          min_word_count: Number(newAssignment.min_word_count) || 0,
          rubric_json: newAssignment.rubric 
        })
      });
      
      if (res.ok) {
        setNewAssignment({ 
          title: '', 
          description: '', 
          due_date: '', 
          max_points: 100, 
          allow_late: false, 
          late_penalty_percent: 0, 
          rubric: [], 
          min_word_count: 0, 
          allowed_file_types: '.pdf,.docx', 
          moduleId: undefined 
        });
        setShowAddAssignment(false);
        fetchCourse();
        alert("Assignment created successfully!");
      } else {
        const err = await res.json();
        alert(`Failed to create assignment: ${err.error || res.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the assignment.");
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const handleAddTest = async (moduleId?: number) => {
    if (!moduleId || isNaN(moduleId)) {
      alert("Please select a module first.");
      return;
    }
    
    setIsCreatingTest(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTest,
          time_limit_minutes: Number(newTest.time_limit_minutes) || 60,
          attempt_limit: Math.max(1, Number(newTest.attempt_limit) || 1),
          random_count: Number(newTest.random_count) || 0,
          passing_score: Number(newTest.passing_score) || 0
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const testId = data.id;
        
        if (newTest.questions.length > 0) {
          for (const q of newTest.questions) {
            const qRes = await fetch(`/api/tests/${testId}/questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(q)
            });
            if (!qRes.ok) {
              console.error("Failed to add question", q);
            }
          }
        }
        
        setNewTest({ 
          title: '', 
          description: '', 
          time_limit_minutes: 60, 
          attempt_limit: 1, 
          is_randomized: false, 
          random_count: 5, 
          passing_score: 50, 
          show_results_immediately: true, 
          questions: [], 
          moduleId: undefined 
        });
        setShowAddTest(false);
        fetchCourse();
        alert("Test created successfully!");
      } else {
        const err = await res.json();
        alert(`Failed to create test: ${err.error || res.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the test.");
    } finally {
      setIsCreatingTest(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading course...</div>;
  if (!courseData || !courseData.course) return <div className="p-8 text-center text-slate-500">Course not found</div>;

  return (
    <div className="space-y-8">
      <div className="relative h-64 rounded-3xl overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${courseData.course.code}/1200/400`} 
          className="w-full h-full object-cover"
          alt="Course Banner"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
          <Badge variant="success" className="w-fit mb-4">In Progress</Badge>
          <h1 className="text-4xl font-bold text-white mb-2">{courseData.course.title}</h1>
          <div className="flex items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{courseData.course.lecturers?.length || 1} Lecturers</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Started Jan 2026</span>
            </div>
          </div>
          {courseData.course.lecturers && courseData.course.lecturers.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-2 overflow-hidden">
                {courseData.course.lecturers.map((l: any) => (
                  <div key={l.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600" title={l.full_name}>
                    {l.full_name.charAt(0)}
                  </div>
                ))}
              </div>
              <span className="text-xs text-white/60">Assigned: {courseData.course.lecturers.map((l: any) => l.full_name).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {['modules', 'resources', 'assignments', 'tests', 'forum', 'grades'].filter(Boolean).map(tab => (
          <button
            key={tab!}
            onClick={() => setActiveTab(tab!)}
            className={cn(
              "px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap",
              activeTab === tab ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab!.replace('_', ' ')}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">Course Structure</h2>
                {(user.role === 'lecturer' || user.role === 'admin') && (
                  <button 
                    onClick={() => setShowAddModule(true)}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
                  >
                    <Plus size={16} /> Add Module
                  </button>
                )}
              </div>

              {showAddModule && (
                <Card className="p-4 border-emerald-200 bg-emerald-50/30">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="Module Title"
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button 
                      onClick={handleAddModule}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setShowAddModule(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </Card>
              )}

              {!courseData.isEnrolled && user.role === 'student' && (
                <Card className="p-8 text-center bg-amber-50 border-amber-200">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Enrollment Required</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    You need to be enrolled in this course to access the modules, lessons, and assignments.
                  </p>
                  <button 
                    onClick={async () => {
                      const res = await fetch(`/api/courses/${id}/enroll`, { method: 'POST' });
                      if (res.ok) {
                        setShowSuccessModal(true);
                        fetchCourse();
                      }
                    }}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                  >
                    Enroll Now
                  </button>
                </Card>
              )}

              {(courseData.isEnrolled || user.role !== 'student') && courseData.modules.map((module: any) => (
                <Card 
                  key={module.id} 
                  className={cn(
                    "p-4 hover:border-emerald-200 transition-all cursor-pointer group",
                    expandedModule === module.id && "border-emerald-500 shadow-lg shadow-emerald-500/5"
                  )}
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {module.order_index}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{module.title}</h3>
                        <p className="text-xs text-slate-400">
                          Lessons & Materials {module.creator_name && `• Created by ${module.creator_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(user.role === 'lecturer' || user.role === 'admin') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowAddContent(module.id); }}
                          className="p-2 text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                      <ChevronRight className={cn("text-slate-300 transition-transform", expandedModule === module.id && "rotate-90")} />
                    </div>
                  </div>
                  
                  {expandedModule === module.id && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <ModuleContent moduleId={module.id} user={user} />
                    </div>
                  )}
                  
                  {showAddContent === module.id && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Content Title"
                          value={newContent.title}
                          onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-200 outline-none"
                        />
                        <select 
                          value={newContent.type}
                          onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-200 outline-none"
                        >
                          <option value="document">Document</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio</option>
                          <option value="podcast">Podcast</option>
                        </select>
                      </div>
                      <input 
                        type="text" 
                        placeholder="URL (e.g. YouTube link, PDF link)"
                        value={newContent.url}
                        onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none"
                      />
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newContent.allow_download}
                            onChange={(e) => setNewContent({ ...newContent, allow_download: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          Allow Download
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newContent.is_external}
                            onChange={(e) => setNewContent({ ...newContent, is_external: e.target.checked })}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          External Stream
                        </label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setShowAddContent(null)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleAddContent(module.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg"
                        >
                          Add Content
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <ResourcesTab courseId={parseInt(id!)} user={user} />
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">Course Assignments</h2>
                {(user.role === 'lecturer' || user.role === 'admin') && (
                  <button 
                    onClick={() => setShowAddAssignment(true)}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
                  >
                    <Plus size={16} /> Create Assignment
                  </button>
                )}
              </div>

              {showAddAssignment && (
                <Card className="p-6 border-emerald-200 bg-emerald-50/30 space-y-4">
                  <h3 className="font-bold text-slate-900">New Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Assignment Title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <select 
                      className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newAssignment.moduleId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewAssignment({ ...newAssignment, moduleId: val ? parseInt(val) : undefined });
                      }}
                    >
                      <option value="">Select Module</option>
                      {courseData.modules.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <textarea 
                    placeholder="Assignment Description (Markdown supported)"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Due Date</label>
                      <input 
                        type="datetime-local" 
                        value={newAssignment.due_date}
                        onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Max Points</label>
                      <input 
                        type="number" 
                        value={newAssignment.max_points}
                        onChange={(e) => setNewAssignment({ ...newAssignment, max_points: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input 
                        type="checkbox" 
                        checked={newAssignment.allow_late}
                        onChange={(e) => setNewAssignment({ ...newAssignment, allow_late: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <label className="text-sm font-medium text-slate-700">Allow Late</label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Min Word Count</label>
                      <input 
                        type="number" 
                        value={newAssignment.min_word_count}
                        onChange={(e) => setNewAssignment({ ...newAssignment, min_word_count: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Allowed File Types</label>
                      <input 
                        type="text" 
                        placeholder=".pdf, .docx, .zip"
                        value={newAssignment.allowed_file_types}
                        onChange={(e) => setNewAssignment({ ...newAssignment, allowed_file_types: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm">Rubric Criteria</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input 
                        type="text" 
                        placeholder="Criterion Name"
                        value={newRubricItem.name}
                        onChange={(e) => setNewRubricItem({ ...newRubricItem, name: e.target.value })}
                        className="md:col-span-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
                      />
                      <input 
                        type="number" 
                        placeholder="Points"
                        value={newRubricItem.points}
                        onChange={(e) => setNewRubricItem({ ...newRubricItem, points: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
                      />
                      <button 
                        onClick={() => {
                          setNewAssignment({ ...newAssignment, rubric: [...newAssignment.rubric, newRubricItem] });
                          setNewRubricItem({ name: '', points: 0, description: '' });
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
                      >
                        Add Criterion
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newAssignment.rubric.map((r, i) => (
                        <Badge key={i} className="flex items-center gap-2">
                          {r.name} ({r.points}pts)
                          <button onClick={() => setNewAssignment({ ...newAssignment, rubric: newAssignment.rubric.filter((_, idx) => idx !== i) })}>
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setShowAddAssignment(false)} 
                      disabled={isCreatingAssignment}
                      className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleAddAssignment(newAssignment.moduleId)} 
                      disabled={isCreatingAssignment}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isCreatingAssignment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : "Create Assignment"}
                    </button>
                  </div>
                </Card>
              )}
              {courseData.modules.flatMap((m: any) => m.assignments || []).map((assignment: any) => (
                <Link to={`/assignments/${assignment.id}`} key={assignment.id}>
                  <Card className="p-4 hover:border-emerald-200 transition-colors group mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                          <p className="text-xs text-slate-400">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-1 text-xs font-bold rounded-full",
                          assignment.status === 'submitted' 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {assignment.status === 'submitted' ? 'Complete' : 'Outstanding'}
                        </span>
                        <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
              {courseData.modules.every((m: any) => !m.assignments || m.assignments.length === 0) && (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  No assignments posted for this course.
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">Online Assessments</h2>
                {(user.role === 'lecturer' || user.role === 'admin') && (
                  <button 
                    onClick={() => setShowAddTest(true)}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
                  >
                    <Plus size={16} /> Create Test
                  </button>
                )}
              </div>

              {showAddTest && (
                <Card className="p-6 border-emerald-200 bg-emerald-50/30 space-y-4">
                  <h3 className="font-bold text-slate-900">New Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Test Title"
                      value={newTest.title}
                      onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                      className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <select 
                      className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newTest.moduleId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewTest({ ...newTest, moduleId: val ? parseInt(val) : undefined });
                      }}
                    >
                      <option value="">Select Module</option>
                      {courseData.modules.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Time Limit (Mins)</label>
                      <input 
                        type="number" 
                        value={newTest.time_limit_minutes}
                        onChange={(e) => setNewTest({ ...newTest, time_limit_minutes: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Attempts</label>
                      <input 
                        type="number" 
                        value={newTest.attempt_limit}
                        onChange={(e) => setNewTest({ ...newTest, attempt_limit: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Passing Score %</label>
                      <input 
                        type="number" 
                        value={newTest.passing_score}
                        onChange={(e) => setNewTest({ ...newTest, passing_score: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input 
                        type="checkbox" 
                        checked={newTest.show_results_immediately}
                        onChange={(e) => setNewTest({ ...newTest, show_results_immediately: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <label className="text-sm font-medium text-slate-700">Show Results</label>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={newTest.is_randomized}
                        onChange={(e) => setNewTest({ ...newTest, is_randomized: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <label className="text-sm font-medium text-slate-700">Randomize Questions</label>
                    </div>
                    {newTest.is_randomized && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Pull</label>
                        <input 
                          type="number" 
                          value={newTest.random_count}
                          onChange={(e) => setNewTest({ ...newTest, random_count: e.target.value })}
                          className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <label className="text-xs font-bold text-slate-400 uppercase">Questions</label>
                      </div>
                    )}
                  </div>

                  <TestQuestionBuilder 
                    questions={newTest.questions} 
                    setQuestions={(questions) => setNewTest({ ...newTest, questions })} 
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setShowAddTest(false)} 
                      disabled={isCreatingTest}
                      className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleAddTest(newTest.moduleId)} 
                      disabled={isCreatingTest}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isCreatingTest ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : "Create Test"}
                    </button>
                  </div>
                </Card>
              )}

              {courseData.modules.flatMap((m: any) => m.tests || []).map((test: any) => (
                <div key={test.id} className="space-y-2">
                  <Link to={`/tests/${test.id}`}>
                    <Card className="p-4 hover:border-emerald-200 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Award size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{test.title}</h3>
                            <p className="text-xs text-slate-400">{test.time_limit_minutes} Mins • {test.attempt_limit} Attempts</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2 py-1 text-xs font-bold rounded-full",
                            test.status === 'completed' 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-amber-100 text-amber-700"
                          )}>
                            {test.status === 'completed' ? 'Complete' : 'Outstanding'}
                          </span>
                          <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                  {(user.role === 'lecturer' || user.role === 'admin') && (
                    <TestAnalytics testId={test.id} />
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'forum' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Course Discussion</h2>
                <Card className="p-6">
                  <ForumView url={`/api/courses/${id}/forum`} user={user} />
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Module-Specific Forums</h2>
                <div className="space-y-4">
                  {courseData.modules.map((m: any) => (
                    <details key={m.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <summary className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors list-none">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <MessageSquare size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{m.title} Forum</h3>
                            <p className="text-xs text-slate-400">Moderated discussion for this module</p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="p-6 pt-0 border-t border-slate-100">
                        <ForumView url={`/api/modules/${m.id}/forum`} user={user} />
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            user.role === 'lecturer' ? <LecturerCourseGrades courseId={parseInt(id!)} /> : <CourseGrades courseId={parseInt(id!)} user={user} />
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Course Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Completed</span>
                <span className="font-bold text-slate-900">65%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-slate-400 italic">Keep it up! You're ahead of the class average.</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex flex-col items-center justify-center font-bold text-[10px]">
                  <span>FEB</span>
                  <span className="text-lg leading-none">22</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Live Q&A Session</h4>
                  <p className="text-xs text-slate-400">14:00 - 15:00 via Zoom</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-bold text-[10px]">
                  <span>FEB</span>
                  <span className="text-lg leading-none">25</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Assignment 2 Due</h4>
                  <p className="text-xs text-slate-400">23:59 Deadline</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enrollment Successful!</h3>
              <p className="text-slate-500 mb-8">
                You have successfully enrolled in <span className="font-bold text-slate-900">{courseData.course.title}</span>. 
                You can now access all course materials and assignments.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                Start Learning
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserDetailModal = ({ userId, onClose }: { userId: number, onClose: () => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`/api/admin/users/${userId}/details`)
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch user details:", err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
              {data.user.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{data.user.full_name}</h2>
              <p className="text-sm text-slate-500">{data.user.email} • <Badge variant="info">{data.user.role}</Badge></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {data.user.status === 'pending' && (
            <section className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
              <h3 className="text-amber-900 font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={18} />
                Pending Approval Review
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-2">Payment Status</label>
                  <select 
                    id="paymentStatus"
                    className="w-full px-4 py-2 rounded-xl border border-amber-200 bg-white text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    defaultValue="unpaid"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="not_applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <button 
                    onClick={async () => {
                      const paymentStatus = (document.getElementById('paymentStatus') as HTMLSelectElement).value;
                      await fetch(`/api/admin/users/${userId}/status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'active', payment_status: paymentStatus })
                      });
                      onClose();
                      window.location.reload(); // Refresh to show updated status
                    }}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
                  >
                    Approve Account
                  </button>
                  <button 
                    onClick={async () => {
                      await fetch(`/api/admin/users/${userId}/status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'suspended' })
                      });
                      onClose();
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-200 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">User Details</h3>
              <div className="flex gap-2">
                <Badge variant={data.user.payment_status === 'paid' ? 'success' : 'warning'}>
                  Payment: {data.user.payment_status || 'unpaid'}
                </Badge>
                <Badge variant={data.user.status === 'active' ? 'success' : 'warning'}>
                  Status: {data.user.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-slate-50/50 border-none">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Joined</div>
                <div className="text-sm font-bold text-slate-900">{new Date(data.user.created_at).toLocaleDateString()}</div>
              </Card>
              <Card className="p-4 bg-slate-50/50 border-none">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Role</div>
                <div className="text-sm font-bold text-slate-900 capitalize">{data.user.role}</div>
              </Card>
              <Card className="p-4 bg-slate-50/50 border-none">
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Email</div>
                <div className="text-sm font-bold text-slate-900 truncate">{data.user.email}</div>
              </Card>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enrolled Courses</h3>
              <button 
                onClick={() => {
                  const courseId = prompt("Enter Course ID for manual enrollment:");
                  if (courseId) {
                    fetch('/api/admin/enroll', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId, courseId: parseInt(courseId) })
                    }).then(res => res.json()).then(data => {
                      if (data.success) {
                        alert("User enrolled successfully!");
                        window.location.reload();
                      } else {
                        alert(data.error);
                      }
                    });
                  }
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus size={14} />
                Manual Enroll
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.enrollments.map((e: any) => (
                <div key={e.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{e.course_title}</div>
                    <div className="text-xs text-slate-500">{e.course_code}</div>
                  </div>
                  <Badge variant={e.status === 'completed' ? 'success' : e.status === 'dropped' ? 'error' : 'info'}>
                    {e.status}
                  </Badge>
                </div>
              ))}
              {data.enrollments.length === 0 && <p className="text-slate-400 text-sm italic">No enrollments found.</p>}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Academic History</h3>
            <Card className="overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 font-bold text-slate-600">Assignment</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Course</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Grade</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.submissions.map((s: any) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{s.assignment_title}</td>
                      <td className="px-4 py-3 text-slate-500">{s.course_title}</td>
                      <td className="px-4 py-3">
                        {s.grade !== null ? <Badge variant="success">{s.grade} pts</Badge> : <Badge variant="warning">Pending</Badge>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(s.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {data.submissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No submissions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

const UsersManagement = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    phone_number: ''
  });
  const [addUserError, setAddUserError] = useState('');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setStatusFilter(status);
  }, [searchParams]);

  const fetchUsers = () => {
    fetchJson('/api/admin/users').then(data => {
      setUsers(data);
      setLoading(false);
    }).catch(err => console.error(err));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddUserModal(false);
        setNewUser({
          full_name: '',
          email: '',
          password: '',
          role: 'student',
          phone_number: ''
        });
        fetchUsers();
      } else {
        setAddUserError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setAddUserError('Failed to connect to server');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (userId: number, status: string) => {
    await fetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchUsers();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || 
                         u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">Manage all system users, roles, and access status.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm font-medium"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="lecturer">Lecturers</option>
          <option value="admin">Admins</option>
          <option value="sysadmin">System Admins</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Joined</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                      {u.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={u.role === 'sysadmin' ? 'error' : u.role === 'admin' ? 'warning' : u.role === 'lecturer' ? 'info' : 'default'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'error'}>
                    {u.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setSelectedUserId(u.id)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {u.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(u.id, 'active')}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-all"
                        title="Approve"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    {u.status === 'active' && u.role !== 'sysadmin' && (
                      <button 
                        onClick={() => handleStatusUpdate(u.id, 'suspended')}
                        className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-all"
                        title="Suspend"
                      >
                        <X size={18} />
                      </button>
                    )}
                    {u.status === 'suspended' && (
                      <button 
                        onClick={() => handleStatusUpdate(u.id, 'active')}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-all"
                        title="Activate"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedUserId(u.id)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {selectedUserId && <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Add New User</h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                {addUserError && (
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {addUserError}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    minLength={6}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const AdminCourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJson('/api/courses')
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.lecturer_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading courses...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Course Management</h1>
        <p className="text-slate-500 mt-1">View and manage all courses across the institution.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title, code, or lecturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Course</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Code</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Lecturer</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCourses.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{c.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{c.description}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="info">{c.code}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {c.lecturer_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm text-slate-700">{c.lecturer_name || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/courses/${c.id}`}
                    className="inline-flex items-center justify-center p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                    title="View Course"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No courses found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stats';
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any>(null);
  
  // Reports data
  const [engagement, setEngagement] = useState<any[]>([]);
  const [completion, setCompletion] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [dropOff, setDropOff] = useState<any[]>([]);
  const [lecturerActivity, setLecturerActivity] = useState<any[]>([]);

  // Course filters
  const [courseSearch, setCourseSearch] = useState('');
  const [assigningToCourse, setAssigningToCourse] = useState<number | null>(null);
  const [lecturersList, setLecturersList] = useState<any[]>([]);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const fetchCourses = () => {
    fetchJson('/api/admin/all-courses').then(setCourses).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchJson('/api/admin/stats').then(setStats).catch(err => console.error(err));
    fetchCourses();
    fetchJson('/api/admin/all-submissions').then(setSubmissions).catch(err => console.error(err));
    
    // Fetch lecturers for assignment
    fetchJson('/api/admin/users?role=lecturer').then(setLecturersList).catch(err => console.error(err));
    
    // Fetch reports
    fetchJson('/api/admin/reports/engagement').then(setEngagement).catch(err => console.error(err));
    fetchJson('/api/admin/reports/completion').then(setCompletion).catch(err => console.error(err));
    fetchJson('/api/admin/reports/performance').then(setPerformance).catch(err => console.error(err));
    fetchJson('/api/admin/reports/drop-off').then(setDropOff).catch(err => console.error(err));
    fetchJson('/api/admin/reports/lecturer-activity').then(setLecturerActivity).catch(err => console.error(err));
  }, []);

  const handleAssignLecturer = async (userId: number) => {
    if (!assigningToCourse) return;
    try {
      const res = await fetch(`/api/admin/courses/${assigningToCourse}/assign-lecturer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        alert("Lecturer assigned successfully!");
        setAssigningToCourse(null);
        // Refresh courses
        fetchCourses();
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to assign lecturer: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
                         c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
                         (c.lecturer_name && c.lecturer_name.toLowerCase().includes(courseSearch.toLowerCase()));
    return matchesSearch;
  });

  if (!stats) return <div className="p-8 text-center text-slate-500">Loading admin data...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Academic Administration</h1>
          <p className="text-slate-500 mt-1">Comprehensive overview of institutional performance and management.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => setActiveTab('reports')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={16} />
            Export Data
          </button>
          <button onClick={() => setIsNewCourseModalOpen(true)} className="px-4 py-2 bg-navy text-white rounded-xl font-bold text-sm shadow-lg shadow-navy/20 hover:bg-navy/90 transition-all flex items-center gap-2">
            <Plus size={16} />
            New Course
          </button>
        </div>
      </header>

      <div className="flex border-b border-slate-200 overflow-x-auto">
        {['stats', 'courses', 'submissions', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap",
              activeTab === tab ? "text-navy" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-1 bg-navy rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Users</div>
              <div className="text-3xl font-bold text-navy">{stats.users.count}</div>
              <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp size={12} /> +12% this month
              </div>
            </Card>
            <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen size={20} /></div>
              </div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Courses</div>
              <div className="text-3xl font-bold text-navy">{stats.courses.count}</div>
              <div className="mt-2 text-[10px] text-slate-400 font-bold">6 departments</div>
            </Card>
            <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-xl"><BarChart3 size={20} /></div>
              </div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Enrollments</div>
              <div className="text-3xl font-bold text-navy">{stats.enrollments.count}</div>
              <div className="mt-2 text-[10px] text-brand-orange font-bold flex items-center gap-1">
                <Users size={12} /> 2.4 avg per student
              </div>
            </Card>
            <Card className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-brand-red/10 text-brand-red rounded-xl"><FileText size={20} /></div>
              </div>
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Submissions</div>
              <div className="text-3xl font-bold text-navy">{stats.submissions.count}</div>
              <div className="mt-2 text-[10px] text-brand-red font-bold flex items-center gap-1">
                <AlertCircle size={12} /> 14 pending grading
              </div>
            </Card>
          </div>

          {stats.pendingApprovals.count > 0 && (
            <Card className="p-6 border-brand-orange/20 bg-brand-orange/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">Pending Approvals</h3>
                    <p className="text-sm text-slate-600">There are {stats.pendingApprovals.count} users waiting for account approval.</p>
                  </div>
                </div>
                <Link to="/admin/users?status=pending" className="px-6 py-2 bg-brand-orange text-white rounded-xl font-bold text-sm hover:bg-brand-orange/90 transition-all shadow-lg shadow-brand-orange/20">
                  Review Applications
                </Link>
              </div>
            </Card>
          )}

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
            <button onClick={() => setIsNewCourseModalOpen(true)} className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-navy hover:shadow-lg transition-all group text-left w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <div className="font-bold text-navy">New Course</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Create & Edit</div>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveTab('reports')} className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-navy hover:shadow-lg transition-all group text-left w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div className="font-bold text-navy">Analytics Hub</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Performance Metrics</div>
                </div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-navy flex items-center gap-2">
                    <Clock size={18} className="text-slate-400" />
                    Audit Log
                  </h3>
                  <button onClick={() => setActiveTab('reports')} className="text-[10px] font-bold text-navy uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {stats.recentLogs.map((log: any) => (
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
                  <button onClick={() => setActiveTab('submissions')} className="text-[10px] font-bold text-navy uppercase tracking-widest hover:underline">View All</button>
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
                  {stats.popularCourses.map((course: any, i: number) => (
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
                  {stats.recentUsers.map((user: any) => (
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
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by title, code, or lecturer..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <button onClick={() => setIsNewCourseModalOpen(true)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2">
              <Plus size={18} />
              New Course
            </button>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Course</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Lecturer</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Students</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Created</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900">{c.title}</div>
                        <div className="text-xs text-slate-500 font-mono">{c.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                          {c.lecturer_name ? c.lecturer_name.charAt(0) : '?'}
                        </div>
                        <span className="text-sm text-slate-600">{c.lecturer_name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{c.student_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setAssigningToCourse(c.id)}
                          className="p-2 bg-navy/10 text-navy rounded-xl hover:bg-navy/20 transition-all"
                          title="Assign Lecturer"
                        >
                          <UserPlus size={18} />
                        </button>
                        <Link 
                          to={`/courses/${c.id}`}
                          className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button 
                          onClick={() => setEditingCourse(c)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                        >
                          <Settings size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No courses found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'submissions' && submissions && (
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-bold text-navy mb-4">Assignment Submissions</h3>
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Assignment</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Submitted</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.assignmentSubmissions.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy">{s.student_name}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{s.course_title}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{s.assignment_title}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{new Date(s.submitted_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {s.grade !== null ? (
                          <Badge variant="success">{s.grade} pts</Badge>
                        ) : (
                          <Badge variant="warning">Ungraded</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <section>
            <h3 className="text-lg font-bold text-navy mb-4">Test Results</h3>
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Test</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Score</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.testResults.map((tr: any) => (
                    <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy">{tr.student_name}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{tr.course_title}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{tr.test_title}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-navy">{tr.score !== null ? `${tr.score}%` : '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={tr.status === 'completed' ? 'success' : 'warning'}>
                          {tr.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-12">
          <section>
            <h3 className="text-xl font-bold text-navy mb-6">Student Engagement</h3>
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Viewed Content</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Forum Posts</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {engagement.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy">{e.full_name}</td>
                      <td className="px-6 py-4 text-slate-500">{e.viewed_content}</td>
                      <td className="px-6 py-4 text-slate-500">{e.forum_posts}</td>
                      <td className="px-6 py-4 text-slate-500">{e.submissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <section>
            <h3 className="text-xl font-bold text-navy mb-6">Completion Rates</h3>
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Total Enrolled</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Completed</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completion.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy">{c.title}</td>
                      <td className="px-6 py-4 text-slate-500">{c.total_enrolled}</td>
                      <td className="px-6 py-4 text-slate-500">{c.completed_count}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {c.total_enrolled > 0 ? Math.round((c.completed_count / c.total_enrolled) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <section>
            <h3 className="text-xl font-bold text-navy mb-6">Assessment Performance</h3>
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Avg Assignment Grade</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Avg Test Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performance.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy">{p.title}</td>
                      <td className="px-6 py-4 text-slate-500">{p.avg_assignment_grade ? Math.round(p.avg_assignment_grade) : '-'}</td>
                      <td className="px-6 py-4 text-slate-500">{p.avg_test_score ? Math.round(p.avg_test_score) : '-'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <section>
            <h3 className="text-xl font-bold text-navy mb-6">Drop-off Analysis</h3>
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Total Enrolled</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Dropped</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Drop-off Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dropOff.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy">{d.title}</td>
                      <td className="px-6 py-4 text-slate-500">{d.total_enrolled}</td>
                      <td className="px-6 py-4 text-slate-500">{d.dropped_count}</td>
                      <td className="px-6 py-4 font-bold text-brand-red">
                        {d.total_enrolled > 0 ? Math.round((d.dropped_count / d.total_enrolled) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <section>
            <h3 className="text-xl font-bold text-navy mb-6">Lecturer Activity Reports</h3>
            <Card className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Lecturer</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Courses</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Forum Posts</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Graded Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lecturerActivity.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy">{l.full_name}</td>
                      <td className="px-6 py-4 text-slate-500">{l.courses_count}</td>
                      <td className="px-6 py-4 text-slate-500">{l.forum_posts}</td>
                      <td className="px-6 py-4 text-slate-500">{l.graded_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </div>
      )}

      {assigningToCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Assign Lecturer</h3>
              <button onClick={() => setAssigningToCourse(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {lecturersList.length > 0 ? lecturersList.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center font-bold">
                      {l.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy">{l.full_name}</div>
                      <div className="text-[10px] text-slate-400">{l.email}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAssignLecturer(l.id)}
                    className="px-4 py-1.5 bg-navy text-white rounded-lg text-xs font-bold hover:bg-navy/90 transition-all shadow-md shadow-navy/10"
                  >
                    Assign
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">No lecturers found.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {isNewCourseModalOpen && (
        <NewCourseModal 
          isOpen={isNewCourseModalOpen} 
          onClose={() => setIsNewCourseModalOpen(false)} 
          onSuccess={fetchCourses} 
        />
      )}

      {editingCourse && (
        <CourseSettingsModal 
          course={editingCourse} 
          isOpen={!!editingCourse} 
          onClose={() => setEditingCourse(null)} 
          onSuccess={fetchCourses} 
        />
      )}
    </div>
  );
};

const SysAdminDashboard = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchJson('/api/admin/logs').then(setLogs).catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">System Administration</h1>
        <p className="text-slate-500 mt-1">Monitor system logs and configure global settings.</p>
      </header>

      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-6">System Logs</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 truncate">{log.user_name || 'System'}</span>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-600"><span className="font-semibold text-emerald-600 uppercase text-[10px] tracking-wider mr-2">{log.action}</span> {log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const LecturerDashboard = ({ user }: { user: User }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const fetchData = () => {
    fetchJson('/api/lecturer/dashboard')
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Banner */}
      <div className="bg-navy rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-navy/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <Users size={20} className="text-blue-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Lecturer Portal</span>
          </div>
          <h2 className="text-4xl font-bold mb-2">Welcome back, {user.full_name}</h2>
          <p className="text-white/70 max-w-xl text-lg">
            Your courses are active and engaging. You have <span className="text-brand-orange font-bold">{data.stats.pendingGrades} submissions</span> waiting for your feedback and <span className="text-blue-400 font-bold">{data.stats.forumNew} new forum posts</span>.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all"
            >
              Create New Course
            </button>
            <Link to="/courses/my" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md hover:bg-white/20 transition-all">
              Manage My Courses
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <GraduationCap size={240} />
        </div>
      </div>

      <NewCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />

      {editingCourse && (
        <CourseSettingsModal 
          course={editingCourse} 
          isOpen={!!editingCourse} 
          onClose={() => setEditingCourse(null)} 
          onSuccess={fetchData} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.stats.totalStudents}</div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ChevronRight size={12} className="-rotate-90" /> +12% from last month
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText size={24} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Grades</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.stats.pendingGrades}</div>
          <div className="mt-2 text-xs text-slate-400 font-medium">Across all active assignments</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><MessageSquare size={24} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Forum Activity</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.stats.forumNew}</div>
          <div className="mt-2 text-xs text-slate-400 font-medium">New posts in the last 24h</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recent Submissions</h2>
              <button className="text-sm font-bold text-emerald-600 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {data.pendingSubmissions.map((sub: any) => (
                <Card key={sub.id} className="p-4 hover:border-emerald-200 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {sub.student_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{sub.student_name}</h4>
                        <p className="text-xs text-slate-400">{sub.assignment_title} • {sub.course_title}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/courses/${sub.course_id}?tab=assignments`}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all"
                    >
                      Grade Now
                    </Link>
                  </div>
                </Card>
              ))}
              {data.pendingSubmissions.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  No pending submissions to grade.
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Course Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.courseStats.map((course: any) => (
                <Card key={course.id} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="info">{course.code}</Badge>
                    <span className="text-xs font-bold text-slate-400">{course.student_count} Students</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-4">{course.title}</h3>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                        <FileText size={14} /> {course.pending_grades} Pending
                      </div>
                      <button 
                        onClick={() => setEditingCourse(course)}
                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                        title="Course Settings"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                    <Link to={`/courses/${course.id}`} className="text-xs font-bold text-emerald-600 hover:underline">
                      Manage Course
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Recent Forum Activity</h3>
            <div className="space-y-4">
              {data.forumActivity.map((post: any) => (
                <div key={post.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {post.user_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{post.user_name}</p>
                    <p className="text-[10px] text-slate-400 mb-1">{post.course_title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 italic">"{post.content}"</p>
                  </div>
                </div>
              ))}
              {data.forumActivity.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No recent activity.</p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-emerald-900 text-white">
            <h3 className="font-bold mb-2">Lecturer Tip</h3>
            <p className="text-sm text-emerald-100/80 mb-4">
              Regularly pinning important discussions in the forum can reduce repetitive questions by up to 40%.
            </p>
            <button className="text-xs font-bold underline hover:text-white transition-colors">
              Learn more about engagement
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

const TestTaking = ({ user }: { user: User }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPreview = user.role === 'lecturer' || user.role === 'admin';

  useEffect(() => {
    const startTest = async () => {
      try {
        const testData = await fetchJson(`/api/tests/${id}`);
        setTest(testData);

        if (!isPreview) {
          const startRes = await fetch(`/api/tests/${id}/start`, { method: 'POST' });
          if (!startRes.ok) {
            const err = await startRes.json().catch(() => ({ error: "Failed to start test" }));
            setError(err.error || "Failed to start test");
            setLoading(false);
            return;
          }
          const startData = await startRes.json();
          setAttemptId(startData.id);
          
          if (startData.resumed) {
             setAnswers(startData.answers || {});
             // Calculate remaining time
             const timeLimitSeconds = testData.time_limit_minutes * 60;
             const spent = startData.time_spent_seconds || 0;
             setTimeLeft(Math.max(0, timeLimitSeconds - spent));
          } else {
             setTimeLeft(testData.time_limit_minutes * 60);
          }
        } else {
          // For preview, just set time left to limit but don't count down or save
          setTimeLeft(testData.time_limit_minutes * 60);
        }

        const qData = await fetchJson(`/api/tests/${id}/questions`);
        setQuestions(qData);
        
        setLoading(false);
      } catch (err) {
        console.error("Test start failed:", err);
        setError("Failed to load test. Please try again.");
        setLoading(false);
      }
    };
    startTest();
  }, [id, isPreview]);

  useEffect(() => {
    if (isPreview || timeLeft === null || submitted || error) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, isPreview, error]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (isPreview || !attemptId || submitted || error) return;
    const saver = setInterval(() => {
      fetch(`/api/test-results/${attemptId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, time_spent_seconds: (test.time_limit_minutes * 60) - (timeLeft || 0) })
      });
    }, 30000);
    return () => clearInterval(saver);
  }, [attemptId, answers, timeLeft, submitted, isPreview, error]);

  const handleSubmit = async () => {
    if (submitted) return;
    
    if (isPreview) {
      setSubmitted(true);
      // Calculate a mock score for preview
      let mockScore = 0;
      questions.forEach(q => {
        if (q.type === 'multiple_choice' || q.type === 'true_false') {
          if (answers[q.id] === q.correct_answer) mockScore += q.points;
        }
      });
      setScore(mockScore);
      return;
    }

    const res = await fetch(`/api/test-results/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, time_spent_seconds: (test.time_limit_minutes * 60) - (timeLeft || 0) })
    });
    
    if (res.ok) {
      const data = await res.json();
      setScore(data.score);
      setSubmitted(true);
    } else {
      alert("Failed to submit test. Please try again.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Initializing test session...</div>;

  if (error) return (
    <Card className="max-w-2xl mx-auto p-12 text-center space-y-6 border-rose-200 bg-rose-50">
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Unable to Start Test</h2>
      <p className="text-slate-600">{error}</p>
      <button 
        onClick={() => navigate(-1)} 
        className="inline-block px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
      >
        Back to Course
      </button>
    </Card>
  );

  if (submitted) return (
    <Card className="max-w-2xl mx-auto p-12 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <Award size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">{isPreview ? 'Preview Completed' : 'Test Completed!'}</h2>
      <div className="text-5xl font-black text-emerald-600">{score} / {questions.reduce((acc, q) => acc + q.points, 0)}</div>
      <p className="text-slate-500">
        {isPreview 
          ? "This was a preview run. No results were saved." 
          : "Your results have been recorded. Some questions may require manual grading."}
      </p>
      <button 
        onClick={() => navigate(-1)} 
        className="inline-block px-8 py-3 bg-navy text-white rounded-xl font-bold shadow-lg shadow-navy/20 hover:bg-navy/90 transition-colors"
      >
        Back to Course
      </button>
    </Card>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
      >
        <ArrowLeft size={16} /> Back to Course
      </button>

      {isPreview && (
        <div className="bg-amber-100 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2 font-bold border border-amber-200">
          <Eye size={20} />
          <span>Preview Mode - Answers will not be saved</span>
        </div>
      )}
      
      <header className="flex items-center justify-between sticky top-20 bg-slate-50/80 backdrop-blur-md p-4 rounded-2xl z-30 border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{test.title}</h1>
          <p className="text-xs text-slate-500">{questions.length} Questions</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 font-mono font-bold text-xl px-4 py-2 rounded-xl",
          (timeLeft || 0) < 300 && !isPreview ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-900 text-white"
        )}>
          <Clock size={20} />
          <span>{formatTime(timeLeft || 0)}</span>
        </div>
      </header>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">{idx + 1}</span>
              <div className="space-y-4 flex-1">
                <p className="text-lg font-medium text-slate-900">{q.question_text}</p>
                {q.type === 'multiple_choice' && (
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border transition-all",
                          answers[q.id] === opt ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold" : "bg-white border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                        className={cn(
                          "w-full text-center px-4 py-3 rounded-xl border transition-all",
                          answers[q.id] === opt ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold" : "bg-white border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {(q.type === 'short_answer' || q.type === 'essay') && (
                  <textarea 
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                    placeholder="Type your answer here..."
                    value={answers[q.id] || ''}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={handleSubmit}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

const Layout = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotifications = async () => {
    try {
      const data = await fetchJson('/api/notifications');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path + '/'));
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 z-50 fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen flex flex-col",
        isSidebarOpen ? "w-72 translate-x-0" : "w-0 lg:w-20 -translate-x-full lg:translate-x-0 overflow-hidden"
      )}>
        <div className="p-6 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center shadow-lg shadow-navy/20">
              <GraduationCap size={24} />
            </div>
            {isSidebarOpen && <span className="text-xl font-bold text-navy tracking-tight">UH Academy</span>}
          </div>
          {isSidebarOpen && window.innerWidth < 1024 && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="px-4 space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={isActive('/dashboard')} onClick={closeSidebarOnMobile} />
          {user.role === 'student' && (
            <>
              <SidebarItem icon={BookOpen} label="My Courses" to="/courses/my" active={isActive('/courses/my')} onClick={closeSidebarOnMobile} />
              <SidebarItem icon={Search} label="Course Catalog" to="/courses" active={isActive('/courses') && !isActive('/courses/my')} onClick={closeSidebarOnMobile} />
            </>
          )}
          {user.role === 'lecturer' && (
            <>
              <SidebarItem icon={BookMarked} label="My Courses" to="/courses/my" active={isActive('/courses/my')} onClick={closeSidebarOnMobile} />
              <SidebarItem icon={Users} label="Students" to="/students" active={isActive('/students')} onClick={closeSidebarOnMobile} />
            </>
          )}
          <SidebarItem icon={MessageSquare} label="Community" to="/community" active={isActive('/community')} onClick={closeSidebarOnMobile} />
          {(user.role === 'admin' || user.role === 'sysadmin') && (
            <>
              <SidebarItem icon={LayoutDashboard} label="Academic Admin" to="/admin" active={isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/courses')} onClick={closeSidebarOnMobile} />
              <SidebarItem icon={Users} label="Users" to="/admin/users" active={isActive('/admin/users')} onClick={closeSidebarOnMobile} />
              <SidebarItem icon={BookOpen} label="All Courses" to="/admin/courses" active={isActive('/admin/courses')} onClick={closeSidebarOnMobile} />
            </>
          )}
          {user.role === 'sysadmin' && (
            <SidebarItem icon={Settings} label="System Admin" to="/sysadmin" active={isActive('/sysadmin')} onClick={closeSidebarOnMobile} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <SidebarItem icon={Settings} label="Settings" to="/settings" onClick={closeSidebarOnMobile} />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 lg:hidden">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-slate-900 hidden lg:block">Welcome back, {user.full_name}</span>
            <span className="ml-4 font-bold text-slate-900 lg:hidden">UH Academy</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <Badge variant="info">{unreadCount} New</Badge>
                      </div>
                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={cn("p-4 hover:bg-slate-50 transition-colors cursor-pointer", !n.is_read && "bg-emerald-50/30")}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) navigate(n.link);
                              setShowNotifications(false);
                            }}
                          >
                            <p className="text-sm text-slate-900 font-medium">{n.content}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="p-8 text-center text-slate-400 text-sm italic">No notifications yet</div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-200">
              {user.full_name?.charAt(0)}
            </div>
          </div>
        </header>
        
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const SettingsPage = ({ user }: { user: User }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    bio: '',
    avatar_url: ''
  });
  const [notifications, setNotifications] = useState({
    email_announcements: true,
    email_assignments: true,
    email_forum: false,
    push_reminders: true,
    push_messages: true
  });
  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    compactMode: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Fetch full profile data
    fetchJson('/api/auth/me')
      .then(data => {
        if (data.user) {
          setProfile(prev => ({
            ...prev,
            full_name: data.user.full_name || data.user.name || '',
            email: data.user.email || ''
          }));
        }
      })
      .catch(err => console.error("Profile fetch failed:", err));
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profile.full_name, bio: profile.bio })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and system settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeSection === section.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <Card className="p-8">
            {message && (
              <div className={cn(
                "mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium",
                message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
              )}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
                {message.text}
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold border-2 border-emerald-200 overflow-hidden">
                      {profile.full_name.charAt(0)}
                    </div>
                    <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold">
                      Change
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Profile Picture</h3>
                    <p className="text-sm text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed. Contact administration if needed.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Short Bio</label>
                    <textarea 
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us a bit about yourself..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">Update Password</button>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                    </div>
                    <Badge variant="warning">Disabled</Badge>
                  </div>
                  <button className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline">
                    <Shield size={16} /> Enable 2FA
                  </button>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Active Sessions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">iPhone 13 Pro • London, UK</p>
                          <p className="text-xs text-slate-400">Current Session</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-rose-600 hover:underline">Log out</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'email_announcements', label: 'Course Announcements', desc: 'Get notified when lecturers post new announcements.' },
                      { id: 'email_assignments', label: 'Assignment Deadlines', desc: 'Reminders for upcoming assignment due dates.' },
                      { id: 'email_forum', label: 'Forum Replies', desc: 'Notifications when someone replies to your forum posts.' }
                    ].map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(notifications as any)[item.id]} 
                            onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Push Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'push_reminders', label: 'Study Reminders', desc: 'Daily reminders to keep up with your learning goals.' },
                      { id: 'push_messages', label: 'Direct Messages', desc: 'Get notified when you receive a message from a peer or lecturer.' }
                    ].map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(notifications as any)[item.id]} 
                            onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Theme Preference</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Globe }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setAppearance({ ...appearance, theme: item.id })}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                          appearance.theme === item.id ? "border-emerald-600 bg-emerald-50/50" : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <item.icon className={appearance.theme === item.id ? "text-emerald-600" : "text-slate-400"} />
                        <span className={cn("text-sm font-bold", appearance.theme === item.id ? "text-emerald-600" : "text-slate-600")}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Accessibility</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Font Size</label>
                      <div className="flex gap-2">
                        {['small', 'medium', 'large'].map(size => (
                          <button
                            key={size}
                            onClick={() => setAppearance({ ...appearance, fontSize: size })}
                            className={cn(
                              "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                              appearance.fontSize === size ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Compact Mode</p>
                        <p className="text-xs text-slate-500">Reduce spacing to show more content at once.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={appearance.compactMode} 
                          onChange={(e) => setAppearance({ ...appearance, compactMode: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Profile Privacy</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Public Profile', desc: 'Allow other students to see your profile and bio.' },
                      { label: 'Show Progress', desc: 'Share your course completion status with peers.' },
                      { label: 'Activity Status', desc: 'Show when you are online to your classmates.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 text-rose-600">Danger Zone</h3>
                  <div className="p-6 border border-rose-100 bg-rose-50/30 rounded-2xl">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Deactivate Account</h4>
                    <p className="text-xs text-slate-500 mb-4">This will temporarily hide your profile and data. You can reactivate anytime.</p>
                    <button className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20">Deactivate</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson('/api/auth/me')
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
  </div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        
        <Route path="/" element={user ? <Layout user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={user?.role === 'lecturer' ? <LecturerDashboard user={user} /> : <Dashboard user={user!} />} />
          <Route path="courses" element={<CourseCatalog />} />
          <Route path="courses/my" element={<MyCourses user={user!} />} />
          <Route path="courses/:id" element={<CourseDetail user={user!} />} />
          <Route path="community" element={<Community user={user!} />} />
          <Route path="students" element={<Students user={user!} />} />
          <Route path="settings" element={<SettingsPage user={user!} />} />
          <Route path="assignments/:id" element={<AssignmentView user={user!} />} />
          <Route path="tests/:id" element={<TestTaking user={user!} />} />
          <Route path="test-attempts/:id" element={<TestAttemptView user={user!} />} />
          <Route path="admin" element={(user?.role === 'admin' || user?.role === 'sysadmin') ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="admin/users" element={(user?.role === 'admin' || user?.role === 'sysadmin') ? <UsersManagement /> : <Navigate to="/" />} />
          <Route path="admin/courses" element={(user?.role === 'admin' || user?.role === 'sysadmin') ? <AdminCourseList /> : <Navigate to="/" />} />
          <Route path="sysadmin" element={user?.role === 'sysadmin' ? <SysAdminDashboard /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}
