import { create } from 'zustand';

export interface AppUser {
  username: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  schoolCode: string;
  teacherId?: string;
}

export interface SessionData {
  id: string;
  name: string;
  classes: ClassData[];
  visibleToStudents?: boolean;
  visibleToTeachers?: boolean;
}

export interface ClassData {
  id: string;
  name: string;
  sessionId: string;
}

export interface StudentData {
  id: string;
  name: string;
  admissionNo: string;
  aadhaarNo?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  address?: string;
  classId: string;
  sessionId: string;
  fatherName?: string;
  motherName?: string;
  fatherMobile?: string;
  motherMobile?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  guardianInfo?: string;
  username: string;
  password: string;
  code: string;
}

export interface TeacherData {
  id: string;
  name: string;
  teacherNo: string;
  dateOfBirth?: string;
  joiningDate?: string;
  qualification?: string;
  fatherName?: string;
  motherName?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  classInchargeId?: string;
  username: string;
  password: string;
  code: string;
  sessionId: string;
}

export interface CircularData {
  id: string;
  title: string;
  description: string;
  date: string;
  sessionId: string;
  classIds: string[];
  attachments: string[];
}

export interface TimetableEntry {
  id: string;
  periodName: string;
  periodNumber: number;
  day: string;
  classId?: string;
  subjectId?: string;
}

export interface ClassTimetable {
  classId: string;
  entries: TimetableEntry[];
}

export interface TeacherTimetable {
  teacherId: string;
  entries: TeacherTimetableEntry[];
}

export interface TeacherTimetableEntry {
  id: string;
  day: string;
  periodNumber: number;
  periodName?: string;
  classId?: string;
  subjectId?: string;
}

export interface SubjectData {
  id: string;
  name: string;
  teacherId: string;
  classId: string;
  sessionId: string;
}

export interface FeeEntry {
  studentId: string;
  month: string;
  approvedAmount: number;
  pendingAmount: number;
  totalAmount: number;
  lastUpdated: string;
}

export interface GreetingData {
  id: string;
  title: string;
  description: string;
  sessionId: string;
  classIds: string[];
  images: string[];
  date: string;
}

export interface LessonPlanData {
  id: string;
  teacherId: string;
  sessionId: string;
  classId: string;
  subjectId: string;
  topic: string;
  startDate: string;
  endDate: string;
  date: string;
}

export interface EventData {
  id: string;
  sessionId: string;
  date: string;
  description: string;
}

export interface AttendanceRecord {
  teacherId: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'leave' | 'holiday';
}

export interface SalaryRecord {
  teacherId: string;
  month: string;
  year: number;
  perDayAmount: number;
  totalAmount: number;
  approvedAmount: number;
  deductedAmount: number;
  absentDays: number;
  holidayDays: number;
  totalSalary: number;
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  day: string;
  date: string;
  days: number;
  reason: string;
  classInchargeId?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface StudentAttendance {
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'leave' | 'holiday';
}

export interface HomeworkData {
  id: string;
  teacherId: string;
  sessionId: string;
  classId: string;
  title: string;
  description: string;
  attachments: string[];
  date: string;
}

export interface ProgressBatch {
  id: string;
  title: string;
  sessionId: string;
  classId: string;
  subjects: ProgressSubject[];
  createdAt: string;
}

export interface ProgressSubject {
  id: string;
  subjectId: string;
  teacherId: string;
  totalMarks: number;
  studentIds: string[];
  studentMarks: { studentId: string; obtainedMarks?: number }[];
  completed: boolean;
  approved: boolean;
}

export interface MessageData {
  id: string;
  teacherId: string;
  studentId: string;
  content: string;
  attachments: string[];
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
}

interface AppState {
  currentUser: AppUser | null;
  sessions: SessionData[];
  students: StudentData[];
  teachers: TeacherData[];
  circulars: CircularData[];
  classTimetables: ClassTimetable[];
  teacherTimetables: TeacherTimetable[];
  subjects: SubjectData[];
  fees: FeeEntry[];
  greetings: GreetingData[];
  lessonPlans: LessonPlanData[];
  events: EventData[];
  teacherAttendance: AttendanceRecord[];
  salaryRecords: SalaryRecord[];
  leaveRequests: LeaveRequest[];
  studentAttendance: StudentAttendance[];
  homework: HomeworkData[];
  progressBatches: ProgressBatch[];
  messages: MessageData[];
  studentEntrySessionId: string | null;

  setCurrentUser: (user: AppUser | null) => void;
  logout: () => void;

  // Sessions
  addSession: (name: string) => SessionData;
  addClassToSession: (sessionId: string, className: string) => ClassData;
  updateSessionVisibility: (sessionId: string, visibleToStudents: boolean, visibleToTeachers: boolean) => void;
  setStudentEntrySession: (sessionId: string) => void;

  // Students
  addStudent: (student: Omit<StudentData, 'id'>) => StudentData;
  updateStudent: (id: string, data: Partial<StudentData>) => void;
  deleteStudent: (id: string) => void;
  passStudent: (studentId: string, newSessionId: string, newClassId: string) => void;

  // Teachers
  addTeacher: (teacher: Omit<TeacherData, 'id'>) => TeacherData;
  updateTeacher: (id: string, data: Partial<TeacherData>) => void;
  deleteTeacher: (id: string) => void;

  // Circulars
  addCircular: (circular: Omit<CircularData, 'id' | 'date'>) => CircularData;
  updateCircular: (id: string, data: Partial<CircularData>) => void;
  deleteCircular: (id: string) => void;

  // Timetables
  saveClassTimetable: (classId: string, entries: TimetableEntry[]) => void;
  saveTeacherTimetableEntry: (teacherId: string, entry: Omit<TeacherTimetableEntry, 'id'>) => void;
  deleteTeacherTimetableEntry: (teacherId: string, entryId: string) => void;

  // Subjects
  addSubject: (subject: Omit<SubjectData, 'id'>) => SubjectData;
  deleteSubject: (id: string) => void;

  // Fees
  saveFeeEntry: (entry: FeeEntry) => void;

  // Greetings
  addGreeting: (greeting: Omit<GreetingData, 'id' | 'date'>) => GreetingData;
  updateGreeting: (id: string, data: Partial<GreetingData>) => void;
  deleteGreeting: (id: string) => void;

  // Lesson Plans
  addLessonPlan: (plan: Omit<LessonPlanData, 'id' | 'date'>) => LessonPlanData;

  // Events
  saveEvent: (event: Omit<EventData, 'id'>) => EventData;
  deleteEvent: (id: string) => void;

  // Teacher Attendance
  saveTeacherAttendance: (record: AttendanceRecord) => void;

  // Salary
  saveSalaryRecord: (record: SalaryRecord) => void;

  // Leave
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => LeaveRequest;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;

  // Student Attendance
  saveStudentAttendance: (record: StudentAttendance) => void;

  // Homework
  addHomework: (hw: Omit<HomeworkData, 'id' | 'date'>) => HomeworkData;

  // Progress
  addProgressBatch: (batch: Omit<ProgressBatch, 'id' | 'createdAt'>) => ProgressBatch;
  updateProgressSubjectMarks: (batchId: string, subjectId: string, studentMarks: { studentId: string; obtainedMarks: number }[]) => void;
  markProgressSubjectComplete: (batchId: string, subjectId: string) => void;
  approveProgressBatch: (batchId: string) => void;

  // Messages
  addMessage: (msg: Omit<MessageData, 'id' | 'timestamp'>) => MessageData;

  // Teacher class incharge
  setTeacherClassIncharge: (teacherId: string, classId: string | null) => void;
}

let idCounter = 1;
const genId = () => `id_${Date.now()}_${idCounter++}`;

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  sessions: [],
  students: [],
  teachers: [],
  circulars: [],
  classTimetables: [],
  teacherTimetables: [],
  subjects: [],
  fees: [],
  greetings: [],
  lessonPlans: [],
  events: [],
  teacherAttendance: [],
  salaryRecords: [],
  leaveRequests: [],
  studentAttendance: [],
  homework: [],
  progressBatches: [],
  messages: [],
  studentEntrySessionId: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  addSession: (name) => {
    const session: SessionData = { id: genId(), name, classes: [], visibleToStudents: false, visibleToTeachers: false };
    set((s) => ({ sessions: [...s.sessions, session] }));
    return session;
  },

  addClassToSession: (sessionId, className) => {
    const cls: ClassData = { id: genId(), name: className, sessionId };
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, classes: [...sess.classes, cls] } : sess
      ),
    }));
    return cls;
  },

  updateSessionVisibility: (sessionId, visibleToStudents, visibleToTeachers) => {
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, visibleToStudents, visibleToTeachers } : sess
      ),
    }));
  },

  setStudentEntrySession: (sessionId) => set({ studentEntrySessionId: sessionId }),

  addStudent: (student) => {
    const s: StudentData = { ...student, id: genId() };
    set((state) => ({ students: [...state.students, s] }));
    return s;
  },

  updateStudent: (id, data) => {
    set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, ...data } : st)) }));
  },

  deleteStudent: (id) => {
    set((s) => ({ students: s.students.filter((st) => st.id !== id) }));
  },

  passStudent: (studentId, newSessionId, newClassId) => {
    set((s) => ({
      students: s.students.map((st) =>
        st.id === studentId ? { ...st, classId: newClassId, sessionId: newSessionId } : st
      ),
    }));
  },

  addTeacher: (teacher) => {
    const t: TeacherData = { ...teacher, id: genId() };
    set((s) => ({ teachers: [...s.teachers, t] }));
    return t;
  },

  updateTeacher: (id, data) => {
    set((s) => ({ teachers: s.teachers.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
  },

  deleteTeacher: (id) => {
    set((s) => ({ teachers: s.teachers.filter((t) => t.id !== id) }));
  },

  addCircular: (circular) => {
    const c: CircularData = { ...circular, id: genId(), date: new Date().toISOString() };
    set((s) => ({ circulars: [c, ...s.circulars] }));
    return c;
  },

  updateCircular: (id, data) => {
    set((s) => ({ circulars: s.circulars.map((c) => (c.id === id ? { ...c, ...data } : c)) }));
  },

  deleteCircular: (id) => {
    set((s) => ({ circulars: s.circulars.filter((c) => c.id !== id) }));
  },

  saveClassTimetable: (classId, entries) => {
    set((s) => {
      const existing = s.classTimetables.find((t) => t.classId === classId);
      if (existing) {
        return { classTimetables: s.classTimetables.map((t) => (t.classId === classId ? { ...t, entries } : t)) };
      }
      return { classTimetables: [...s.classTimetables, { classId, entries }] };
    });
  },

  saveTeacherTimetableEntry: (teacherId, entry) => {
    const newEntry: TeacherTimetableEntry = { ...entry, id: genId() };
    set((s) => {
      const existing = s.teacherTimetables.find((t) => t.teacherId === teacherId);
      if (existing) {
        return {
          teacherTimetables: s.teacherTimetables.map((t) =>
            t.teacherId === teacherId ? { ...t, entries: [...t.entries, newEntry] } : t
          ),
        };
      }
      return { teacherTimetables: [...s.teacherTimetables, { teacherId, entries: [newEntry] }] };
    });
  },

  deleteTeacherTimetableEntry: (teacherId, entryId) => {
    set((s) => ({
      teacherTimetables: s.teacherTimetables.map((t) =>
        t.teacherId === teacherId ? { ...t, entries: t.entries.filter((e) => e.id !== entryId) } : t
      ),
    }));
  },

  addSubject: (subject) => {
    const sub: SubjectData = { ...subject, id: genId() };
    set((s) => ({ subjects: [...s.subjects, sub] }));
    return sub;
  },

  deleteSubject: (id) => {
    set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) }));
  },

  saveFeeEntry: (entry) => {
    set((s) => {
      const existing = s.fees.findIndex((f) => f.studentId === entry.studentId && f.month === entry.month);
      if (existing >= 0) {
        const updated = [...s.fees];
        updated[existing] = entry;
        return { fees: updated };
      }
      return { fees: [...s.fees, entry] };
    });
  },

  addGreeting: (greeting) => {
    const g: GreetingData = { ...greeting, id: genId(), date: new Date().toISOString() };
    set((s) => ({ greetings: [g, ...s.greetings] }));
    return g;
  },

  updateGreeting: (id, data) => {
    set((s) => ({ greetings: s.greetings.map((g) => (g.id === id ? { ...g, ...data } : g)) }));
  },

  deleteGreeting: (id) => {
    set((s) => ({ greetings: s.greetings.filter((g) => g.id !== id) }));
  },

  addLessonPlan: (plan) => {
    const lp: LessonPlanData = { ...plan, id: genId(), date: new Date().toISOString() };
    set((s) => ({ lessonPlans: [lp, ...s.lessonPlans] }));
    return lp;
  },

  saveEvent: (event) => {
    const ev: EventData = { ...event, id: genId() };
    set((s) => {
      const existing = s.events.findIndex((e) => e.sessionId === event.sessionId && e.date === event.date);
      if (existing >= 0) {
        const updated = [...s.events];
        updated[existing] = ev;
        return { events: updated };
      }
      return { events: [...s.events, ev] };
    });
    return ev;
  },

  deleteEvent: (id) => {
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
  },

  saveTeacherAttendance: (record) => {
    set((s) => {
      const existing = s.teacherAttendance.findIndex(
        (a) => a.teacherId === record.teacherId && a.date === record.date
      );
      if (existing >= 0) {
        const updated = [...s.teacherAttendance];
        updated[existing] = record;
        return { teacherAttendance: updated };
      }
      return { teacherAttendance: [...s.teacherAttendance, record] };
    });
  },

  saveSalaryRecord: (record) => {
    set((s) => {
      const existing = s.salaryRecords.findIndex(
        (r) => r.teacherId === record.teacherId && r.month === record.month && r.year === record.year
      );
      if (existing >= 0) {
        const updated = [...s.salaryRecords];
        updated[existing] = record;
        return { salaryRecords: updated };
      }
      return { salaryRecords: [...s.salaryRecords, record] };
    });
  },

  addLeaveRequest: (req) => {
    const lr: LeaveRequest = { ...req, id: genId(), submittedAt: new Date().toISOString(), status: 'pending' };
    set((s) => ({ leaveRequests: [lr, ...s.leaveRequests] }));
    return lr;
  },

  updateLeaveStatus: (id, status) => {
    set((s) => ({
      leaveRequests: s.leaveRequests.map((lr) => (lr.id === id ? { ...lr, status } : lr)),
    }));
  },

  saveStudentAttendance: (record) => {
    set((s) => {
      const existing = s.studentAttendance.findIndex(
        (a) => a.studentId === record.studentId && a.date === record.date
      );
      if (existing >= 0) {
        const updated = [...s.studentAttendance];
        updated[existing] = record;
        return { studentAttendance: updated };
      }
      return { studentAttendance: [...s.studentAttendance, record] };
    });
  },

  addHomework: (hw) => {
    const h: HomeworkData = { ...hw, id: genId(), date: new Date().toISOString() };
    set((s) => ({ homework: [h, ...s.homework] }));
    return h;
  },

  addProgressBatch: (batch) => {
    const pb: ProgressBatch = { ...batch, id: genId(), createdAt: new Date().toISOString() };
    set((s) => ({ progressBatches: [pb, ...s.progressBatches] }));
    return pb;
  },

  updateProgressSubjectMarks: (batchId, subjectId, studentMarks) => {
    set((s) => ({
      progressBatches: s.progressBatches.map((pb) =>
        pb.id === batchId
          ? {
              ...pb,
              subjects: pb.subjects.map((sub) =>
                sub.id === subjectId ? { ...sub, studentMarks } : sub
              ),
            }
          : pb
      ),
    }));
  },

  markProgressSubjectComplete: (batchId, subjectId) => {
    set((s) => ({
      progressBatches: s.progressBatches.map((pb) =>
        pb.id === batchId
          ? {
              ...pb,
              subjects: pb.subjects.map((sub) =>
                sub.id === subjectId ? { ...sub, completed: true } : sub
              ),
            }
          : pb
      ),
    }));
  },

  approveProgressBatch: (batchId) => {
    set((s) => ({
      progressBatches: s.progressBatches.map((pb) =>
        pb.id === batchId
          ? { ...pb, subjects: pb.subjects.map((sub) => ({ ...sub, approved: true })) }
          : pb
      ),
    }));
  },

  addMessage: (msg) => {
    const m: MessageData = { ...msg, id: genId(), timestamp: new Date().toISOString() };
    set((s) => ({ messages: [...s.messages, m] }));
    return m;
  },

  setTeacherClassIncharge: (teacherId, classId) => {
    set((s) => ({
      teachers: s.teachers.map((t) =>
        t.id === teacherId ? { ...t, classInchargeId: classId ?? undefined } : t
      ),
    }));
  },
}));
