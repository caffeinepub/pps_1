import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, isSameDay } from 'date-fns';

export default function AdminEventCalendar() {
  const { sessions, events, saveEvent, deleteEvent } = useAppStore();
  const [selectedSession, setSelectedSession] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const sessionEvents = events.filter((e) => e.sessionId === selectedSession);

  const getEventForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessionEvents.find((e) => e.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    if (!selectedSession) { toast.error('Select a session first'); return; }
    setSelectedDate(date);
    const existing = getEventForDate(date);
    setDescription(existing?.description || '');
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!selectedDate || !selectedSession) return;
    if (!description.trim()) { toast.error('Enter a description'); return; }
    saveEvent({ sessionId: selectedSession, date: format(selectedDate, 'yyyy-MM-dd'), description: description.trim() });
    toast.success('Event saved');
    setShowDialog(false);
  };

  const handleDelete = () => {
    if (!selectedDate) return;
    const ev = getEventForDate(selectedDate);
    if (ev) { deleteEvent(ev.id); toast.success('Event deleted'); }
    setShowDialog(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Event Calendar</h2>

      <div className="mb-4">
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
        >
          <option value="">Select session</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {!selectedSession ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-orange-200" />
          <p className="text-sm">Select a session to view calendar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))} className="p-1 rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h3>
            <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))} className="p-1 rounded-lg hover:bg-gray-100">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}
            {days.map((day) => {
              const event = getEventForDate(day);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`h-10 flex flex-col items-center justify-center relative transition-colors hover:bg-orange-50 ${
                    today ? 'bg-orange-500 text-white rounded-full mx-1' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xs font-medium">{format(day, 'd')}</span>
                  {event && <div className="w-1 h-1 rounded-full bg-orange-400 absolute bottom-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedDate ? format(selectedDate, 'dd MMMM yyyy') : 'Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description..." className="mt-1" rows={3} />
            </div>
            <div className="flex gap-2">
              {getEventForDate(selectedDate!) && (
                <Button variant="outline" onClick={handleDelete} className="flex-1 text-red-500 border-red-200">Delete</Button>
              )}
              <Button onClick={handleSave} className="flex-1 bg-orange-500 hover:bg-orange-600">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
