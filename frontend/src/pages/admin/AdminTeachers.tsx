import { useState } from 'react';
import { useAppStore, TeacherData } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = () => ({
  name: '', teacherNo: '', dateOfBirth: '', joiningDate: '', qualification: '',
  fatherName: '', motherName: '', contactNumber: '', email: '', address: '',
  username: '', password: '', code: 'palakpublicschool', sessionId: '', classInchargeId: '',
});

export default function AdminTeachers() {
  const { teachers, sessions, addTeacher, updateTeacher, deleteTeacher } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<TeacherData | null>(null);
  const [form, setForm] = useState(emptyForm());

  const sessionTeachers = teachers
    .filter((t) => !selectedSession || t.sessionId === selectedSession)
    .sort((a, b) => a.teacherNo.localeCompare(b.teacherNo));

  const resetForm = () => { setForm(emptyForm()); setEditingId(null); };

  const openEdit = (t: TeacherData) => {
    setForm({
      name: t.name, teacherNo: t.teacherNo, dateOfBirth: t.dateOfBirth || '',
      joiningDate: t.joiningDate || '', qualification: t.qualification || '',
      fatherName: t.fatherName || '', motherName: t.motherName || '',
      contactNumber: t.contactNumber || '', email: t.email || '', address: t.address || '',
      username: t.username, password: t.password, code: t.code,
      sessionId: t.sessionId, classInchargeId: t.classInchargeId || '',
    });
    setEditingId(t.id); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.teacherNo.trim()) { toast.error('Name and teacher no required'); return; }
    if (!form.username.trim() || !form.password.trim()) { toast.error('Username and password required'); return; }
    if (editingId) {
      updateTeacher(editingId, { ...form });
      toast.success('Teacher updated');
    } else {
      addTeacher({ ...form, sessionId: selectedSession || form.sessionId });
      toast.success('Teacher added');
    }
    resetForm(); setShowForm(false);
  };

  if (viewingTeacher) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setViewingTeacher(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800">Teacher Profile</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{viewingTeacher.name}</p>
              <p className="text-xs text-gray-500">Teacher No: {viewingTeacher.teacherNo}</p>
            </div>
          </div>
          {([
            ['Date of Birth', viewingTeacher.dateOfBirth],
            ['Joining Date', viewingTeacher.joiningDate],
            ['Qualification', viewingTeacher.qualification],
            ['Father Name', viewingTeacher.fatherName],
            ['Mother Name', viewingTeacher.motherName],
            ['Contact', viewingTeacher.contactNumber],
            ['Email', viewingTeacher.email],
            ['Address', viewingTeacher.address],
            ['Username', viewingTeacher.username],
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Teachers</h2>
        <Button
          onClick={() => { resetForm(); setShowForm(true); }}
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 rounded-full w-9 h-9 p-0"
        >
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
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">No: {t.teacherNo}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewingTeacher(t)}>View</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEdit(t)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => { deleteTeacher(t.id); toast.success('Teacher deleted'); }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { resetForm(); setShowForm(false); } }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Session</Label>
              <select
                value={form.sessionId || selectedSession}
                onChange={(e) => setForm((f) => ({ ...f, sessionId: e.target.value }))}
                className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {([
              { label: 'Teacher Name *', key: 'name' },
              { label: 'Teacher No *', key: 'teacherNo' },
              { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
              { label: 'Joining Date', key: 'joiningDate', type: 'date' },
              { label: 'Qualification', key: 'qualification' },
              { label: 'Father Name', key: 'fatherName' },
              { label: 'Mother Name', key: 'motherName' },
              { label: 'Contact Number', key: 'contactNumber' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Address', key: 'address' },
              { label: 'Username *', key: 'username' },
              { label: 'Password *', key: 'password' },
              { label: 'Code', key: 'code' },
            ] as { label: string; key: string; type?: string }[]).map(({ label, key, type }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input
                  type={type || 'text'}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-0.5 h-8 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
