import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, GraduationCap, FileText, MessageSquare, ChevronRight, Settings, BookOpen, X 
} from 'lucide-react';
import { User } from '../../types';
import { fetchJson, cn } from '../../lib/utils';
import { Card, Badge } from '../../components/ui';

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

export const LecturerDashboard = ({ user }: { user: User }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const fetchData = () => {
    fetchJson('/api/lecturer/dashboard')
      .then(data => {
        setData(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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
              {data.pendingSubmissions.map((sub: any, index: number) => (
                <Card key={`${sub.type}-${sub.submission_id}-${index}`} className="p-4 hover:border-emerald-200 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {sub.student_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{sub.student_name}</h4>
                        <p className="text-xs text-slate-400">
                          <span className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mr-2",
                            sub.type === 'test' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {sub.type}
                          </span>
                          {sub.item_title} • {sub.course_title}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to={sub.type === 'test' ? `/test-attempts/${sub.submission_id}` : `/assignments/${sub.item_id}`}
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
              {data.courseStats.map((course: any, index: number) => (
                <Card key={`${course.id}-${index}`} className="p-5">
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
              {data.forumActivity.map((post: any, index: number) => (
                <div key={`${post.id}-${index}`} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
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
