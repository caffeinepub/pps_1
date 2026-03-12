import { useState } from 'react';
import { useAppStore, CircularData } from '../../store/appStore';
import { ArrowLeft } from 'lucide-react';
import { format, isToday } from 'date-fns';

interface Props { selectedSession: string; }

export default function TeacherHome({ selectedSession }: Props) {
  const { circulars, currentUser, teachers, sessions } = useAppStore();
  const [viewingCircular, setViewingCircular] = useState<CircularData | null>(null);

  const teacher = teachers.find((t) => t.id === currentUser?.teacherId);
  const teacherClassId = teacher?.classInchargeId;

  // Show circulars for teacher's session/classes
  const relevantCirculars = circulars.filter((c) => {
    if (selectedSession && c.sessionId !== selectedSession) return false;
    if (c.classIds.length === 0) return true;
    if (teacherClassId && c.classIds.includes(teacherClassId)) return true;
    return false;
  });

  const today = new Date();

  if (viewingCircular) {
    return (
      <div className="min-h-full bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setViewingCircular(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">Circular</span>
        </div>
        <div className="p-6 text-black">
          <p className="text-center font-bold text-base mb-4 text-black">
            {format(new Date(viewingCircular.date), 'dd MMMM yyyy')}
          </p>
          <h2 className="text-xl font-bold mb-3 text-black">{viewingCircular.title}</h2>
          <p className="text-black leading-relaxed whitespace-pre-wrap">{viewingCircular.description}</p>
          {viewingCircular.attachments.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold text-black mb-2">Attachments:</p>
              <div className="grid grid-cols-2 gap-2">
                {viewingCircular.attachments.map((att, i) => (
                  <img key={i} src={att} alt={`Attachment ${i + 1}`} className="rounded-lg w-full object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Date Header */}
      <div className="text-center mb-6">
        <p className="text-2xl font-bold text-gray-800">{format(today, 'dd')}</p>
        <p className="text-lg font-semibold text-orange-500">{format(today, 'MMMM yyyy')}</p>
        <p className="text-sm text-gray-500">{format(today, 'EEEE')}</p>
      </div>

      <h3 className="text-sm font-semibold text-gray-600 mb-3">Circulars</h3>

      {relevantCirculars.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No circulars available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relevantCirculars.map((c) => (
            <button
              key={c.id}
              onClick={() => setViewingCircular(c)}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-orange-200 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{c.description}</p>
              <p className="text-orange-400 text-xs mt-2">{format(new Date(c.date), 'dd MMM yyyy')}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
