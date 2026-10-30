import React, { useState } from 'react';
import { Upload, FileText, Plus, Edit, Trash2, Cpu, CheckCircle } from 'lucide-react';

export default function ResourceCenter() {
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'DBMS Unit 3 - Normalization & Indexing',
      type: 'PDF Document',
      size: '2.4 MB',
      updatedAt: 'Oct 28, 2026',
      ragStatus: 'Indexed'
    },
    {
      id: 2,
      title: 'CS Semester 5 Consultation Timetable Rules',
      type: 'Text File',
      size: '18 KB',
      updatedAt: 'Oct 20, 2026',
      ragStatus: 'Indexed'
    }
  ]);

  const [textInputTitle, setTextInputTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  const handleAddTextResource = (e) => {
    e.preventDefault();
    if (!textInputTitle || !textContent) return;

    const newRes = {
      id: Date.now(),
      title: textInputTitle,
      type: 'Text File',
      size: `${Math.round(textContent.length / 100)} KB`,
      updatedAt: 'Just now',
      ragStatus: 'Indexing...'
    };

    setResources([newRes, ...resources]);
    setTextInputTitle('');
    setTextContent('');
  };

  const handleDelete = (id) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Resource Center (RAG Feeder)</h1>
        <p className="text-sm text-slate-500">
          Upload PDF notes, syllabus files, or paste custom rules. Content uploaded here feeds into Bodhi AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Add Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-900" />
            <span>Add / Upload Resource</span>
          </h2>

          {/* Drag & Drop Box */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-900/40 rounded-xl p-6 text-center bg-slate-50/50 cursor-pointer transition-all">
            <Upload className="w-8 h-8 text-blue-900 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Click or drag PDF / DOCX file to upload</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports PDF, DOC, TXT up to 10MB</p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-bold uppercase">Or Paste Text</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Manual Text Editor Form */}
          <form onSubmit={handleAddTextResource} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Mid-Sem Assignment Syllabus & Rules"
                value={textInputTitle}
                onChange={(e) => setTextInputTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Content Body</label>
              <textarea
                rows="4"
                placeholder="Paste course notes, exam policies, or consultation guidelines here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
            >
              <Cpu className="w-4 h-4" />
              <span>Feed Content to RAG Pipeline</span>
            </button>
          </form>
        </div>

        {/* Existing Resources List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-900" />
            <span>Active RAG Knowledge Base Files</span>
          </h2>

          <div className="space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{res.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {res.type} • {res.size} • Updated {res.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {res.ragStatus}
                  </span>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}