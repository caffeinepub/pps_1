import { useState, useEffect } from 'react';
import { useAppStore, SessionData, ClassData, FeeEntry } from '../../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props { session: SessionData; classData: ClassData; }

type FeeView = 'list' | 'student-months' | 'month-entry';

export default function ClassFees({ session, classData }: Props) {
  const { students, fees, saveFeeEntry } = useAppStore();
  const [activeTab, setActiveTab] = useState<'total' | 'approved' | 'pending'>('total');
  const [view, setView] = useState<FeeView>('list');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState('January');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [pendingAmount, setPendingAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const classStudents = students
    .filter((s) => s.classId === classData.id && s.sessionId === session.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const getFee = (studentId: string, month: string) =>
    fees.find((f) => f.studentId === studentId && f.month === month);

  // Late fee accrual
  useEffect(() => {
    const now = new Date();
    fees.forEach((fee) => {
      if (fee.pendingAmount > 2000) {
        const lastUpdated = new Date(fee.lastUpdated);
        const daysDiff = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
        const periods = Math.floor(daysDiff / 5);
        if (periods > 0) {
          const lateFee = periods * 30;
          saveFeeEntry({ ...fee, pendingAmount: fee.pendingAmount + lateFee, lastUpdated: now.toISOString() });
        }
      }
    });
  }, []);

  const openMonthEntry = (studentId: string, month: string) => {
    const existing = getFee(studentId, month);
    setApprovedAmount(existing?.approvedAmount.toString() || '');
    setPendingAmount(existing?.pendingAmount.toString() || '');
    setTotalAmount(existing?.totalAmount.toString() || '');
    setSelectedStudent(studentId);
    setSelectedMonth(month);
    setView('month-entry');
  };

  const handleSaveFee = () => {
    if (!selectedStudent || !selectedMonth) return;
    saveFeeEntry({
      studentId: selectedStudent,
      month: selectedMonth,
      approvedAmount: parseFloat(approvedAmount) || 0,
      pendingAmount: parseFloat(pendingAmount) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      lastUpdated: new Date().toISOString(),
    });
    toast.success('Fee saved');
    setView('student-months');
  };

  if (view === 'month-entry' && selectedStudent && selectedMonth) {
    const student = classStudents.find((s) => s.id === selectedStudent);
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setView('student-months')} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{student?.name}</h3>
            <p className="text-xs text-gray-400">{selectedMonth}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Approved Amount (₹)</Label>
            <Input type="number" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} placeholder="0" className="mt-1" />
          </div>
          <div>
            <Label>Pending Amount (₹)</Label>
            <Input type="number" value={pendingAmount} onChange={(e) => setPendingAmount(e.target.value)} placeholder="0" className="mt-1" />
          </div>
          <div>
            <Label>Total Amount (₹)</Label>
            <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0" className="mt-1" />
          </div>
          <Button onClick={handleSaveFee} className="w-full bg-orange-500 hover:bg-orange-600">Save</Button>
        </div>
      </div>
    );
  }

  if (view === 'student-months' && selectedStudent) {
    const student = classStudents.find((s) => s.id === selectedStudent);
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setView('list')} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-800">{student?.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MONTHS.map((month) => {
            const fee = getFee(selectedStudent, month);
            return (
              <button
                key={month}
                onClick={() => openMonthEntry(selectedStudent, month)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-left hover:border-orange-200 transition-colors"
              >
                <p className="font-medium text-gray-800 text-sm">{month}</p>
                {fee ? (
                  <p className="text-xs text-green-500 mt-0.5">₹{fee.totalAmount}</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">Not set</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-orange-200 mb-4">
        {(['total', 'approved', 'pending'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'total' && (
        <div className="space-y-2">
          {classStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedStudent(s.id); setView('student-months'); }}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between hover:border-orange-200 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                <p className="text-xs text-gray-400">Adm. {s.admissionNo}</p>
              </div>
              <span className="text-xs text-orange-500">View →</span>
            </button>
          ))}
        </div>
      )}

      {(activeTab === 'approved' || activeTab === 'pending') && (
        <div>
          <div className="mb-3">
            <Label className="text-xs">Select Month</Label>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50">
                  <th className="text-left p-2 text-xs text-gray-500 font-medium">Student</th>
                  <th className="text-left p-2 text-xs text-gray-500 font-medium">Adm. No</th>
                  <th className="text-right p-2 text-xs text-gray-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s) => {
                  const fee = getFee(s.id, filterMonth);
                  const amount = activeTab === 'approved' ? fee?.approvedAmount : fee?.pendingAmount;
                  if (!fee) return null;
                  return (
                    <tr key={s.id} className="border-b border-gray-50">
                      <td className="p-2 font-medium text-gray-800">{s.name}</td>
                      <td className="p-2 text-gray-500 text-xs">{s.admissionNo}</td>
                      <td className="p-2 text-right font-medium text-gray-800">₹{amount || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
