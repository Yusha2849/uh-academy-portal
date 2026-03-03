import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, Mic, FileText, CheckCircle, Download, ExternalLink, 
  Pin, Flag, MessageSquare 
} from 'lucide-react';
import { User } from '../types';
import { fetchJson, cn } from '../lib/utils';
import { Card, Badge } from './ui';

export const TestAnalytics = ({ testId }: { testId: number }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchJson(`/api/tests/${testId}/analytics`).then(setStats).catch(err => console.error(err));
  }, [testId]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attempts</p>
        <p className="text-xl font-bold text-slate-900">{stats.total_attempts}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
        <p className="text-xl font-bold text-emerald-600">{stats.average_score?.toFixed(1) || 0}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Score</p>
        <p className="text-xl font-bold text-slate-900">{stats.max_score || 0}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Score</p>
        <p className="text-xl font-bold text-slate-900">{stats.min_score || 0}</p>
      </div>
    </div>
  );
};

export const ForumView = ({ url, user }: { url: string, user: User }) => {
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

export const ModuleContent = ({ moduleId, user }: { moduleId: number, user: User }) => {
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const ResourcesTab = ({ courseId, user }: { courseId: number, user: User }) => {
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

export const CourseGrades = ({ courseId, user }: { courseId: number, user: User }) => {
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
