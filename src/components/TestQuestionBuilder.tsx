import { useState } from 'react';
import { Trash2, Edit2, PlusCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const TestQuestionBuilder = ({ questions, setQuestions }: { questions: any[], setQuestions: (q: any[]) => void }) => {
  const [newQ, setNewQ] = useState({
    question_text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });

  // FIX: Use null instead of -1 to avoid numeric comparison bugs
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addQuestion = () => {
    if (!newQ.question_text) return;

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = { ...newQ };
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, { ...newQ }]);
    }

    // Reset form
    setNewQ({
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });
  };

  const startEdit = (index: number) => {
    const q = questions[index];
    setNewQ({
      question_text: q.question_text || '',
      type: q.type || 'multiple_choice',
      options: q.options?.length ? q.options : ['', '', '', ''],
      correct_answer: q.correct_answer || '',
      points: q.points || 1
    });
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewQ({
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
    if (editingIndex === index) cancelEdit();
  };

  const handleTypeChange = (type: string) => {
    setNewQ({
      ...newQ,
      type,
      options: type === 'multiple_choice' ? ['', '', '', ''] : [],
      correct_answer: ''
    });
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200">
      <h4 className="font-bold text-slate-900 flex items-center gap-2">
        <PlusCircle size={18} className="text-emerald-600" />
        {editingIndex !== null ? 'Edit Question' : 'Add Questions'}
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
              onChange={(e) => handleTypeChange(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">
              Options (select radio for correct answer)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {newQ.options.map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct_mc_${editingIndex ?? 'new'}`}
                    checked={newQ.correct_answer === opt && opt !== ''}
                    onChange={() => opt && setNewQ({ ...newQ, correct_answer: opt })}
                    disabled={!opt}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...newQ.options];
                      next[i] = e.target.value;
                      // If this was the correct answer, update it
                      const newCorrect = newQ.correct_answer === opt ? e.target.value : newQ.correct_answer;
                      setNewQ({ ...newQ, options: next, correct_answer: newCorrect });
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
            {['True', 'False'].map((val) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`tf_${editingIndex ?? 'new'}`}
                  checked={newQ.correct_answer === val}
                  onChange={() => setNewQ({ ...newQ, correct_answer: val })}
                />
                <span className="text-sm font-medium">{val}</span>
              </label>
            ))}
          </div>
        )}

        {(newQ.type === 'short_answer' || newQ.type === 'essay') && (
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">
              Sample / Model Answer (for grading reference)
            </label>
            <input
              type="text"
              value={newQ.correct_answer}
              onChange={(e) => setNewQ({ ...newQ, correct_answer: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter model answer..."
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Points</label>
            <input
              type="number"
              min={1}
              value={newQ.points}
              onChange={(e) => setNewQ({ ...newQ, points: parseInt(e.target.value) || 1 })}
              className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {editingIndex !== null && (
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
              disabled={!newQ.question_text}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-40"
            >
              {editingIndex !== null ? 'Update Question' : 'Add to Test'}
            </button>
          </div>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Added Questions ({questions.length})
          </h5>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 bg-white rounded-xl border flex items-center justify-between transition-all',
                  editingIndex === i
                    ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400 shrink-0">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{q.question_text}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {q.type?.replace('_', ' ')} • {q.points} pts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(i)}
                    className="p-1.5 text-slate-300 hover:text-emerald-600 transition-colors"
                    title="Edit question"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Remove question"
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

export default TestQuestionBuilder;
