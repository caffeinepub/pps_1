import { useState } from 'react';
import { useAppStore, GreetingData } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminGreetings() {
  const { greetings, sessions, addGreeting, updateGreeting, deleteGreeting } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const sessionClasses = sessions.find((s) => s.id === selectedSession)?.classes || [];

  const resetForm = () => {
    setTitle(''); setDescription(''); setSelectedSession('');
    setSelectedClasses([]); setSelectAll(false); setImages([]); setEditingId(null);
  };

  const openEdit = (g: GreetingData) => {
    setTitle(g.title); setDescription(g.description);
    setSelectedSession(g.sessionId); setSelectedClasses(g.classIds);
    setImages(g.images); setEditingId(g.id); setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImages((prev) => [...prev, ev.target!.result as string]);
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

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('Title required'); return; }
    if (editingId) {
      updateGreeting(editingId, { title, description, sessionId: selectedSession, classIds: selectedClasses, images });
      toast.success('Greeting updated');
    } else {
      addGreeting({ title, description, sessionId: selectedSession, classIds: selectedClasses, images });
      toast.success('Greeting added');
    }
    resetForm(); setShowForm(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Greetings</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-9 h-9 p-0">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {greetings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Image className="w-8 h-8 text-orange-300" />
          </div>
          <p className="font-medium">No greetings yet</p>
          <p className="text-sm">Tap + to add a greeting</p>
        </div>
      ) : (
        <div className="space-y-3">
          {greetings.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{g.title}</h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{g.description}</p>
                  <p className="text-orange-400 text-xs mt-1">{format(new Date(g.date), 'dd MMM yyyy')}</p>
                  {g.images.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {g.images.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-10 h-10 rounded object-cover" />
                      ))}
                      {g.images.length > 3 && (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          +{g.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-lg hover:bg-gray-100 ml-2">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(g)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500" onClick={() => { deleteGreeting(g.id); toast.success('Deleted'); }}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { resetForm(); setShowForm(false); } }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Greeting' : 'New Greeting'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Greeting title" className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Greeting message" className="mt-1" rows={3} />
            </div>
            <div>
              <Label>Session</Label>
              <select value={selectedSession} onChange={(e) => { setSelectedSession(e.target.value); setSelectedClasses([]); setSelectAll(false); }} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
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
              <Label>Images (JPG only)</Label>
              <div className="mt-1 space-y-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <button onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-orange-200 rounded-lg p-3 hover:border-orange-400 transition-colors">
                  <Plus className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-500">Add image</span>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">
                {editingId ? 'Update' : 'Submit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
