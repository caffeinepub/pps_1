import { useState, useRef } from 'react';
import { useAppStore, MessageData } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Send, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';

interface Props { selectedSession: string; }

export default function TeacherCommunication({ selectedSession }: Props) {
  const { sessions, students, messages, addMessage, currentUser } = useAppStore();
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sessionData = sessions.find((s) => s.id === selectedSession);
  const classStudents = students
    .filter((s) => s.classId === selectedClass && s.sessionId === selectedSession)
    .filter((s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const studentMessages = messages.filter(
    (m) => m.studentId === selectedStudent && m.teacherId === currentUser?.teacherId
  );

  const handleSend = () => {
    if (!messageText.trim() && attachments.length === 0) return;
    if (!selectedStudent || !currentUser?.teacherId) return;
    addMessage({
      teacherId: currentUser.teacherId,
      studentId: selectedStudent,
      content: messageText,
      attachments,
      type: 'text',
    });
    setMessageText(''); setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAttachments((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  if (selectedStudent) {
    const student = students.find((s) => s.id === selectedStudent);
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSelectedStudent(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{student?.name}</p>
            <p className="text-xs text-gray-400">Adm. {student?.admissionNo}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {studentMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No messages yet</div>
          ) : (
            studentMessages.map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-orange-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                  {msg.attachments.map((att, i) => (
                    <img key={i} src={att} alt="" className="rounded-lg mt-1 max-w-full" />
                  ))}
                  <p className="text-orange-200 text-xs mt-1 text-right">{format(new Date(msg.timestamp), 'HH:mm')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0">
          {attachments.length > 0 && (
            <div className="flex gap-1 mb-2 overflow-x-auto">
              {attachments.map((att, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img src={att} alt="" className="w-12 h-12 rounded object-cover" />
                  <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*" multiple onChange={handleFileUpload} className="hidden" />
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border-gray-200"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Communication</h2>

      {!selectedSession ? (
        <div className="text-center py-12 text-gray-400 text-sm">Select a session from the header</div>
      ) : (
        <>
          <div className="mb-3">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
              <option value="">Select class</option>
              {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {selectedClass && (
            <div className="mb-3">
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search student..." className="border-gray-200" />
            </div>
          )}

          <div className="space-y-2">
            {classStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s.id)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between hover:border-orange-200 transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">Adm. {s.admissionNo}</p>
                </div>
                <span className="text-xs text-orange-500">Chat →</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
