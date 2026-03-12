import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  TrendingUp, FileText, BookOpen, GraduationCap, DollarSign, Calendar,
  ArrowLeft, Plus, MoreVertical, Check, ChevronRight, User
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';

type AcademicsView = 'menu' | 'progress' | 'leave' | 'subject' | 'teacher-academics' | 'salary' | 'attendance';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminAcademics() {
  const [view, setView] = useState<AcademicsView>('menu');

  const menuItems = [
    { id: 'progress' as AcademicsView, label: 'Progress', icon: TrendingUp, desc: 'Manage student progress reports' },
    { id: 'leave' as AcademicsView, label: 'Leave', icon: FileText, desc: 'Teacher leave requests' },
    { id: 'subject' as AcademicsView, label: 'Subject', icon: BookOpen, desc: 'Manage class subjects' },
    { id: 'teacher-academics' as AcademicsView, label: 'Teacher Academics', icon: GraduationCap, desc: 'Teacher details & attendance' },
    { id: 'salary' as AcademicsView, label: 'Salary', icon: DollarSign, desc: 'Teacher salary management' },
    { id: 'attendance' as AcademicsView, label: 'Attendance', icon: Calendar, desc: 'Student attendance records' },
  ];

  if (view !== 'menu') {
    return (
      <div>
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setView('menu')} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800">
            {menuItems.find((m) => m.id === view)?.label}
          </h2>
        </div>
        {view === 'progress' && <ProgressSection />}
        {view === 'leave' && <LeaveSection />}
        {view === 'subject' && <SubjectSection />}
        {view === 'teacher-academics' && <TeacherAcademicsSection />}
        {view === 'salary' && <SalarySection />}
        {view === 'attendance' && <AttendanceSection />}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Academics</h2>
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-orange-200 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Section ────────────────────────────────────────────────────────
function ProgressSection() {
  const { sessions, students, subjects, teachers, progressBatches, addProgressBatch, markProgressSubjectComplete, approveProgressBatch } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [batchTitle, setBatchTitle] = useState('');
  const [subjectEntries, setSubjectEntries] = useState<{ subjectId: string; totalMarks: string; studentIds: string[] }[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentMarks, setCurrentMarks] = useState('');
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const sessionData = sessions.find((s) => s.id === selectedSession);
  const classStudents = students.filter((s) => s.classId === selectedClass && s.sessionId === selectedSession).sort((a, b) => a.name.localeCompare(b.name));
  const classSubjects = subjects.filter((s) => s.classId === selectedClass && s.sessionId === selectedSession);
  const classBatches = progressBatches.filter((pb) => pb.classId === selectedClass && pb.sessionId === selectedSession);

  const addSubjectEntry = () => {
    if (!currentSubject || !currentMarks) { toast.error('Select subject and enter marks'); return; }
    const sub = classSubjects.find((s) => s.id === currentSubject);
    if (!sub) return;
    setSubjectEntries((prev) => [...prev, {
      subjectId: currentSubject,
      totalMarks: currentMarks,
      studentIds: selectAllStudents ? classStudents.map((s) => s.id) : selectedStudents,
    }]);
    setCurrentSubject(''); setCurrentMarks(''); setSelectAllStudents(false); setSelectedStudents([]);
  };

  const handleDoneAndSend = () => {
    if (!batchTitle.trim() || subjectEntries.length === 0) { toast.error('Add title and at least one subject'); return; }
    addProgressBatch({
      title: batchTitle,
      sessionId: selectedSession,
      classId: selectedClass,
      subjects: subjectEntries.map((se, i) => {
        const sub = classSubjects.find((s) => s.id === se.subjectId);
        return {
          id: `ps_${Date.now()}_${i}`,
          subjectId: se.subjectId,
          teacherId: sub?.teacherId || '',
          totalMarks: parseInt(se.totalMarks),
          studentIds: se.studentIds,
          studentMarks: se.studentIds.map((sid) => ({ studentId: sid })),
          completed: false,
          approved: false,
        };
      }),
    });
    toast.success('Progress sent to teachers');
    setBatchTitle(''); setSubjectEntries([]); setShowForm(false);
  };

  return (
    <div className="p-4">
      <div className="space-y-3 mb-4">
        <select value={selectedSession} onChange={(e) => { setSelectedSession(e.target.value); setSelectedClass(''); }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
          <option value="">Select session</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {selectedSession && (
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
            <option value="">Select class</option>
            {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {selectedClass && (
        <>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
            <Plus className="w-4 h-4 mr-2" /> New Progress Batch
          </Button>

          {classBatches.map((batch) => (
            <div key={batch.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-3">
              <h4 className="font-bold text-gray-800 mb-2">{batch.title}</h4>
              {batch.subjects.map((sub) => {
                const subject = subjects.find((s) => s.id === sub.subjectId);
                return (
                  <div key={sub.id} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-sm text-gray-700">{subject?.name}</span>
                    <div className="flex items-center gap-2">
                      {sub.completed ? (
                        <span className="text-green-500 text-xs font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      ) : (
                        <span className="text-orange-400 text-xs">Pending</span>
                      )}
                      {sub.completed && !sub.approved && (
                        <Button size="sm" onClick={() => approveProgressBatch(batch.id)} className="h-6 text-xs bg-green-500 hover:bg-green-600 px-2">
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Progress Batch</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Batch Title</Label>
              <Input value={batchTitle} onChange={(e) => setBatchTitle(e.target.value)} placeholder="e.g. Mid-Term Exam" className="mt-0.5 h-8 text-sm" />
            </div>
            {subjectEntries.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-medium text-gray-600 mb-1">Added Subjects:</p>
                {subjectEntries.map((se, i) => {
                  const sub = classSubjects.find((s) => s.id === se.subjectId);
                  return (
                    <div key={i} className="text-xs text-gray-600 py-0.5">
                      {sub?.name} — {se.totalMarks} marks — {se.studentIds.length} students
                    </div>
                  );
                })}
              </div>
            )}
            <div className="border border-orange-100 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-orange-600">Add Subject Entry</p>
              <select value={currentSubject} onChange={(e) => setCurrentSubject(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
                <option value="">Select subject</option>
                {classSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Input type="number" value={currentMarks} onChange={(e) => setCurrentMarks(e.target.value)} placeholder="Total marks" className="h-7 text-xs" />
              <div>
                <label className="flex items-center gap-2 text-xs cursor-pointer mb-1">
                  <input type="checkbox" checked={selectAllStudents} onChange={(e) => { setSelectAllStudents(e.target.checked); if (e.target.checked) setSelectedStudents(classStudents.map((s) => s.id)); else setSelectedStudents([]); }} className="accent-orange-500" />
                  Select All Students
                </label>
                {!selectAllStudents && classStudents.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                    <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={(e) => setSelectedStudents((prev) => e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id))} className="accent-orange-500" />
                    {s.name}
                  </label>
                ))}
              </div>
              <Button size="sm" onClick={addSubjectEntry} variant="outline" className="w-full text-xs h-7">+ Add Subject</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleDoneAndSend} className="flex-1 bg-orange-500 hover:bg-orange-600">Done & Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Leave Section ────────────────────────────────────────────────────────────
function LeaveSection() {
  const { sessions, teachers, leaveRequests, updateLeaveStatus } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [viewingLeave, setViewingLeave] = useState<string | null>(null);

  const sessionTeachers = teachers.filter((t) => !selectedSession || t.sessionId === selectedSession);
  const sessionLeaves = leaveRequests.filter((lr) => sessionTeachers.some((t) => t.id === lr.teacherId));
  const viewing = leaveRequests.find((lr) => lr.id === viewingLeave);

  if (viewing) {
    const teacher = teachers.find((t) => t.id === viewing.teacherId);
    const classIncharge = teacher?.classInchargeId
      ? sessions.flatMap((s) => s.classes).find((c) => c.id === teacher.classInchargeId)
      : null;
    return (
      <div className="p-4">
        <button onClick={() => setViewingLeave(null)} className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-orange-500">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 mb-4">
          {([
            ['Teacher', teacher?.name], ['Teacher No', teacher?.teacherNo],
            ['Class Incharge', classIncharge?.name || 'No Class Teacher'],
            ['Days', viewing.days.toString()], ['Date', viewing.date],
            ['Reason', viewing.reason], ['Status', viewing.status.toUpperCase()],
          ] as [string, string | undefined][]).map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span className="text-gray-500">{l}</span>
              <span className="font-medium text-gray-800">{v}</span>
            </div>
          ))}
        </div>
        {viewing.status === 'pending' && (
          <div className="flex gap-3">
            <Button onClick={() => { updateLeaveStatus(viewing.id, 'rejected'); toast.success('Rejected'); setViewingLeave(null); }} variant="outline" className="flex-1 border-red-200 text-red-500">Reject</Button>
            <Button onClick={() => { updateLeaveStatus(viewing.id, 'approved'); toast.success('Approved'); setViewingLeave(null); }} className="flex-1 bg-green-500 hover:bg-green-600">Approve</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4">
        <option value="">All Sessions</option>
        {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div className="space-y-2">
        {sessionTeachers.map((t) => {
          const leaves = sessionLeaves.filter((lr) => lr.teacherId === t.id);
          const onLeave = leaves.some((l) => l.status === 'pending');
          return (
            <div key={t.id} className={`bg-white rounded-xl border shadow-sm p-3 ${onLeave ? 'border-orange-300' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className={`font-medium text-sm ${onLeave ? 'text-orange-600' : 'text-gray-800'}`}>{t.name}</p>
                {onLeave && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">On Leave</span>}
              </div>
              {leaves.map((lr) => (
                <button key={lr.id} onClick={() => setViewingLeave(lr.id)} className="w-full flex justify-between text-xs bg-gray-50 rounded p-1.5 mt-1 hover:bg-orange-50">
                  <span>{lr.date} • {lr.days}d</span>
                  <span className={lr.status === 'approved' ? 'text-green-600' : lr.status === 'rejected' ? 'text-red-600' : 'text-orange-600'}>{lr.status}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Subject Section ──────────────────────────────────────────────────────────
function SubjectSection() {
  const { sessions, subjects, teachers, addSubject, deleteSubject } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const sessionData = sessions.find((s) => s.id === selectedSession);
  const classSubjects = subjects.filter((s) => s.classId === selectedClass && s.sessionId === selectedSession).sort((a, b) => a.name.localeCompare(b.name));
  const sessionTeachers = teachers.filter((t) => t.sessionId === selectedSession);

  const handleAdd = () => {
    if (!subjectName.trim() || !selectedClass) { toast.error('Subject name and class required'); return; }
    addSubject({ name: subjectName.trim(), teacherId, classId: selectedClass, sessionId: selectedSession });
    setSubjectName(''); setTeacherId('');
    toast.success('Subject added');
  };

  return (
    <div className="p-4">
      <div className="space-y-3 mb-4">
        <select value={selectedSession} onChange={(e) => { setSelectedSession(e.target.value); setSelectedClass(''); }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
          <option value="">Select session</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {selectedSession && (
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
            <option value="">Select class</option>
            {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {selectedClass && (
        <>
          <div className="bg-orange-50 rounded-xl p-3 mb-4 space-y-2 border border-orange-100">
            <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Subject name" className="h-8 text-sm" />
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="">Select teacher (optional)</option>
              {sessionTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <Button onClick={handleAdd} size="sm" className="w-full bg-orange-500 hover:bg-orange-600">Add Subject</Button>
          </div>

          {classSubjects.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">No subjects yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-orange-50"><th className="text-left p-2 text-xs text-gray-500">Subject</th><th className="text-left p-2 text-xs text-gray-500">Teacher</th><th className="p-2"></th></tr></thead>
              <tbody>
                {classSubjects.map((sub) => {
                  const t = teachers.find((t) => t.id === sub.teacherId);
                  return (
                    <tr key={sub.id} className="border-b border-gray-50">
                      <td className="p-2 font-bold text-gray-800">{sub.name}</td>
                      <td className="p-2 text-gray-500 text-xs">{t?.name || '—'}</td>
                      <td className="p-2">
                        <button onClick={() => { deleteSubject(sub.id); toast.success('Deleted'); }} className="text-red-400 hover:text-red-600 text-xs">Del</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

// ─── Teacher Academics Section ────────────────────────────────────────────────
function TeacherAcademicsSection() {
  const { sessions, teachers, subjects, teacherTimetables, teacherAttendance, salaryRecords, saveTeacherAttendance, saveSalaryRecord, setTeacherClassIncharge } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'incharge' | 'timetable' | 'classes' | 'attendance' | 'salary' | 'detail'>('incharge');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [perDayAmount, setPerDayAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [showAttendanceCalendar, setShowAttendanceCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'half-day' | 'leave' | 'holiday'>('present');

  const sessionTeachers = teachers.filter((t) => !selectedSession || t.sessionId === selectedSession).sort((a, b) => a.teacherNo.localeCompare(b.teacherNo));
  const teacher = teachers.find((t) => t.id === selectedTeacher);
  const sessionData = sessions.find((s) => s.id === selectedSession);

  const teacherTimetable = teacherTimetables.find((t) => t.teacherId === selectedTeacher);
  const teacherAttendanceRecords = teacherAttendance.filter((a) => a.teacherId === selectedTeacher);

  const getAttendanceForDate = (date: string) => teacherAttendanceRecords.find((a) => a.date === date);

  const monthAttendance = teacherAttendanceRecords.filter((a) => {
    const d = new Date(a.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const absentDays = monthAttendance.filter((a) => a.status === 'absent').length;
  const holidayDays = monthAttendance.filter((a) => a.status === 'holiday').length;
  const leaveDays = monthAttendance.filter((a) => a.status === 'leave').length;

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const presentDays = daysInMonth - absentDays - holidayDays - leaveDays;
  const perDay = parseFloat(perDayAmount) || 0;
  const calculatedSalary = presentDays * perDay;
  const deducted = (absentDays + holidayDays) * perDay;

  const handleSaveAttendance = () => {
    if (!selectedDate || !selectedTeacher) return;
    saveTeacherAttendance({ teacherId: selectedTeacher, date: selectedDate, status: attendanceStatus });
    toast.success('Attendance saved');
    setShowAttendanceCalendar(false);
  };

  const handleSaveSalary = () => {
    if (!selectedTeacher) return;
    saveSalaryRecord({
      teacherId: selectedTeacher,
      month: MONTHS[selectedMonth],
      year: selectedYear,
      perDayAmount: perDay,
      totalAmount: parseFloat(totalAmount) || 0,
      approvedAmount: calculatedSalary,
      deductedAmount: deducted,
      absentDays,
      holidayDays,
      totalSalary: calculatedSalary,
    });
    toast.success('Salary saved');
  };

  const tabs = [
    { id: 'incharge' as const, label: 'Incharge' },
    { id: 'timetable' as const, label: 'Timetable' },
    { id: 'classes' as const, label: 'Classes' },
    { id: 'attendance' as const, label: 'Attendance' },
    { id: 'salary' as const, label: 'Salary' },
    { id: 'detail' as const, label: 'Detail' },
  ];

  if (selectedTeacher && teacher) {
    return (
      <div>
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2">
          <button onClick={() => setSelectedTeacher(null)} className="p-1 rounded hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800 text-sm">{teacher.name}</span>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'incharge' && (
            <div>
              <Label className="text-xs">Class Incharge</Label>
              <select
                value={teacher.classInchargeId || ''}
                onChange={(e) => setTeacherClassIncharge(selectedTeacher, e.target.value || null)}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">No Class Teacher</option>
                {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Current: {teacher.classInchargeId ? sessionData?.classes.find((c) => c.id === teacher.classInchargeId)?.name || 'Unknown' : 'No Class Incharge'}
              </p>
            </div>
          )}

          {activeTab === 'timetable' && (
            <div>
              {teacherTimetable ? (
                <div className="space-y-1">
                  {teacherTimetable.entries.sort((a, b) => a.periodNumber - b.periodNumber).map((e) => {
                    const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === e.classId);
                    return (
                      <div key={e.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium text-gray-700 w-6">{e.periodNumber}</span>
                        <span className={`flex-1 font-bold ${!e.periodName ? 'text-green-500' : 'text-gray-800'}`}>{e.periodName || 'Free Period'}</span>
                        <span className="text-xs text-gray-400">{e.day}</span>
                        <span className="text-xs text-gray-400">{cls?.name || ''}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">No timetable set</p>
              )}
            </div>
          )}

          {activeTab === 'classes' && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Classes assigned to this teacher:</p>
              {subjects.filter((s) => s.teacherId === selectedTeacher).length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">No classes assigned</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-orange-50"><th className="text-left p-2 text-xs text-gray-500">Class</th><th className="text-left p-2 text-xs text-gray-500">Subject</th></tr></thead>
                  <tbody>
                    {subjects.filter((s) => s.teacherId === selectedTeacher).map((sub) => {
                      const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === sub.classId);
                      return (
                        <tr key={sub.id} className="border-b border-gray-50">
                          <td className="p-2 text-gray-700">{cls?.name || '—'}</td>
                          <td className="p-2 font-medium text-gray-800">{sub.name}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <Button onClick={() => setShowAttendanceCalendar(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Attendance
              </Button>
              <div className="mb-3">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                {monthAttendance.map((a) => (
                  <div key={a.date} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-700">{a.date}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      a.status === 'present' ? 'bg-green-100 text-green-600' :
                      a.status === 'absent' ? 'bg-red-100 text-red-600' :
                      a.status === 'holiday' ? 'bg-blue-100 text-blue-600' :
                      a.status === 'leave' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>{a.status}</span>
                  </div>
                ))}
              </div>

              <Dialog open={showAttendanceCalendar} onOpenChange={setShowAttendanceCalendar}>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input type="date" value={selectedDate || ''} onChange={(e) => setSelectedDate(e.target.value)} className="mt-0.5 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        {(['present', 'absent', 'half-day', 'leave', 'holiday'] as const).map((s) => (
                          <button key={s} onClick={() => setAttendanceStatus(s)} className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${attendanceStatus === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleSaveAttendance} className="w-full bg-orange-500 hover:bg-orange-600">Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-3">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {MONTHS.map((m, i) => <option key={m} value={i}>{m} {selectedYear}</option>)}
              </select>
              <div className="bg-orange-50 rounded-xl p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Absent Days</span><span className="font-medium">{absentDays}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Holiday Days</span><span className="font-medium">{holidayDays}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Present Days</span><span className="font-medium text-green-600">{presentDays}</span></div>
              </div>
              <div>
                <Label className="text-xs">Per Day Amount (₹)</Label>
                <Input type="number" value={perDayAmount} onChange={(e) => setPerDayAmount(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="0" />
              </div>
              <div>
                <Label className="text-xs">Total Amount (₹)</Label>
                <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="0" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Deducted Amount</span><span className="font-medium text-red-500">₹{deducted.toFixed(0)}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-semibold text-gray-800">Total Salary</span><span className="font-bold text-orange-600">₹{calculatedSalary.toFixed(0)}</span></div>
              </div>
              <Button onClick={handleSaveSalary} className="w-full bg-orange-500 hover:bg-orange-600">Save Salary</Button>
            </div>
          )}

          {activeTab === 'detail' && (
            <div className="space-y-3">
              {([
                ['Name', teacher.name], ['Teacher No', teacher.teacherNo],
                ['Date of Birth', teacher.dateOfBirth], ['Joining Date', teacher.joiningDate],
                ['Qualification', teacher.qualification], ['Contact', teacher.contactNumber],
                ['Email', teacher.email], ['Address', teacher.address],
              ] as [string, string | undefined][]).filter(([, v]) => v).map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4">
        <option value="">All Sessions</option>
        {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div className="space-y-2">
        {sessionTeachers.map((t) => (
          <button key={t.id} onClick={() => setSelectedTeacher(t.id)} className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between hover:border-orange-200 transition-colors">
            <div className="text-left">
              <p className="font-medium text-gray-800 text-sm">{t.name}</p>
              <p className="text-xs text-gray-400">No: {t.teacherNo}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Salary Section ───────────────────────────────────────────────────────────
function SalarySection() {
  const { sessions, teachers, salaryRecords } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);

  const sessionTeachers = teachers.filter((t) => !selectedSession || t.sessionId === selectedSession);

  return (
    <div className="p-4">
      <div className="space-y-3 mb-4">
        <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
          <option value="">All Sessions</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {sessionTeachers.map((t) => {
          const salary = salaryRecords.find((r) => r.teacherId === t.id && r.month === selectedMonth);
          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
              <p className="font-medium text-gray-800 text-sm">{t.name}</p>
              {salary ? (
                <div className="mt-1 grid grid-cols-3 gap-1 text-xs">
                  <div className="bg-green-50 rounded p-1 text-center"><p className="text-gray-500">Approved</p><p className="font-bold text-green-600">₹{salary.approvedAmount}</p></div>
                  <div className="bg-red-50 rounded p-1 text-center"><p className="text-gray-500">Deducted</p><p className="font-bold text-red-500">₹{salary.deductedAmount}</p></div>
                  <div className="bg-orange-50 rounded p-1 text-center"><p className="text-gray-500">Total</p><p className="font-bold text-orange-600">₹{salary.totalSalary}</p></div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">No salary data for {selectedMonth}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Attendance Section ───────────────────────────────────────────────────────
function AttendanceSection() {
  const { sessions, students, studentAttendance, saveStudentAttendance } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState<'present' | 'absent' | 'half-day' | 'leave' | 'holiday'>('present');
  const [showForm, setShowForm] = useState(false);

  const sessionData = sessions.find((s) => s.id === selectedSession);
  const classStudents = students.filter((s) => s.classId === selectedClass && s.sessionId === selectedSession).sort((a, b) => a.name.localeCompare(b.name));

  const handleSave = () => {
    if (!selectedStudent || !selectedDate) { toast.error('Select student and date'); return; }
    saveStudentAttendance({ studentId: selectedStudent, classId: selectedClass, date: selectedDate, status });
    toast.success('Attendance saved');
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <div className="space-y-3 mb-4">
        <select value={selectedSession} onChange={(e) => { setSelectedSession(e.target.value); setSelectedClass(''); }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
          <option value="">Select session</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {selectedSession && (
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
            <option value="">Select class</option>
            {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {selectedClass && (
        <>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
            <Plus className="w-4 h-4 mr-2" /> Mark Attendance
          </Button>
          <div className="space-y-2">
            {classStudents.map((s) => {
              const records = studentAttendance.filter((a) => a.studentId === s.id);
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3">
                  <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{records.length} records</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Student</Label>
              <select value={selectedStudent || ''} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select student</option>
                {classStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-0.5 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {(['present', 'absent', 'half-day', 'leave', 'holiday'] as const).map((s) => (
                  <button key={s} onClick={() => setStatus(s)} className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
