import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BookOpen, Clock, FileText, DollarSign, TrendingUp, ClipboardList,
  CalendarDays, Heart, GraduationCap, ArrowLeft, Plus, ChevronRight,
  Check, X, Paperclip, User, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';

interface Props { selectedSession: string; }

type MenuView =
  | 'menu'
  | 'my-class'
  | 'my-timetable'
  | 'leave'
  | 'salary'
  | 'progress'
  | 'homework'
  | 'lesson-plan'
  | 'event-calendar'
  | 'greetings'
  | 'my-academics';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherMenu({ selectedSession }: Props) {
  const [view, setView] = useState<MenuView>('menu');

  const menuItems: { id: MenuView; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'my-class', label: 'My Class', icon: BookOpen, desc: 'Class students, timetable & attendance' },
    { id: 'my-timetable', label: 'My Timetable', icon: Clock, desc: 'View your teaching schedule' },
    { id: 'leave', label: 'Leave', icon: FileText, desc: 'Apply and view leave requests' },
    { id: 'salary', label: 'Salary', icon: DollarSign, desc: 'View monthly salary details' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, desc: 'Enter student marks' },
    { id: 'homework', label: 'Homework', icon: ClipboardList, desc: 'Assign homework to students' },
    { id: 'lesson-plan', label: 'Lesson Plan', icon: BookOpen, desc: 'Submit lesson plans' },
    { id: 'event-calendar', label: 'Event Calendar', icon: CalendarDays, desc: 'View school events' },
    { id: 'greetings', label: 'Greetings', icon: Heart, desc: 'View school greetings' },
    { id: 'my-academics', label: 'My Academics', icon: GraduationCap, desc: 'Classes, attendance & incharge' },
  ];

  if (view !== 'menu') {
    const item = menuItems.find((m) => m.id === view);
    return (
      <div>
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setView('menu')} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800">{item?.label}</h2>
        </div>
        {view === 'my-class' && <MyClassSection selectedSession={selectedSession} />}
        {view === 'my-timetable' && <MyTimetableSection />}
        {view === 'leave' && <LeaveSection />}
        {view === 'salary' && <SalarySection />}
        {view === 'progress' && <ProgressSection selectedSession={selectedSession} />}
        {view === 'homework' && <HomeworkSection selectedSession={selectedSession} />}
        {view === 'lesson-plan' && <LessonPlanSection selectedSession={selectedSession} />}
        {view === 'event-calendar' && <EventCalendarSection selectedSession={selectedSession} />}
        {view === 'greetings' && <GreetingsSection selectedSession={selectedSession} />}
        {view === 'my-academics' && <MyAcademicsSection />}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Menu</h2>
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

// ─── My Class ────────────────────────────────────────────────────────────────
function MyClassSection({ selectedSession }: { selectedSession: string }) {
  const { currentUser, teachers, sessions, students, subjects, classTimetables, studentAttendance, saveStudentAttendance, leaveRequests, updateLeaveStatus } = useAppStore();
  const teacher = teachers.find((t) => t.id === currentUser?.teacherId);
  const classInchargeId = teacher?.classInchargeId;
  const [activeTab, setActiveTab] = useState<'incharge' | 'students' | 'timetable' | 'attendance' | 'leave' | 'subjects'>('incharge');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewingStudent, setViewingStudent] = useState<string | null>(null);
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] = useState<string | null>(null);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'half-day' | 'leave' | 'holiday'>('present');
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [leaveStudentId, setLeaveStudentId] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveDays, setLeaveDays] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const classData = classInchargeId
    ? sessions.flatMap((s) => s.classes).find((c) => c.id === classInchargeId)
    : null;

  const classStudents = students
    .filter((s) => s.classId === classInchargeId && s.sessionId === selectedSession)
    .sort((a, b) => a.name.localeCompare(b.name));

  const classTimetable = classTimetables.find((t) => t.classId === classInchargeId);
  const dayEntries = classTimetable?.entries
    .filter((e) => e.day === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber) || [];

  const classSubjects = subjects
    .filter((s) => s.classId === classInchargeId && s.sessionId === selectedSession)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSaveAttendance = () => {
    if (!selectedStudentForAttendance || !attendanceDate) { toast.error('Select student and date'); return; }
    saveStudentAttendance({ studentId: selectedStudentForAttendance, classId: classInchargeId || '', date: attendanceDate, status: attendanceStatus });
    toast.success('Attendance saved');
    setShowAttendanceForm(false);
  };

  const handleLeaveSubmit = () => {
    if (!leaveStudentId || !leaveDate || !leaveDays) { toast.error('Fill all fields'); return; }
    toast.success('Leave recorded');
    setShowLeaveForm(false);
    setLeaveStudentId(''); setLeaveDate(''); setLeaveDays(''); setLeaveReason('');
  };

  const tabs = [
    { id: 'incharge' as const, label: 'Incharge' },
    { id: 'students' as const, label: 'Students' },
    { id: 'timetable' as const, label: 'Timetable' },
    { id: 'attendance' as const, label: 'Attendance' },
    { id: 'leave' as const, label: 'Leave' },
    { id: 'subjects' as const, label: 'Subjects' },
  ];

  if (!classInchargeId) {
    return (
      <div className="p-4 text-center py-12 text-gray-400">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-orange-200" />
        <p className="font-medium">No Class Assigned</p>
        <p className="text-sm mt-1">You are not assigned as class incharge</p>
      </div>
    );
  }

  const viewingStudentData = viewingStudent ? students.find((s) => s.id === viewingStudent) : null;

  if (viewingStudentData) {
    return (
      <div className="p-4">
        <button onClick={() => setViewingStudent(null)} className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-orange-500">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{viewingStudentData.name}</p>
              <p className="text-xs text-gray-500">Adm. {viewingStudentData.admissionNo}</p>
            </div>
          </div>
          {([
            ['Aadhaar No', viewingStudentData.aadhaarNo],
            ['Date of Birth', viewingStudentData.dateOfBirth],
            ['Date of Joining', viewingStudentData.dateOfJoining],
            ['Address', viewingStudentData.address],
            ['Father Name', viewingStudentData.fatherName],
            ['Mother Name', viewingStudentData.motherName],
            ['Father Mobile', viewingStudentData.fatherMobile],
            ['Mother Mobile', viewingStudentData.motherMobile],
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
    <div>
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'incharge' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-orange-500" />
            </div>
            <p className="font-bold text-gray-800 text-lg">{classData?.name || 'Unknown Class'}</p>
            <p className="text-sm text-gray-500 mt-1">You are the class incharge</p>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-2">
            {classStudents.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No students in this class</p>
            ) : (
              classStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setViewingStudent(s.id)}
                  className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between hover:border-orange-200 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">Adm. {s.admissionNo}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'timetable' && (
          <div>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedDay === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
            {dayEntries.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No periods for {selectedDay}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="text-left p-2 text-xs text-gray-500">Period</th>
                    <th className="text-left p-2 text-xs text-gray-500">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {dayEntries.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50">
                      <td className="p-2 font-medium text-gray-700">{e.periodNumber}</td>
                      <td className={`p-2 font-bold ${e.periodName === 'Free Period' ? 'text-green-500' : 'text-gray-800'}`}>
                        {e.periodName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <Button onClick={() => setShowAttendanceForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
              <Plus className="w-4 h-4 mr-2" /> Mark Attendance
            </Button>
            <div className="space-y-2">
              {classStudents.map((s) => {
                const records = studentAttendance.filter((a) => a.studentId === s.id);
                return (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3">
                    <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{records.length} attendance records</p>
                  </div>
                );
              })}
            </div>
            <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Student</Label>
                    <select value={selectedStudentForAttendance || ''} onChange={(e) => setSelectedStudentForAttendance(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option value="">Select student</option>
                      {classStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="mt-0.5 h-8 text-sm" />
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

        {activeTab === 'leave' && (
          <div>
            <Button onClick={() => setShowLeaveForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
              <Plus className="w-4 h-4 mr-2" /> Record Leave
            </Button>
            <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Student Leave</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Student</Label>
                    <select value={leaveStudentId} onChange={(e) => setLeaveStudentId(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option value="">Select student</option>
                      {classStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} className="mt-0.5 h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Days</Label>
                    <Input type="number" value={leaveDays} onChange={(e) => setLeaveDays(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="Number of days" />
                  </div>
                  <div>
                    <Label className="text-xs">Reason</Label>
                    <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} className="mt-0.5 text-sm" rows={2} placeholder="Reason for leave" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { handleLeaveSubmit(); }} className="flex-1 border-red-200 text-red-500">Reject</Button>
                    <Button onClick={handleLeaveSubmit} className="flex-1 bg-green-500 hover:bg-green-600">Approve</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div>
            {classSubjects.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No subjects assigned</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="text-left p-2 text-xs text-gray-500">Subject</th>
                    <th className="text-left p-2 text-xs text-gray-500">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {classSubjects.map((sub) => {
                    const subTeacher = teachers.find((t) => t.id === sub.teacherId);
                    return (
                      <tr key={sub.id} className="border-b border-gray-50">
                        <td className="p-2 font-bold text-gray-800">{sub.name}</td>
                        <td className="p-2 text-gray-500 text-xs">{subTeacher?.name || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── My Timetable ─────────────────────────────────────────────────────────────
function MyTimetableSection() {
  const { currentUser, teachers, teacherTimetables, sessions, subjects } = useAppStore();
  const teacher = teachers.find((t) => t.id === currentUser?.teacherId);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const teacherTimetable = teacherTimetables.find((t) => t.teacherId === currentUser?.teacherId);
  const dayEntries = teacherTimetable?.entries
    .filter((e) => e.day === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber) || [];

  return (
    <div className="p-4">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
        {DAYS_OF_WEEK.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedDay === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {dayEntries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 text-orange-200" />
          <p className="text-sm">No periods for {selectedDay}</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-orange-50">
              <th className="text-left p-2 text-xs text-gray-500">Period</th>
              <th className="text-left p-2 text-xs text-gray-500">Name</th>
              <th className="text-left p-2 text-xs text-gray-500">Class</th>
              <th className="text-left p-2 text-xs text-gray-500">Subject</th>
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
                  <td className="p-2 text-gray-500 text-xs">{cls?.name || '—'}</td>
                  <td className="p-2 text-gray-500 text-xs">{sub?.name || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Leave ────────────────────────────────────────────────────────────────────
function LeaveSection() {
  const { currentUser, teachers, sessions, leaveRequests, addLeaveRequest } = useAppStore();
  const teacher = teachers.find((t) => t.id === currentUser?.teacherId);
  const [activeTab, setActiveTab] = useState<'my' | 'other'>('my');
  const [showForm, setShowForm] = useState(false);
  const [day, setDay] = useState('Monday');
  const [date, setDate] = useState('');
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');

  const myLeaves = leaveRequests.filter((lr) => lr.teacherId === currentUser?.teacherId);
  const otherLeaves = leaveRequests.filter((lr) => lr.teacherId !== currentUser?.teacherId);

  const handleSubmit = () => {
    if (!date || !days || !reason) { toast.error('Fill all required fields'); return; }
    if (!currentUser?.teacherId) return;
    addLeaveRequest({
      teacherId: currentUser.teacherId,
      day,
      date,
      days: parseInt(days),
      reason,
      classInchargeId: teacher?.classInchargeId,
    });
    toast.success('Leave request submitted');
    setShowForm(false);
    setDay('Monday'); setDate(''); setDays(''); setReason('');
  };

  return (
    <div className="p-4">
      <div className="flex rounded-xl overflow-hidden border border-orange-200 mb-4">
        <button onClick={() => setActiveTab('my')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'my' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}>My Leave</button>
        <button onClick={() => setActiveTab('other')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'other' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}>Other Leave</button>
      </div>

      {activeTab === 'my' && (
        <>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Leave
          </Button>
          {myLeaves.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No leave requests</p>
          ) : (
            <div className="space-y-2">
              {myLeaves.map((lr) => (
                <div key={lr.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{lr.date}</p>
                      <p className="text-xs text-gray-500">{lr.days} day{lr.days !== 1 ? 's' : ''} • {lr.reason}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      lr.status === 'approved' ? 'bg-green-100 text-green-600' :
                      lr.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>{lr.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'other' && (
        <div className="space-y-2">
          {otherLeaves.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No other leave requests</p>
          ) : (
            otherLeaves.map((lr) => {
              const t = teachers.find((t) => t.id === lr.teacherId);
              return (
                <div key={lr.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{t?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{lr.date} • {lr.days}d • {lr.reason}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      lr.status === 'approved' ? 'bg-green-100 text-green-600' :
                      lr.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>{lr.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Day</Label>
              <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-0.5 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Number of Days *</Label>
              <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="1" />
            </div>
            <div>
              <Label className="text-xs">Reason *</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-0.5 text-sm" rows={2} placeholder="Reason for leave" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Salary ───────────────────────────────────────────────────────────────────
function SalarySection() {
  const { currentUser, salaryRecords } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);

  const salary = salaryRecords.find(
    (r) => r.teacherId === currentUser?.teacherId && r.month === selectedMonth
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <Label className="text-xs">Select Month</Label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {salary ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
            <p className="text-orange-100 text-sm">Total Salary</p>
            <p className="text-3xl font-bold mt-1">₹{salary.totalSalary.toLocaleString()}</p>
            <p className="text-orange-100 text-xs mt-1">{selectedMonth} {salary.year}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-xs text-gray-400">Approved</p>
              <p className="text-lg font-bold text-green-600">₹{salary.approvedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-xs text-gray-400">Deducted</p>
              <p className="text-lg font-bold text-red-500">₹{salary.deductedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-xs text-gray-400">Absent Days</p>
              <p className="text-lg font-bold text-gray-700">{salary.absentDays}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-xs text-gray-400">Holiday Days</p>
              <p className="text-lg font-bold text-gray-700">{salary.holidayDays}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-orange-200" />
          <p className="font-medium">No salary data</p>
          <p className="text-sm mt-1">No salary record for {selectedMonth}</p>
        </div>
      )}
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────
function ProgressSection({ selectedSession }: { selectedSession: string }) {
  const { currentUser, sessions, subjects, students, progressBatches, updateProgressSubjectMarks, markProgressSubjectComplete } = useAppStore();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});

  // Find batches where this teacher has subjects assigned
  const myBatches = progressBatches.filter((pb) =>
    pb.subjects.some((s) => s.teacherId === currentUser?.teacherId)
  );

  const batch = progressBatches.find((pb) => pb.id === selectedBatch);
  const mySubjects = batch?.subjects.filter((s) => s.teacherId === currentUser?.teacherId) || [];
  const currentSubject = mySubjects.find((s) => s.id === selectedSubjectId);

  const handleSaveMarks = () => {
    if (!selectedBatch || !selectedSubjectId) return;
    const studentMarks = Object.entries(marks).map(([studentId, obtainedMarks]) => ({
      studentId,
      obtainedMarks: parseInt(obtainedMarks) || 0,
    }));
    updateProgressSubjectMarks(selectedBatch, selectedSubjectId, studentMarks);
    markProgressSubjectComplete(selectedBatch, selectedSubjectId);
    toast.success('Marks saved and sent to admin');
    setSelectedSubjectId(null);
    setMarks({});
  };

  if (selectedSubjectId && currentSubject) {
    const subjectData = subjects.find((s) => s.id === currentSubject.subjectId);
    const subjectStudents = students.filter((s) => currentSubject.studentIds.includes(s.id)).sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className="p-4">
        <button onClick={() => { setSelectedSubjectId(null); setMarks({}); }} className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-orange-500">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h3 className="font-bold text-gray-800 mb-1">{subjectData?.name}</h3>
        <p className="text-xs text-gray-500 mb-4">Total Marks: {currentSubject.totalMarks}</p>
        <div className="space-y-2 mb-4">
          {subjectStudents.map((s) => {
            const existing = currentSubject.studentMarks.find((sm) => sm.studentId === s.id);
            return (
              <div key={s.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">Adm. {s.admissionNo}</p>
                </div>
                <Input
                  type="number"
                  value={marks[s.id] ?? (existing?.obtainedMarks?.toString() || '')}
                  onChange={(e) => setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  placeholder="Marks"
                  className="w-20 h-8 text-sm text-center"
                  max={currentSubject.totalMarks}
                />
              </div>
            );
          })}
        </div>
        <Button onClick={handleSaveMarks} className="w-full bg-orange-500 hover:bg-orange-600">Save & Send</Button>
      </div>
    );
  }

  if (selectedBatch && batch) {
    return (
      <div className="p-4">
        <button onClick={() => setSelectedBatch(null)} className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-orange-500">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h3 className="font-bold text-gray-800 mb-4">{batch.title}</h3>
        <div className="space-y-2">
          {mySubjects.map((sub) => {
            const subjectData = subjects.find((s) => s.id === sub.subjectId);
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between hover:border-orange-200 transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">{subjectData?.name}</p>
                  <p className="text-xs text-gray-400">{sub.studentIds.length} students • {sub.totalMarks} marks</p>
                </div>
                {sub.completed ? (
                  <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="text-xs text-orange-400">Pending</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {myBatches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-orange-200" />
          <p className="font-medium">No progress batches</p>
          <p className="text-sm mt-1">Admin will assign progress batches</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myBatches.map((pb) => {
            const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === pb.classId);
            const mySubCount = pb.subjects.filter((s) => s.teacherId === currentUser?.teacherId).length;
            const completedCount = pb.subjects.filter((s) => s.teacherId === currentUser?.teacherId && s.completed).length;
            return (
              <button
                key={pb.id}
                onClick={() => setSelectedBatch(pb.id)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-orange-200 transition-colors"
              >
                <p className="font-semibold text-gray-800 text-sm">{pb.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cls?.name}</p>
                <p className="text-xs text-orange-500 mt-1">{completedCount}/{mySubCount} subjects done</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Homework ─────────────────────────────────────────────────────────────────
function HomeworkSection({ selectedSession }: { selectedSession: string }) {
  const { currentUser, sessions, subjects, homework, addHomework } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  const sessionData = sessions.find((s) => s.id === selectedSession);
  const myHomework = homework.filter((h) => h.teacherId === currentUser?.teacherId);

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

  const handleSubmit = () => {
    if (!title.trim() || !selectedClass) { toast.error('Title and class required'); return; }
    if (!currentUser?.teacherId) return;
    addHomework({ teacherId: currentUser.teacherId, sessionId: selectedSession, classId: selectedClass, title, description, attachments });
    toast.success('Homework added');
    setShowForm(false);
    setTitle(''); setDescription(''); setSelectedClass(''); setAttachments([]);
  };

  return (
    <div className="p-4">
      <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Homework
      </Button>

      {myHomework.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No homework added yet</div>
      ) : (
        <div className="space-y-2">
          {myHomework.map((hw) => {
            const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === hw.classId);
            return (
              <div key={hw.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <p className="font-semibold text-gray-800 text-sm">{hw.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cls?.name} • {format(new Date(hw.date), 'dd MMM yyyy')}</p>
                {hw.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{hw.description}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Homework</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Class *</Label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select class</option>
                {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="Homework title" />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-0.5 text-sm" rows={3} placeholder="Homework details" />
            </div>
            <div>
              <Label className="text-xs">Attachments</Label>
              <div className="mt-1 space-y-1">
                {attachments.map((att, i) => (
                  <div key={i} className="relative">
                    <img src={att} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-orange-200 rounded-lg p-2 hover:border-orange-400">
                  <Paperclip className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-orange-500">Add attachment</span>
                  <input type="file" accept="image/*,video/*" multiple onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Lesson Plan ──────────────────────────────────────────────────────────────
function LessonPlanSection({ selectedSession }: { selectedSession: string }) {
  const { currentUser, sessions, subjects, lessonPlans, addLessonPlan } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const sessionData = sessions.find((s) => s.id === selectedSession);
  const classSubjects = subjects.filter((s) => s.classId === selectedClass && s.sessionId === selectedSession);
  const myPlans = lessonPlans.filter((lp) => lp.teacherId === currentUser?.teacherId);

  const handleSubmit = () => {
    if (!selectedClass || !selectedSubject || !topic || !startDate || !endDate) {
      toast.error('Fill all required fields'); return;
    }
    if (!currentUser?.teacherId) return;
    addLessonPlan({ teacherId: currentUser.teacherId, sessionId: selectedSession, classId: selectedClass, subjectId: selectedSubject, topic, startDate, endDate });
    toast.success('Lesson plan submitted');
    setShowForm(false);
    setSelectedClass(''); setSelectedSubject(''); setTopic(''); setStartDate(''); setEndDate('');
  };

  return (
    <div className="p-4">
      <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 mb-4 w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Lesson Plan
      </Button>

      {myPlans.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No lesson plans yet</div>
      ) : (
        <div className="space-y-2">
          {myPlans.map((lp) => {
            const cls = sessions.flatMap((s) => s.classes).find((c) => c.id === lp.classId);
            const sub = subjects.find((s) => s.id === lp.subjectId);
            return (
              <div key={lp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <p className="font-semibold text-gray-800 text-sm">{lp.topic}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cls?.name} • {sub?.name}</p>
                <p className="text-xs text-gray-400">{lp.startDate} → {lp.endDate}</p>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Lesson Plan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Class *</Label>
              <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(''); }} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select class</option>
                {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {selectedClass && (
              <div>
                <Label className="text-xs">Subject *</Label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select subject</option>
                  {classSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <Label className="text-xs">Topic *</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-0.5 h-8 text-sm" placeholder="Lesson topic" />
            </div>
            <div>
              <Label className="text-xs">Start Date *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-0.5 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">End Date *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-0.5 h-8 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">Send & Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Event Calendar ───────────────────────────────────────────────────────────
function EventCalendarSection({ selectedSession }: { selectedSession: string }) {
  const { events } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const sessionEvents = events.filter((e) => e.sessionId === selectedSession);

  const getEventForDate = (dateStr: string) => sessionEvents.find((e) => e.date === dateStr);

  const selectedEvent = selectedDate ? getEventForDate(selectedDate) : null;

  return (
    <div className="p-4">
      {!selectedSession ? (
        <div className="text-center py-12 text-gray-400 text-sm">Select a session from the header</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))} className="p-1 rounded-lg hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))} className="p-1 rounded-lg hover:bg-gray-100">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-100">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} className="h-10" />)}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const event = getEventForDate(dateStr);
                const today = isToday(day);
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-10 flex flex-col items-center justify-center relative transition-colors hover:bg-orange-50 ${today ? 'bg-orange-500 text-white rounded-full mx-1' : 'text-gray-700'}`}
                  >
                    <span className="text-xs font-medium">{format(day, 'd')}</span>
                    {event && <div className="w-1 h-1 rounded-full bg-orange-400 absolute bottom-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && selectedEvent && (
            <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-4">
              <p className="font-bold text-gray-800 text-sm mb-1">{format(new Date(selectedDate), 'dd MMMM yyyy')}</p>
              <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
            </div>
          )}
          {selectedDate && !selectedEvent && (
            <div className="text-center py-4 text-gray-400 text-sm">No event on {format(new Date(selectedDate), 'dd MMM yyyy')}</div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Greetings ────────────────────────────────────────────────────────────────
function GreetingsSection({ selectedSession }: { selectedSession: string }) {
  const { greetings, currentUser, teachers } = useAppStore();
  const teacher = teachers.find((t) => t.id === currentUser?.teacherId);

  const myGreetings = greetings.filter((g) => {
    if (selectedSession && g.sessionId !== selectedSession) return false;
    if (g.classIds.length === 0) return true;
    if (teacher?.classInchargeId && g.classIds.includes(teacher.classInchargeId)) return true;
    return false;
  });

  return (
    <div className="p-4">
      {myGreetings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-3 text-orange-200" />
          <p className="font-medium">No greetings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myGreetings.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 text-sm">{g.title}</h3>
              {g.description && <p className="text-gray-500 text-xs mt-1">{g.description}</p>}
              <p className="text-orange-400 text-xs mt-1">{format(new Date(g.date), 'dd MMM yyyy')}</p>
              {g.images.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {g.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="rounded-lg w-full h-24 object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── My Academics ─────────────────────────────────────────────────────────────
function MyAcademicsSection() {
  const { currentUser, teachers, sessions, subjects, teacherAttendance } = useAppStore();
  const teacher = teachers.find((t) => t.id === currentUser?.teacherId);
  const [activeTab, setActiveTab] = useState<'incharge' | 'classes' | 'attendance'>('incharge');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const classIncharge = teacher?.classInchargeId
    ? sessions.flatMap((s) => s.classes).find((c) => c.id === teacher.classInchargeId)
    : null;

  const mySubjects = subjects.filter((s) => s.teacherId === currentUser?.teacherId);

  const myAttendance = teacherAttendance.filter((a) => a.teacherId === currentUser?.teacherId);
  const monthAttendance = myAttendance.filter((a) => {
    const d = new Date(a.date);
    return d.getMonth() === selectedMonth;
  });

  const tabs = [
    { id: 'incharge' as const, label: 'Class Incharge' },
    { id: 'classes' as const, label: 'Classes to Teach' },
    { id: 'attendance' as const, label: 'My Attendance' },
  ];

  return (
    <div>
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'incharge' && (
          <div className="text-center py-8">
            {classIncharge ? (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-8 h-8 text-orange-500" />
                </div>
                <p className="font-bold text-gray-800 text-lg">{classIncharge.name}</p>
                <p className="text-sm text-gray-500 mt-1">You are the class incharge</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-500">No Class Incharge</p>
                <p className="text-sm text-gray-400 mt-1">You are not assigned as class incharge</p>
              </>
            )}
          </div>
        )}

        {activeTab === 'classes' && (
          <div>
            {mySubjects.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No classes assigned</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="text-left p-2 text-xs text-gray-500">Class</th>
                    <th className="text-left p-2 text-xs text-gray-500">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubjects.map((sub) => {
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
            <div className="mb-3">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            {monthAttendance.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No attendance records for {MONTHS[selectedMonth]}</p>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
