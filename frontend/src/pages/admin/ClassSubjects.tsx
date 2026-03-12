import { useState } from 'react';
import { useAppStore, SessionData, ClassData } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props { session: SessionData; classData: ClassData; teacherView?: boolean; }

export default function ClassSubjects({ session, classData, teacherView }: Props) {
  const { subjects, teachers, addSubject, deleteSubject } = useAppStore();
  const classSubjects = subjects
    .filter((s) => s.classId === classData.id && s.sessionId === session.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const sessionTeachers = teachers.filter((t) => t.sessionId === session.id);

  const [showForm, setShowForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const handleAdd = () => {
    if (!subjectName.trim()) { toast.error('Subject name required'); return; }
    addSubject({ name: subjectName.trim(), teacherId, classId: classData.id, sessionId: session.id });
    setSubjectName(''); setTeacherId(''); setShowForm(false);
    toast.success('Subject added');
  };

  return (
    <div className="p-4">
      {!teacherView && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Subjects</span>
          <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-8 h-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {classSubjects.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No subjects added yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50">
                <th className="text-left p-2 text-xs text-gray-500 font-medium">Subject</th>
                <th className="text-left p-2 text-xs text-gray-500 font-medium">Teacher</th>
                {!teacherView && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {classSubjects.map((sub) => {
                const teacher = teachers.find((t) => t.id === sub.teacherId);
                return (
                  <tr key={sub.id} className="border-b border-gray-50">
                    <td className="p-2 font-bold text-gray-800">{sub.name}</td>
                    <td className="p-2 text-gray-500 text-xs">{teacher?.name || '—'}</td>
                    {!teacherView && (
                      <td className="p-2">
                        <button onClick={() => { deleteSubject(sub.id); toast.success('Subject deleted'); }} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Subject Name</Label>
              <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Mathematics" className="mt-1" />
            </div>
            <div>
              <Label>Assign Teacher</Label>
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select teacher</option>
                {sessionTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAdd} className="flex-1 bg-orange-500 hover:bg-orange-600">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
