import { useState } from 'react';
import { SessionData, ClassData } from '../../store/appStore';
import { ArrowLeft } from 'lucide-react';
import ClassStudents from './ClassStudents';
import ClassTimetable from './ClassTimetable';
import ClassSubjects from './ClassSubjects';
import ClassFees from './ClassFees';

type ClassTab = 'students' | 'timetable' | 'subjects' | 'teacher' | 'fees';

const tabs: { id: ClassTab; label: string }[] = [
  { id: 'students', label: 'Students' },
  { id: 'timetable', label: 'Timetable' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'teacher', label: 'Teacher' },
  { id: 'fees', label: 'Fees' },
];

interface Props {
  session: SessionData;
  classData: ClassData;
  onBack: () => void;
}

export default function ClassDetailView({ session, classData, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<ClassTab>('students');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="font-bold text-gray-800 text-sm">{classData.name}</h2>
          <p className="text-xs text-gray-400">{session.name}</p>
        </div>
      </div>

      {/* Top Tab Bar */}
      <div className="bg-white border-b border-gray-100 flex overflow-x-auto scrollbar-hide flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'students' && <ClassStudents session={session} classData={classData} />}
        {activeTab === 'timetable' && <ClassTimetable classData={classData} />}
        {activeTab === 'subjects' && <ClassSubjects session={session} classData={classData} />}
        {activeTab === 'teacher' && (
          <div className="p-4">
            <ClassSubjects session={session} classData={classData} teacherView />
          </div>
        )}
        {activeTab === 'fees' && <ClassFees session={session} classData={classData} />}
      </div>
    </div>
  );
}
