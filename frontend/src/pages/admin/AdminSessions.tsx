import { useState } from 'react';
import { useAppStore, SessionData, ClassData } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ArrowLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ClassDetailView from './ClassDetailView';

type View = 'sessions' | 'session-detail' | 'class-detail' | 'visibility';

export default function AdminSessions() {
  const { sessions, addSession, addClassToSession, updateSessionVisibility, setStudentEntrySession, studentEntrySessionId } = useAppStore();
  const [view, setView] = useState<View>('sessions');
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newClassName, setNewClassName] = useState('');

  const currentSession = sessions.find((s) => s.id === selectedSession?.id) || selectedSession;

  const handleAddSession = () => {
    if (!newSessionName.trim()) { toast.error('Enter session name'); return; }
    addSession(newSessionName.trim());
    setNewSessionName(''); setShowAddSession(false);
    toast.success('Session added');
  };

  const handleAddClass = () => {
    if (!newClassName.trim() || !selectedSession) { toast.error('Enter class name'); return; }
    const cls = addClassToSession(selectedSession.id, newClassName.trim());
    setNewClassName(''); setShowAddClass(false);
    toast.success('Class added');
  };

  if (view === 'class-detail' && selectedClass && currentSession) {
    return (
      <ClassDetailView
        session={currentSession}
        classData={selectedClass}
        onBack={() => { setView('session-detail'); setSelectedClass(null); }}
      />
    );
  }

  if (view === 'session-detail' && currentSession) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { setView('sessions'); setSelectedSession(null); }} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{currentSession.name}</h2>
          <button onClick={() => setShowVisibility(true)} className="ml-auto text-xs text-orange-500 border border-orange-200 rounded-lg px-2 py-1 hover:bg-orange-50">
            Visibility
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Classes</span>
          <Button onClick={() => setShowAddClass(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-8 h-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {currentSession.classes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No classes yet. Tap + to add.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentSession.classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => { setSelectedClass(cls); setView('class-detail'); }}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-orange-200 transition-colors"
              >
                <span className="font-medium text-gray-800">{cls.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}

        {/* Visibility Dialog */}
        <Dialog open={showVisibility} onOpenChange={setShowVisibility}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Session Visibility</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Visible to Students</span>
                <button
                  onClick={() => updateSessionVisibility(currentSession.id, !currentSession.visibleToStudents, currentSession.visibleToTeachers ?? false)}
                  className={`w-12 h-6 rounded-full transition-colors ${currentSession.visibleToStudents ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${currentSession.visibleToStudents ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Visible to Teachers</span>
                <button
                  onClick={() => updateSessionVisibility(currentSession.id, currentSession.visibleToStudents ?? false, !currentSession.visibleToTeachers)}
                  className={`w-12 h-6 rounded-full transition-colors ${currentSession.visibleToTeachers ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${currentSession.visibleToTeachers ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Student Entry Session</p>
                <select
                  value={studentEntrySessionId || ''}
                  onChange={(e) => setStudentEntrySession(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <Button onClick={() => setShowVisibility(false)} className="w-full bg-orange-500 hover:bg-orange-600">Done</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
            <Input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Class name (e.g. Class 5A)" onKeyDown={(e) => e.key === 'Enter' && handleAddClass()} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddClass(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAddClass} className="flex-1 bg-orange-500 hover:bg-orange-600">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Sessions</h2>
        <Button onClick={() => setShowAddSession(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-9 h-9 p-0">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No sessions yet</p>
          <p className="text-sm">Tap + to create a session</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedSession(s); setView('session-detail'); }}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-orange-200 transition-colors"
            >
              <div className="text-left">
                <span className="font-medium text-gray-800">{s.name}</span>
                <p className="text-xs text-gray-400 mt-0.5">{s.classes.length} class{s.classes.length !== 1 ? 'es' : ''}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Session</DialogTitle></DialogHeader>
          <Input value={newSessionName} onChange={(e) => setNewSessionName(e.target.value)} placeholder="Session name (e.g. 2024-25)" onKeyDown={(e) => e.key === 'Enter' && handleAddSession()} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddSession(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddSession} className="flex-1 bg-orange-500 hover:bg-orange-600">Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
