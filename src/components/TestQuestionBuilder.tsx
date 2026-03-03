import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';

export const TestQuestionBuilder = ({ questions, setQuestions }: { questions: any[], setQuestions: (q: any[]) => void }) => {
  const [newQ, setNewQ] = useState({
    question_text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addQuestion = () => {
    if (!newQ.question_text) return;
    
    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQ;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
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

  const handleEdit = (index: number) => {
    setNewQ(questions[index]);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setNewQ({
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900">{editingIndex !== null ? 'Edit Question' : 'Add Questions'}</h3>
          {editingIndex !== null && (
            <button 
              onClick={handleCancelEdit}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Question Text</label>
          <textarea 
            value={newQ.question_text}
            onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
            placeholder="Enter your question here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Question Type</label>
            <select 
              value={newQ.type}
              onChange={(e) => setNewQ({ ...newQ, type: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True / False</option>
              <option value="short_answer">Short Answer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Points</label>
            <input 
              type="number" 
              value={newQ.points}
              onChange={(e) => setNewQ({ ...newQ, points: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {newQ.type === 'multiple_choice' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Options</label>
            {newQ.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correct_answer"
                  checked={newQ.correct_answer === opt && opt !== ''}
                  onChange={() => setNewQ({ ...newQ, correct_answer: opt })}
                  className="w-4 h-4 accent-emerald-600"
                  disabled={!opt}
                />
                <input 
                  type="text" 
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...newQ.options];
                    newOpts[idx] = e.target.value;
                    setNewQ({ ...newQ, options: newOpts });
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Option ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        {newQ.type === 'true_false' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Correct Answer</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tf_answer"
                  checked={newQ.correct_answer === 'True'}
                  onChange={() => setNewQ({ ...newQ, correct_answer: 'True' })}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-700">True</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tf_answer"
                  checked={newQ.correct_answer === 'False'}
                  onChange={() => setNewQ({ ...newQ, correct_answer: 'False' })}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-700">False</span>
              </label>
            </div>
          </div>
        )}

        {newQ.type === 'short_answer' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Sample Answer (for grading reference)</label>
            <input 
              type="text" 
              value={newQ.correct_answer}
              onChange={(e) => setNewQ({ ...newQ, correct_answer: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter sample answer..."
            />
          </div>
        )}

        <button 
          onClick={addQuestion}
          disabled={!newQ.question_text || !newQ.correct_answer}
          className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-slate-800 transition-colors"
        >
          Add Question
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Added Questions ({questions.length})</h5>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start group">
                <div>
                  <p className="font-medium text-sm text-slate-900 line-clamp-1">{q.question_text}</p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{q.type.replace('_', ' ')} • {q.points} pts</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(i)}
                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Edit Question"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
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
