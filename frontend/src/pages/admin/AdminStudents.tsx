import { useState } from 'react';
import { useAppStore, StudentData } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = () => ({
  name: '', admissionNo: '', aadhaarNo: '', dateOfBirth: '', dateOfJoining: '',
  address: '', fatherName: '', motherName: '', fatherMobile: '', motherMobile: '',
  fatherOccupation: '', motherOccupation: '', guardianInfo: '', username: '', password: '', code: 'palakpublicschool',
  classId: '', sessionId: '',
});

export default function AdminStudents() {
  const { students, sessions, addStudent, updateStudent, deleteStudent, passStudent } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentData | null>(null);
  const [showPass, setShowPass] = useState<StudentData | null>(null);
  const [passSession, setPassSession] = useState('');
  const [passClass, setPassClass] = useState('');
  const [form, setForm] = useState(emptyForm());

  const sessionData = sessions.find((s) => s.id === selectedSession);
  const sessionStudents = students
    .filter((s) => s.sessionId === selectedSession)
    .sort((a, b) => a.name.localeCompare(b.name));

  const passSessionClasses = sessions.find((s) => s.id === passSession)?.classes || [];

  const resetForm = () => { setForm(emptyForm()); setEditingId(null); };

  const openEdit = (s: StudentData) => {
    setForm({
      name: s.name, admissionNo: s.admissionNo, aadhaarNo: s.aadhaarNo || '',
      dateOfBirth: s.dateOfBirth || '', dateOfJoining: s.dateOfJoining || '',
      address: s.address || '', fatherName: s.fatherName || '', motherName: s.motherName || '',
      fatherMobile: s.fatherMobile || '', motherMobile: s.motherMobile || '',
      fatherOccupation: s.fatherOccupation || '', motherOccupation: s.motherOccupation || '',
      guardianInfo: s.guardianInfo || '', username: s.username, password: s.password, code: s.code,
      classId: s.classId, sessionId: s.sessionId,
    });
    setEditingId(s.id); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.admissionNo.trim()) { toast.error('Name and admission no required'); return; }
    if (!form.classId) { toast.error('Select a class'); return; }
    if (editingId) {
      updateStudent(editingId, { ...form });
      toast.success('Student updated');
    } else {
      addStudent({ ...form, sessionId: selectedSession });
      toast.success('Student added');
    }
    resetForm(); setShowForm(false);
  };

  const handlePass = () => {
    if (!showPass || !passSession || !passClass) { toast.error('Select session and class'); return; }
    passStudent(showPass.id, passSession, passClass);
    toast.success('Student transferred');
    setShowPass(null);
  };

  if (viewingStudent) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setViewingStudent(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800">Student Profile</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{viewingStudent.name}</p>
              <p className="text-xs text-gray-500">Adm. No: {viewingStudent.admissionNo}</p>
            </div>
          </div>
          {[
            ['Class', sessions.flatMap((s) => s.classes).find((c) => c.id === viewingStudent.classId)?.name],
            ['Session', sessions.find((s) => s.id === viewingStudent.sessionId)?.name],
            ['Aadhaar No', viewingStudent.aadhaarNo],
            ['Date of Birth', viewingStudent.dateOfBirth],
            ['Date of Joining', viewingStudent.dateOfJoining],
            ['Address', viewingStudent.address],
            ['Father Name', viewingStudent.fatherName],
            ['Mother Name', viewingStudent.motherName],
            ['Father Mobile', viewingStudent.fatherMobile],
            ['Mother Mobile', viewingStudent.motherMobile],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label as string} className="flex justify-between text-sm border-b border-gray-50 pb-2">
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
        <h2 className="text-lg font-bold text-gray-800">Students</h2>
        {selectedSession && (
          <Button onClick={() => { resetForm(); setForm((f) => ({ ...f, sessionId: selectedSession })); setShowForm(true); }} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-9 h-9 p-0">
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="mb-4">
        <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400">
          <option value="">Select session</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {!selectedSession ? (
        <div className="text-center py-12 text-gray-400 text-sm">Select a session to view students</div>
      ) : sessionStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No students in this session</div>
      ) : (
        <div className="space-y-2">
          {sessionData?.classes.map((cls) => {
            const clsStudents = sessionStudents.filter((s) => s.classId === cls.id);
            if (clsStudents.length === 0) return null;
            return (
              <div key={cls.id}>
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1 mt-3">{cls.name}</p>
                {clsStudents.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">Adm. {s.admissionNo}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-lg hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingStudent(s)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(s)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setShowPass(s); setPassSession(''); setPassClass(''); }}>Pass</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => { deleteStudent(s.id); toast.success('Deleted'); }}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { resetForm(); setShowForm(false); } }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Student' : 'Add Student'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Class *</Label>
              <select value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select class</option>
                {sessionData?.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {[
              { label: 'Name *', key: 'name' }, { label: 'Admission No *', key: 'admissionNo' },
              { label: 'Aadhaar No', key: 'aadhaarNo' }, { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
              { label: 'Date of Joining', key: 'dateOfJoining', type: 'date' }, { label: 'Address', key: 'address' },
              { label: 'Father Name', key: 'fatherName' }, { label: 'Mother Name', key: 'motherName' },
              { label: 'Father Mobile', key: 'fatherMobile' }, { label: 'Mother Mobile', key: 'motherMobile' },
              { label: 'Father Occupation', key: 'fatherOccupation' }, { label: 'Mother Occupation', key: 'motherOccupation' },
              { label: 'Guardian Info', key: 'guardianInfo' }, { label: 'Username', key: 'username' },
              { label: 'Password', key: 'password' }, { label: 'Code', key: 'code' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input type={type || 'text'} value={(form as Record<string, string>)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="mt-0.5 h-8 text-sm" />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pass Dialog */}
      <Dialog open={!!showPass} onOpenChange={(o) => { if (!o) setShowPass(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Transfer Student</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Select Session</Label>
              <select value={passSession} onChange={(e) => { setPassSession(e.target.value); setPassClass(''); }} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {passSession && (
              <div>
                <Label>Select Class</Label>
                <select value={passClass} onChange={(e) => setPassClass(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select class</option>
                  {passSessionClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPass(null)} className="flex-1">Cancel</Button>
              <Button onClick={handlePass} className="flex-1 bg-orange-500 hover:bg-orange-600">Transfer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
