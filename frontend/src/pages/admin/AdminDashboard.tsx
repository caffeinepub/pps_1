import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../../store/appStore';
import {
  Home, Calendar, Users, UserCheck, Clock, BookOpen, CalendarDays, Heart, LogOut, GraduationCap, FileText, Bell
} from 'lucide-react';
import AdminCirculars from './AdminCirculars';
import AdminSessions from './AdminSessions';
import AdminStudents from './AdminStudents';
import AdminTeachers from './AdminTeachers';
import AdminTeacherTimetable from './AdminTeacherTimetable';
import AdminGreetings from './AdminGreetings';
import AdminLessonPlan from './AdminLessonPlan';
import AdminEventCalendar from './AdminEventCalendar';
import AdminLeave from './AdminLeave';
import AdminAcademics from './AdminAcademics';

type AdminTab = 'home' | 'sessions' | 'students' | 'teachers' | 'teacher-timetable' | 'teacher-academics' | 'lesson-plan' | 'event-calendar' | 'greetings' | 'leave';

const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'sessions', label: 'Session', icon: Calendar },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'teachers', label: 'Teachers', icon: UserCheck },
  { id: 'teacher-timetable', label: 'Timetable', icon: Clock },
  { id: 'teacher-academics', label: 'Academics', icon: GraduationCap },
  { id: 'lesson-plan', label: 'Lesson', icon: BookOpen },
  { id: 'event-calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'greetings', label: 'Greetings', icon: Heart },
  { id: 'leave', label: 'Leave', icon: FileText },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const { logout, currentUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <AdminCirculars />;
      case 'sessions': return <AdminSessions />;
      case 'students': return <AdminStudents />;
      case 'teachers': return <AdminTeachers />;
      case 'teacher-timetable': return <AdminTeacherTimetable />;
      case 'teacher-academics': return <AdminAcademics />;
      case 'lesson-plan': return <AdminLessonPlan />;
      case 'event-calendar': return <AdminEventCalendar />;
      case 'greetings': return <AdminGreetings />;
      case 'leave': return <AdminLeave />;
      default: return <AdminCirculars />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative">
      {/* Header */}
      <header className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-orange-500 font-bold text-xs">PPS</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Palak Public School</h1>
            <p className="text-orange-100 text-xs">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-orange-100">{currentUser?.name}</span>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-orange-600 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] py-2 px-1 transition-colors flex-1 ${
                  isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : ''}`} />
                <span className={`text-[9px] mt-0.5 font-medium ${isActive ? 'text-orange-500' : ''}`}>
                  {item.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
