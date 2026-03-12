import { useState } from 'react';
import { useAppStore, TeacherTimetableEntry } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminTeacherTimetable() {
  const { teachers, sessions, subjects, teacherTimetables, saveTeacherTimetableEntry, deleteTeacherTimetableEntry } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showForm, setShowForm] = useState(false);

  const [formTeacher, setFormTeacher] = useState('');
  const [formDay, setFormDay] = useState('Monday');
  const [formPeriodNo, setFormPeriodNo] = useState('');
  const [formPeriodName, setFormPeriodName] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');

  const sessionTeachers = teachers.filter((t) => !selectedSession || t.sessionId === selectedSession);
  const sessionData = sessions.find((s) => s.id === selectedSession);
  const classSubjects = subjects.filter((s) => s.classId === formClassId);

  const teacherTimetable = teacherTimetables.find((t) => t.teacherId === selectedTeacher);
  const dayEntries = teacherTimetable?.entries
    .filter((e) => e.day === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber) || [];

  const resetForm = () => {
    setFormTeacher(''); setFormDay('Monday'); setFormPeriodNo('');
    setFormPeriodName(''); setFormClassId(''); setFormSubjectId('');
  };

  const handleAdd = () => {
    if (!formTeacher || !formPeriodNo) { toast.error('Teacher and period number required'); return; }
    const entry: Omit<TeacherTimetableEntry, 'id'> = {
      day: formDay,
      periodNumber: parseInt(formPeriodNo),
      periodName: formPeriodName.trim() || undefined,
      classId: formClassId || undefined,
      subjectId: formSubjectId || undefined,
    };
    saveTeacherTimetableEntry(formTeacher, entry);
    toast.success('Period added');
    setFormPeriodNo(''); setFormPeriodName(''); setFormClassId(''); setFormSubjectId('');
  };

  const handleDone = () => {
    toast.success('Timetable saved');
    resetForm(); setShowForm(false);
  };

  if (selectedTeacher) {
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setSelectedTeacher(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800">{teacher?.name}</h3>
        </div>

        {/* Day Filter */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedDay === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {dayEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No periods for {selectedDay}</div>
        ) : (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50">
                  <th className="text-left p-2 text-xs text-gray-500 font-medium">Period</th>
                  <th className="text-left p-2 text-xs text-gray-500 font-medium">Name</th>
                  <th className="text-left p-2 text-xs text-gray-500 font-medium">Class</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {dayEntries.map((e) => {
                  const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === e.classId);
                  const sub = subjects.find((s) => s.id === e.subjectId);
                  return (
                    <tr key={e.id} className="border-b border-gray-50">
                      <td className="p-2 font-medium text-gray-700">{e.periodNumber}</td>
                      <td className={`p-2 font-bold ${!e.periodName ? 'text-green-500' : 'text-gray-800'}`}>
                        {e.periodName || 'Free Period'}
                      </td>
                      <td className="p-2 text-gray-500 text-xs">{cls?.name || '—'}{sub ? ` / ${sub.name}` : ''}</td>
                      <td className="p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-100">
                              <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => { deleteTeacherTimetableEntry(selectedTeacher, e.id); toast.success('Deleted'); }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Teacher Timetable</h2>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-9 h-9 p-0">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

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
        <div className="text-center py-12 text-gray-400 text-sm">No teachers found</div>
      ) : (
        <div className="space-y-2">
          {sessionTeachers.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTeacher(t.id); setSelectedDay('Monday'); }}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between hover:border-orange-200 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">No: {t.teacherNo}</p>
              </div>
              <span className="text-xs text-orange-500">View →</span>
            </button>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { resetForm(); setShowForm(false); } }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Timetable Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Teacher *</Label>
              <select value={formTeacher} onChange={(e) => setFormTeacher(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select teacher</option>
                {sessionTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Day *</Label>
              <select value={formDay} onChange={(e) => setFormDay(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Period Number *</Label>
              <Input type="number" value={formPeriodNo} onChange={(e) => setFormPeriodNo(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="1, 2, 3..." />
            </div>
            <div>
              <Label className="text-xs">Period Name (optional)</Label>
              <Input value={formPeriodName} onChange={(e) => setFormPeriodName(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="Leave blank for Free Period" />
            </div>
            <div>
              <Label className="text-xs">Class (optional)</Label>
              <select value={formClassId} onChange={(e) => { setFormClassId(e.target.value); setFormSubjectId(''); }} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select class</option>
                {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {formClassId && (
              <div>
                <Label className="text-xs">Subject (optional)</Label>
                <select value={formSubjectId} onChange={(e) => setFormSubjectId(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select subject</option>
                  {classSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleAdd} className="flex-1">+ Add Period</Button>
              <Button onClick={handleDone} className="flex-1 bg-orange-500 hover:bg-orange-600">Done & Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
