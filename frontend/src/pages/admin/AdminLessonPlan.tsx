import { useState } from 'react';
import { useAppStore, LessonPlanData } from '../../store/appStore';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminLessonPlan() {
  const { lessonPlans, teachers, sessions, subjects } = useAppStore();
  const [viewing, setViewing] = useState<LessonPlanData | null>(null);

  if (viewing) {
    const teacher = teachers.find((t) => t.id === viewing.teacherId);
    const session = sessions.find((s) => s.id === viewing.sessionId);
    const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === viewing.classId);
    const subject = subjects.find((s) => s.id === viewing.subjectId);

    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setViewing(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800">Lesson Plan Detail</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          {([
            ['Teacher', teacher?.name],
            ['Session', session?.name],
            ['Class', cls?.name],
            ['Subject', subject?.name],
            ['Topic', viewing.topic],
            ['Start Date', viewing.startDate],
            ['End Date', viewing.endDate],
            ['Submitted', format(new Date(viewing.date), 'dd MMM yyyy')],
          ] as [string, string | undefined][]).filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Lesson Plans</h2>

      {lessonPlans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 text-orange-300" />
          </div>
          <p className="font-medium">No lesson plans yet</p>
          <p className="text-sm">Teachers will submit lesson plans here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessonPlans.map((lp) => {
            const teacher = teachers.find((t) => t.id === lp.teacherId);
            const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === lp.classId);
            const subject = subjects.find((s) => s.id === lp.subjectId);
            return (
              <button
                key={lp.id}
                onClick={() => setViewing(lp)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-orange-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{teacher?.name || 'Unknown Teacher'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lp.topic}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cls?.name} • {subject?.name}</p>
                  </div>
                  <p className="text-xs text-orange-400">{format(new Date(lp.date), 'dd MMM')}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
