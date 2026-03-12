import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../../store/appStore';
import { Home, MessageCircle, User, Menu, LogOut } from 'lucide-react';
import TeacherHome from './TeacherHome';
import TeacherCommunication from './TeacherCommunication';
import TeacherProfile from './TeacherProfile';
import TeacherMenu from './TeacherMenu';

type TeacherTab = 'home' | 'communication' | 'profile' | 'menu';

const navItems: { id: TeacherTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'communication', label: 'Chat', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'menu', label: 'Menu', icon: Menu },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TeacherTab>('home');
  const [selectedSession, setSelectedSession] = useState('');
  const { logout, currentUser, sessions } = useAppStore();
  const navigate = useNavigate();

  const allowedSessions = sessions.filter((s) => s.visibleToTeachers);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <TeacherHome selectedSession={selectedSession} />;
      case 'communication': return <TeacherCommunication selectedSession={selectedSession} />;
      case 'profile': return <TeacherProfile />;
      case 'menu': return <TeacherMenu selectedSession={selectedSession} />;
      default: return <TeacherHome selectedSession={selectedSession} />;
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
            <p className="text-orange-100 text-xs">Teacher Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="text-xs bg-orange-600 text-white border border-orange-400 rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="">Select Session</option>
            {allowedSessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
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
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                  isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : ''}`} />
                <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-orange-500' : ''}`}>
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
