import { useState } from 'react';
import { useAppStore, ClassData, TimetableEntry } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props { classData: ClassData; }

export default function ClassTimetable({ classData }: Props) {
  const { classTimetables, saveClassTimetable } = useAppStore();
  const existing = classTimetables.find((t) => t.classId === classData.id);
  const [entries, setEntries] = useState<TimetableEntry[]>(existing?.entries || []);
  const [filterDay, setFilterDay] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [periodName, setPeriodName] = useState('');
  const [periodNumber, setPeriodNumber] = useState('');
  const [day, setDay] = useState('Monday');

  const addEntry = () => {
    if (!periodNumber) { toast.error('Period number required'); return; }
    const entry: TimetableEntry = {
      id: `tt_${Date.now()}`,
      periodName: periodName.trim() || 'Free Period',
      periodNumber: parseInt(periodNumber),
      day,
    };
    setEntries((prev) => [...prev, entry]);
    setPeriodName(''); setPeriodNumber('');
    setShowForm(false);
  };

  const handleSave = () => {
    saveClassTimetable(classData.id, entries);
    toast.success('Timetable saved');
  };

  const filtered = filterDay === 'All' ? entries : entries.filter((e) => e.day === filterDay);
  const sorted = [...filtered].sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">Class Timetable</span>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-8 h-8 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showForm && (
        <div className="bg-orange-50 rounded-xl p-4 mb-4 space-y-3 border border-orange-100">
          <div>
            <Label className="text-xs">Period Name (optional)</Label>
            <Input value={periodName} onChange={(e) => setPeriodName(e.target.value)} placeholder="Leave blank for Free Period" className="mt-0.5 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Period Number *</Label>
            <Input type="number" value={periodNumber} onChange={(e) => setPeriodNumber(e.target.value)} placeholder="1, 2, 3..." className="mt-0.5 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Day</Label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button size="sm" onClick={addEntry} className="flex-1 bg-orange-500 hover:bg-orange-600">Add Period</Button>
          </div>
        </div>
      )}

      {/* Day Filter */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
        {['All', ...DAYS].map((d) => (
          <button
            key={d}
            onClick={() => setFilterDay(d)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterDay === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d === 'All' ? 'All' : d.slice(0, 3)}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No periods added yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50">
                <th className="text-left p-2 text-xs text-gray-500 font-medium">Period</th>
                <th className="text-left p-2 text-xs text-gray-500 font-medium">Name</th>
                <th className="text-left p-2 text-xs text-gray-500 font-medium">Day</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.id} className="border-b border-gray-50">
                  <td className="p-2 font-medium text-gray-700">{e.periodNumber}</td>
                  <td className={`p-2 font-bold text-base ${e.periodName === 'Free Period' ? 'text-green-500' : 'text-gray-800'}`}>
                    {e.periodName}
                  </td>
                  <td className="p-2 text-gray-500 text-xs">{e.day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 px-8">
            <Save className="w-4 h-4 mr-2" /> Save Timetable
          </Button>
        </div>
      )}
    </div>
  );
}
