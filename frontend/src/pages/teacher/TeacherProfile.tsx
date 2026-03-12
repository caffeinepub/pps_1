import { useAppStore } from '../../store/appStore';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, Hash } from 'lucide-react';

export default function TeacherProfile() {
  const { currentUser, teachers, sessions } = useAppStore();
  const teacher = teachers.find((t) => t.id === currentUser?.teacherId);

  if (!teacher) {
    return (
      <div className="p-4 text-center py-16 text-gray-400">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-orange-300" />
        </div>
        <p className="font-medium">Profile not found</p>
        <p className="text-sm mt-1">Contact admin to set up your profile</p>
      </div>
    );
  }

  const classIncharge = teacher.classInchargeId
    ? sessions.flatMap((s) => s.classes).find((c) => c.id === teacher.classInchargeId)
    : null;

  const sessionName = sessions.find((s) => s.id === teacher.sessionId)?.name;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">My Profile</h2>

      {/* Avatar Card */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 mb-4 text-white text-center shadow-lg">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold">{teacher.name}</h3>
        <p className="text-orange-100 text-sm mt-1">Teacher No: {teacher.teacherNo}</p>
        {classIncharge && (
          <span className="inline-block mt-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
            Class Incharge: {classIncharge.name}
          </span>
        )}
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        {sessionName && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Session</p>
              <p className="font-medium text-gray-800 text-sm">{sessionName}</p>
            </div>
          </div>
        )}

        {teacher.qualification && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Qualification</p>
              <p className="font-medium text-gray-800 text-sm">{teacher.qualification}</p>
            </div>
          </div>
        )}

        {teacher.contactNumber && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Contact</p>
              <p className="font-medium text-gray-800 text-sm">{teacher.contactNumber}</p>
            </div>
          </div>
        )}

        {teacher.email && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium text-gray-800 text-sm">{teacher.email}</p>
            </div>
          </div>
        )}

        {teacher.address && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="font-medium text-gray-800 text-sm">{teacher.address}</p>
            </div>
          </div>
        )}

        {teacher.joiningDate && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Joining Date</p>
              <p className="font-medium text-gray-800 text-sm">{teacher.joiningDate}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Hash className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Username</p>
            <p className="font-medium text-gray-800 text-sm">{teacher.username}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:underline"
        >
          caffeine.ai
        </a>{' '}
        © {new Date().getFullYear()}
      </p>
    </div>
  );
}
