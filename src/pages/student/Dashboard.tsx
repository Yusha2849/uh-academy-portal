import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, BarChart3, ChevronRight, PlayCircle, MessageSquare, GraduationCap 
} from 'lucide-react';
import { User } from '../../types';
import { fetchJson, cn } from '../../lib/utils';
import { Card, Badge } from '../../components/ui';

export const StudentDashboard = ({ user }: { user: User }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson('/api/student/dashboard')
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Student dashboard fetch failed:", err);
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
