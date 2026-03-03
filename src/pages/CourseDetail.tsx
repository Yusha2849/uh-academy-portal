import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, Calendar, Plus, BookOpen, ChevronRight, Award, FileText, Settings, Trash2, Edit
} from 'lucide-react';
import { User } from '../types';
import { fetchJson, cn } from '../lib/utils';
import { Card, Badge } from '../components/ui';
import { TestQuestionBuilder } from '../components/TestQuestionBuilder';
import { 
  TestAnalytics, ModuleContent, ResourcesTab, CourseGrades, ForumView 
} from '../components/course-components';

export const CourseDetail = ({ user }: { user: User }) => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules');
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
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
  const [newRubricItem, setNewRubricItem] = useState({ name: '', points: 0, description: '' });
  const [showAddTest, setShowAddTest] = useState(false);
  const [newTest, setNewTest] = useState({
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
        setLoading(false);
      })
      .catch(err => console.error(err));
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
        body: JSON.stringify({ ...newAssignment, rubric_json: newAssignment.rubric })
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
  const [editingTestId, setEditingTestId] = useState<number | null>(null);

  const handleEditTest = async (test: any) => {
    try {
      const qData = await fetchJson(`/api/tests/${test.id}/questions`);
      setNewTest({
        title: test.title,
        description: test.description || '',
        time_limit_minutes: test.time_limit_minutes,
        attempt_limit: test.attempt_limit,
        is_randomized: test.is_randomized,
        random_count: test.random_count,
        passing_score: test.passing_score,
        show_results_immediately: test.show_results_immediately,
        questions: qData,
        moduleId: test.module_id
      });
      setEditingTestId(test.id);
      setShowAddTest(true);
    } catch (err) {
      console.error("Failed to fetch test details", err);
      alert("Failed to load test for editing");
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCourse();
        alert("Test deleted successfully.");
      } else {
        alert("Failed to delete test.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the test.");
    }
  };

  const handleAddTest = async (moduleId?: number) => {
    if (!moduleId || isNaN(moduleId)) {
      alert("Please select a module first.");
      return;
    }
    
    setIsCreatingTest(true);
    try {
      const url = editingTestId ? `/api/tests/${editingTestId}` : `/api/modules/${moduleId}/tests`;
      const method = editingTestId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      
      if (res.ok) {
        const data = await res.json();
        const testId = editingTestId || data.id;
        
        // Handle questions update (simplified: delete all and re-add for now, or handle diff)
        // For simplicity, let's assume the backend handles questions if sent in the body, 
        // OR we need to manually update them.
        // If editing, we might need to be careful.
        // Let's try to update questions manually if not handled by the main endpoint.
        
        if (newTest.questions.length > 0) {
          // First, delete existing questions if editing (to avoid duplicates/complexity)
          if (editingTestId) {
            await fetch(`/api/tests/${testId}/questions`, { method: 'DELETE' });
          }

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
        setEditingTestId(null);
        setShowAddTest(false);
        fetchCourse();
        alert(editingTestId ? "Test updated successfully!" : "Test created successfully!");
      } else {
        const err = await res.json();
        alert(`Failed to ${editingTestId ? 'update' : 'create'} test: ${err.error || res.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert(`An error occurred while ${editingTestId ? 'updating' : 'creating'} the test.`);
    } finally {
      setIsCreatingTest(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading course...</div>;

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

              {courseData.modules.map((module: any) => (
                <Card key={module.id} className="overflow-hidden">
                  <div 
                    className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("transition-transform duration-200", expandedModule === module.id ? "rotate-90" : "")}>
                        <ChevronRight size={20} className="text-slate-400" />
                      </div>
                      <h3 className="font-bold text-slate-900">{module.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{module.content?.length || 0} Items</span>
                      {(user.role === 'lecturer' || user.role === 'admin') && (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowAddContent(module.id); }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Add Content"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {expandedModule === module.id && (
                    <div className="p-4">
                      {showAddContent === module.id && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <input 
                            type="text" 
                            placeholder="Content Title"
                            value={newContent.title}
                            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <select 
                              value={newContent.type}
                              onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                              className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="document">Document</option>
                              <option value="video">Video</option>
                              <option value="audio">Audio</option>
                              <option value="quiz">Quiz</option>
                            </select>
                            <input 
                              type="text" 
                              placeholder="URL"
                              value={newContent.url}
                              onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                              className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={newContent.allow_download}
                              onChange={(e) => setNewContent({ ...newContent, allow_download: e.target.checked })}
                              className="w-4 h-4 accent-emerald-600"
                            />
                            <label className="text-sm text-slate-600">Allow Download</label>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddContent(null)} className="px-3 py-1.5 text-slate-500 font-bold text-sm">Cancel</button>
                            <button onClick={() => handleAddContent(module.id)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-sm">Add</button>
                          </div>
                        </div>
                      )}
                      
                      <ModuleContent moduleId={module.id} user={user} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'resources' && <ResourcesTab courseId={courseData.course.id} user={user} />}
          
          {activeTab === 'grades' && <CourseGrades courseId={courseData.course.id} user={user} />}
          
          {activeTab === 'forum' && courseData.course.forum_id && (
            <ForumView url={`/api/forums/${courseData.course.forum_id}`} user={user} />
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900">Assignments</h2>
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
                    placeholder="Description / Instructions"
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
                        onChange={(e) => setNewAssignment({ ...newAssignment, max_points: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
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
                      <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
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
                  <h3 className="font-bold text-slate-900">{editingTestId ? 'Edit Assessment' : 'New Assessment'}</h3>
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
                      disabled={!!editingTestId}
                    >
                      <option value="">Select Module</option>
                      {courseData.modules.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <textarea 
                    placeholder="Description (Optional)"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Time Limit (Mins)</label>
                      <input 
                        type="number" 
                        value={newTest.time_limit_minutes}
                        onChange={(e) => setNewTest({ ...newTest, time_limit_minutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Attempts</label>
                      <input 
                        type="number" 
                        min="1"
                        value={newTest.attempt_limit}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setNewTest({ ...newTest, attempt_limit: val > 0 ? val : 1 });
                        }}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Passing Score %</label>
                      <input 
                        type="number" 
                        value={newTest.passing_score}
                        onChange={(e) => setNewTest({ ...newTest, passing_score: parseInt(e.target.value) || 0 })}
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
                          onChange={(e) => setNewTest({ ...newTest, random_count: parseInt(e.target.value) || 0 })}
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
                      onClick={() => {
                        setShowAddTest(false);
                        setEditingTestId(null);
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
                      }} 
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
                          {editingTestId ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (editingTestId ? "Update Test" : "Create Test")}
                    </button>
                  </div>
                </Card>
              )}

              {courseData.modules.flatMap((m: any) => m.tests || []).map((test: any) => (
                <div key={test.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link to={`/tests/${test.id}`} className="flex-1">
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
                          <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>
                    {(user.role === 'lecturer' || user.role === 'admin') && (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleEditTest(test)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                          title="Edit Test"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                          title="Delete Test"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  {(user.role === 'lecturer' || user.role === 'admin') && (
                    <TestAnalytics testId={test.id} />
                  )}
                </div>
              ))}
              {courseData.modules.every((m: any) => !m.tests || m.tests.length === 0) && (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  No assessments created for this course.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Course Progress</h3>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${courseData.progress || 0}%` }} 
              />
            </div>
            <p className="text-xs text-slate-500 text-right">{courseData.progress || 0}% Complete</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {courseData.modules.flatMap((m: any) => m.assignments || [])
                .filter((a: any) => new Date(a.due_date) > new Date())
                .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .slice(0, 3)
                .map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{a.title}</p>
                      <p className="text-xs text-slate-400">{new Date(a.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              {courseData.modules.flatMap((m: any) => m.assignments || []).filter((a: any) => new Date(a.due_date) > new Date()).length === 0 && (
                <p className="text-sm text-slate-400 italic">No upcoming deadlines.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Enrolled Successfully!</h2>
              <p className="text-slate-500 mb-6">
                You now have full access to the course materials. Good luck with your studies!
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
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
