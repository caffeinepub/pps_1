import { useState } from 'react';
import { useAppStore, LeaveRequest } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminLeave() {
  const { sessions, teachers, leaveRequests, updateLeaveStatus } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);

  const sessionTeachers = teachers.filter((t) => !selectedSession || t.sessionId === selectedSession);
  const sessionLeaves = leaveRequests.filter((lr) =>
    sessionTeachers.some((t) => t.id === lr.teacherId)
  );

  const getTeacherLeave = (teacherId: string) =>
    sessionLeaves.filter((lr) => lr.teacherId === teacherId);

  const isOnLeave = (teacherId: string) =>
    getTeacherLeave(teacherId).some((lr) => lr.status === 'pending' || lr.status === 'approved');

  const handleApprove = (id: string) => {
    updateLeaveStatus(id, 'approved');
    toast.success('Leave approved');
    setViewingLeave(null);
  };

  const handleReject = (id: string) => {
    updateLeaveStatus(id, 'rejected');
    toast.success('Leave rejected');
    setViewingLeave(null);
  };

  if (viewingLeave) {
    const teacher = teachers.find((t) => t.id === viewingLeave.teacherId);
    const classIncharge = teacher?.classInchargeId
      ? sessions.flatMap((s) => s.classes).find((c) => c.id === teacher.classInchargeId)
      : null;

    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setViewingLeave(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800">Leave Request</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 mb-4">
          {([
            ['Teacher Name', teacher?.name],
            ['Teacher No', teacher?.teacherNo],
            ['Class Incharge', classIncharge?.name || 'No Class Teacher'],
            ['Leave Days', viewingLeave.days.toString()],
            ['Leave Date', viewingLeave.date],
            ['Day', viewingLeave.day],
            ['Reason', viewingLeave.reason],
            ['Status', viewingLeave.status.toUpperCase()],
          ] as [string, string | undefined][]).map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-500">{label}</span>
              <span className={`font-medium ${
                value === 'APPROVED' ? 'text-green-500' :
                value === 'REJECTED' ? 'text-red-500' :
                value === 'PENDING' ? 'text-orange-500' : 'text-gray-800'
              }`}>{value}</span>
            </div>
          ))}
        </div>
        {viewingLeave.status === 'pending' && (
          <div className="flex gap-3">
            <Button onClick={() => handleReject(viewingLeave.id)} variant="outline" className="flex-1 border-red-200 text-red-500 hover:bg-red-50">
              Reject
            </Button>
            <Button onClick={() => handleApprove(viewingLeave.id)} className="flex-1 bg-green-500 hover:bg-green-600">
              Approve
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Leave Requests</h2>

      <div className="mb-4">
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {sessionTeachers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-orange-200" />
          <p className="text-sm">No teachers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessionTeachers.map((t) => {
            const leaves = getTeacherLeave(t.id);
            const onLeave = isOnLeave(t.id);
            const pendingCount = leaves.filter((l) => l.status === 'pending').length;
            return (
              <div key={t.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${onLeave ? 'border-orange-300' : 'border-gray-100'}`}>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium text-sm ${onLeave ? 'text-orange-600' : 'text-gray-800'}`}>{t.name}</p>
                      <p className="text-xs text-gray-400">No: {t.teacherNo}</p>
                    </div>
                    {onLeave && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        On Leave
                      </span>
                    )}
                  </div>
                  {leaves.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {leaves.map((lr) => (
                        <button
                          key={lr.id}
                          onClick={() => setViewingLeave(lr)}
                          className="w-full flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2 hover:bg-orange-50 transition-colors"
                        >
                          <span className="text-gray-600">{lr.date} • {lr.days} day{lr.days !== 1 ? 's' : ''}</span>
                          <span className={`font-medium px-1.5 py-0.5 rounded ${
                            lr.status === 'approved' ? 'text-green-600 bg-green-50' :
                            lr.status === 'rejected' ? 'text-red-600 bg-red-50' :
                            'text-orange-600 bg-orange-50'
                          }`}>{lr.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
