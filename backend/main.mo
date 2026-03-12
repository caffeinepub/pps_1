import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type CircularId = Nat;
  public type SessionId = Text;
  public type ClassId = Text;
  public type StudentId = Text;
  public type TeacherId = Text;
  public type TimetableId = Nat;
  public type SubjectId = Text;
  public type FeeId = Nat;
  public type GreetingId = Nat;
  public type LessonPlanId = Nat;
  public type EventId = Nat;

  public type UserProfile = {
    name : Text;
    role : Text; // "admin", "teacher", "student"
    username : Text;
    schoolCode : Text;
  };

  public type Circular = {
    id : CircularId;
    title : Text;
    description : Text;
    attachments : [Storage.ExternalBlob];
    date : Int;
    sessionId : SessionId;
    classIds : [ClassId];
  };

  public type Session = {
    id : SessionId;
    name : Text;
    classes : [Class];
  };

  public type Class = {
    id : ClassId;
    name : Text;
    students : [StudentId];
  };

  public type Student = {
    id : StudentId;
    name : Text;
    admissionNo : Text;
    classId : ClassId;
  };

  public type Teacher = {
    id : TeacherId;
    name : Text;
    classId : ClassId;
  };

  public type Timetable = {
    id : TimetableId;
    classId : ClassId;
    entries : [TimetableEntry];
  };

  public type TimetableEntry = {
    periodName : Text;
    periodNumber : Nat;
    day : Text;
  };

  public type Fee = {
    id : FeeId;
    studentId : StudentId;
    amount : Nat;
  };

  public type Greeting = {
    id : GreetingId;
    title : Text;
    description : Text;
    attachments : [Text];
  };

  public type LessonPlan = {
    id : LessonPlanId;
    teacherId : TeacherId;
    subjectId : SubjectId;
  };

  public type Event = {
    id : EventId;
    date : Int;
    description : Text;
  };

  let circularsMap = Map.empty<CircularId, Circular>();
  var nextCircularId = 1 : CircularId;
  let sessionsMap = Map.empty<SessionId, Session>();
  let studentsMap = Map.empty<StudentId, Student>();
  let teachersMap = Map.empty<TeacherId, Teacher>();
  let timetablesMap = Map.empty<TimetableId, Timetable>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func createCircular(
    title : Text,
    description : Text,
    attachments : [Storage.ExternalBlob],
    sessionId : SessionId,
    classIds : [ClassId],
  ) : async CircularId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let circular : Circular = {
      id = nextCircularId;
      title;
      description;
      attachments;
      date = Time.now();
      sessionId;
      classIds;
    };
    circularsMap.add(nextCircularId, circular);
    let createdId = nextCircularId;
    nextCircularId += 1;
    createdId;
  };

  public shared ({ caller }) func updateCircular(
    id : CircularId,
    title : Text,
    description : Text,
    attachments : [Storage.ExternalBlob],
    sessionId : SessionId,
    classIds : [ClassId],
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (circularsMap.get(id)) {
      case null { false };
      case (?_existing) {
        let updated : Circular = {
          id;
          title;
          description;
          attachments;
          date = Time.now();
          sessionId;
          classIds;
        };
        circularsMap.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteCircular(id : CircularId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    circularsMap.remove(id);
  };

  public query ({ caller }) func getAllCirculars() : async [Circular] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view circulars");
    };
    circularsMap.values().toArray();
  };

  public shared ({ caller }) func createSession(name : Text) : async SessionId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let sessionId = name;
    let session : Session = {
      id = sessionId;
      name;
      classes = [];
    };
    sessionsMap.add(name, session);
    sessionId;
  };

  public query ({ caller }) func getAllSessions() : async [Session] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view sessions");
    };
    sessionsMap.values().toArray();
  };

  public shared ({ caller }) func addClassToSession(sessionId : SessionId, classId : ClassId, className : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (sessionsMap.get(sessionId)) {
      case null { false };
      case (?session) {
        let newClass : Class = {
          id = classId;
          name = className;
          students = [];
        };
        let updatedClasses = [newClass].concat(session.classes);
        let updatedSession : Session = {
          id = session.id;
          name = session.name;
          classes = updatedClasses;
        };
        sessionsMap.add(sessionId, updatedSession);
        true;
      };
    };
  };

  public shared ({ caller }) func createTimetable(classId : ClassId, entries : [TimetableEntry]) : async TimetableId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let timetable : Timetable = {
      id = 0;
      classId;
      entries;
    };
    timetablesMap.add(0, timetable);
    0;
  };

  public query ({ caller }) func getTimetable(classId : ClassId) : async ?Timetable {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view timetables");
    };

    let iter = timetablesMap.values();
    iter.find(func(entry) { entry.classId == classId });
  };

  public shared ({ caller }) func addStudent(id : StudentId, name : Text, admissionNo : Text, classId : ClassId) : async StudentId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let student : Student = {
      id;
      name;
      admissionNo;
      classId;
    };
    studentsMap.add(id, student);
    id;
  };

  public shared ({ caller }) func updateStudent(id : StudentId, name : Text, admissionNo : Text, classId : ClassId) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (studentsMap.get(id)) {
      case null { false };
      case (?_) {
        let updated : Student = { id; name; admissionNo; classId };
        studentsMap.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : StudentId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    studentsMap.remove(id);
  };

  public query ({ caller }) func getStudentsByClass(classId : ClassId) : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };
    studentsMap.values().toArray().filter(func(student) { student.classId == classId });
  };

  public query ({ caller }) func getStudent(id : StudentId) : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view student details");
    };
    studentsMap.get(id);
  };

  public shared ({ caller }) func addTeacher(id : TeacherId, name : Text, classId : ClassId) : async TeacherId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let teacher : Teacher = {
      id;
      name;
      classId;
    };
    teachersMap.add(id, teacher);
    id;
  };

  public shared ({ caller }) func updateTeacher(id : TeacherId, name : Text, classId : ClassId) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    switch (teachersMap.get(id)) {
      case null { false };
      case (?_) {
        let updated : Teacher = { id; name; classId };
        teachersMap.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteTeacher(id : TeacherId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    teachersMap.remove(id);
  };

  public query ({ caller }) func getAllTeachers() : async [Teacher] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view teachers");
    };
    teachersMap.values().toArray();
  };

  public query ({ caller }) func getTeacher(id : TeacherId) : async ?Teacher {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view teacher details");
    };
    teachersMap.get(id);
  };

  public shared ({ caller }) func assignUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };
};
