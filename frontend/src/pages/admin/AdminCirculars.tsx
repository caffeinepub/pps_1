import { useState } from 'react';
import { useAppStore, CircularData } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Paperclip, X, ArrowLeft, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminCirculars() {
  const { circulars, sessions, addCircular, updateCircular, deleteCircular } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingCircular, setViewingCircular] = useState<CircularData | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const sessionClasses = sessions.find((s) => s.id === selectedSession)?.classes || [];

  const resetForm = () => {
    setTitle(''); setDescription(''); setSelectedSession('');
    setSelectedClasses([]); setAttachments([]); setSelectAll(false); setEditingId(null);
  };

  const openEdit = (c: CircularData) => {
    setTitle(c.title); setDescription(c.description);
    setSelectedSession(c.sessionId); setSelectedClasses(c.classIds);
    setAttachments(c.attachments); setEditingId(c.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) { toast.error('Title and description required'); return; }
    if (editingId) {
      updateCircular(editingId, { title, description, sessionId: selectedSession, classIds: selectedClasses, attachments });
      toast.success('Circular updated');
    } else {
      addCircular({ title, description, sessionId: selectedSession, classIds: selectedClasses, attachments });
      toast.success('Circular posted');
    }
    resetForm(); setShowForm(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((c) => c !== classId) : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) { setSelectedClasses([]); setSelectAll(false); }
    else { setSelectedClasses(sessionClasses.map((c) => c.id)); setSelectAll(true); }
  };

  if (viewingCircular) {
    return (
      <div className="min-h-full bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setViewingCircular(null)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">Circular</span>
        </div>
        <div className="p-6 text-black">
          <p className="text-center font-bold text-base mb-4">
            {format(new Date(viewingCircular.date), 'dd MMMM yyyy')}
          </p>
          <h2 className="text-xl font-bold mb-3 text-black">{viewingCircular.title}</h2>
          <p className="text-black leading-relaxed whitespace-pre-wrap">{viewingCircular.description}</p>
          {viewingCircular.attachments.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold text-black mb-2">Attachments:</p>
              <div className="grid grid-cols-2 gap-2">
                {viewingCircular.attachments.map((att, i) => (
                  <img key={i} src={att} alt={`Attachment ${i + 1}`} className="rounded-lg w-full object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Circulars</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-9 h-9 p-0">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {circulars.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-8 h-8 text-orange-300" />
          </div>
          <p className="font-medium">No circulars yet</p>
          <p className="text-sm">Tap + to add a new circular</p>
        </div>
      ) : (
        <div className="space-y-3">
          {circulars.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <button className="flex-1 text-left" onClick={() => setViewingCircular(c)}>
                    <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{c.description}</p>
                    <p className="text-orange-400 text-xs mt-2">{format(new Date(c.date), 'dd MMM yyyy')}</p>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-lg hover:bg-gray-100 ml-2">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500" onClick={() => { deleteCircular(c.id); toast.success('Deleted'); }}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { resetForm(); setShowForm(false); } }}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Circular' : 'New Circular'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Circular title" className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Circular description" className="mt-1" rows={4} />
            </div>
            <div>
              <Label>Session</Label>
              <select value={selectedSession} onChange={(e) => { setSelectedSession(e.target.value); setSelectedClasses([]); setSelectAll(false); }} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {selectedSession && sessionClasses.length > 0 && (
              <div>
                <Label>Classes</Label>
                <div className="mt-1 border border-gray-200 rounded-lg p-2 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="accent-orange-500" />
                    <span className="text-sm font-medium">Select All</span>
                  </label>
                  {sessionClasses.map((cls) => (
                    <label key={cls.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" checked={selectedClasses.includes(cls.id)} onChange={() => toggleClass(cls.id)} className="accent-orange-500" />
                      <span className="text-sm">{cls.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label>Attachments (Images)</Label>
              <div className="mt-1 space-y-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative">
                    <img src={att} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-orange-200 rounded-lg p-3 hover:border-orange-400 transition-colors">
                  <Paperclip className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-500">Add attachment</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">
                {editingId ? 'Update' : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
