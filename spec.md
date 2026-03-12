# Specification

## Summary
**Goal:** Build the full PPS School ERP initial version with an Admin portal, Teacher portal, and shared backend — covering login, all admin modules (Circulars, Sessions, Students, Teachers, Timetables, Subjects, Fees, Greetings, Lesson Plans, Event Calendar, Academics, Leave, Progress, Salary, Attendance), and all teacher modules (Home, Communication, My Class, My Timetable, Leave, Salary, Progress, Homework, Lesson Plan, My Academics, Event Calendar, Greetings) — with a consistent orange theme and a Motoko backend for all data.

**Planned changes:**

### Authentication
- Login screen with role selector (Admin / Teacher), username, password, and school code fields
- School code hardcoded as `palakpublicschool`; wrong code blocks login
- Admin default credentials (username = admin name, password = name + "123")
- Teacher credentials set by admin; routes each role to its own dashboard on success

### Admin Dashboard & Navigation
- Bottom navigation bar: Home (Circulars), Session, Students, Teachers, Teacher Timetable, Academics, Lesson Plan, Event Calendar, Greetings, Leave
- Sub-module navigation inside Session > Class uses a top horizontal tab bar: Class Students, Class Timetable, Class Subject, Class Teacher, Fees

### Circulars Module (Admin)
- List view with title and 2-line preview; full view shows bold centered date, title, description, attachments in black text
- Create form: title, description, session dropdown, class multi-select (Select All or specific), optional multiple JPG image attachments
- Three-dots menu per circular: Edit (pre-filled) and Delete

### Sessions Module (Admin)
- Create sessions by name; list in history
- Add classes by name within a session
- Tap class → top tab bar: Class Students, Class Timetable, Class Subject, Class Teacher, Fees
- Session visibility settings: separately control which sessions are visible to students vs. teachers; Student Entry Session setting

### Class Students
- Add Student form: name, admission no, Aadhaar no, DOB, date of joining, address, class (auto-set), father/mother name, father/mother mobile, father/mother occupation, guardian info (optional), username, password, code
- List alphabetical by first name with admission no
- Three-dots per student: Edit, View (read-only), Pass (transfer to another session/class with credentials intact), Delete

### Class Timetable
- Create timetable with periods: period name (optional → "Free Period" in green), period number, day (Mon–Sat)
- Tabular list with bold large period names; day-filter dropdown in history; Save button persists full timetable

### Class Subject
- Create subject with name and teacher assignment (from session's teachers)
- Alphabetical tabular list; subject name bold, assigned teacher below
- All subject pickers across the app for a class draw from this list (no free-text)

### Class Teacher
- Assign a teacher as class incharge for the class

### Fees Module (under Session > Class)
- Three tabs: Total, Approved, Pending
- Total: alphabetical student list → 12-month table → per-month entry: Approved Amount, Pending Amount, Total Amount; Update button for re-editing
- Approved/Pending tabs: select month → alphabetical table with name, adm. no, and respective amount
- Auto-accrue ₹30 late fee every 5 days when pending > ₹2000

### Students Module (Admin top-level)
- Session selector; class-wise alphabetical student list
- Add Student button (same full form); three-dots: Edit, View, Pass, Delete

### Teachers Module (Admin top-level)
- Session selector; teacher list sorted by teacher number
- Add Teacher form: name, DOB, joining date, qualification, father/mother name, contact number, teacher no, email, address, username, password, code
- Three-dots: View, Edit, Delete

### Teacher Timetable Module (Admin top-level)
- Add timetable: teacher dropdown, day, period no, period name (optional = Free Period in green), class (optional)
- Next adds another period; Done & Save stores to history by teacher name
- Tap teacher → select day → tabular timetable; three-dots: Edit, Delete

### Greetings Module (Admin)
- Add greeting: title, description, session, class selector, multiple JPG attachments
- History with three-dots: Edit (pre-filled), Delete

### Lesson Plan Module (Admin)
- View lesson plans submitted by teachers (teacher name, session, class, subject, topic, start/end date)
- Admin can save to history

### Event Calendar Module (Admin)
- Session selector → monthly calendar view
- Tap date → description input → save event; events displayed on calendar
- Teachers can view events (read-only)

### Academics Module (Admin)
- Sub-sections: Progress, Leave, Subject, Teacher Academics, Salary, Attendance

### Progress (Admin > Academics)
- Session → class → add progress title → New Progress entry: total marks, student multi-select, subject select
- Save & Next for more subjects; Done & Send dispatches to subject teacher
- Completed subjects show √ in history; Approve sends results to students
- Subject order preserved throughout

### Leave (Admin > Academics)
- Session selector; teacher list with leave-highlighted teachers
- Tap teacher → view leave details (name, teacher no, class incharge, leave days, date, reason)
- Approve / Reject buttons send decision back to teacher

### Subject (Admin > Academics)
- Session → class → add subject by name; saved to class-specific list used by all pickers

### Teacher Academics (Admin > Academics)
- Session → teacher list sorted by teacher no
- Top tabs: Class Incharge, Timetable, Classes & Subjects, Attendance, Salary, Teacher Detail
- Class Incharge: assign/edit/delete
- Attendance: calendar with present/absent/half-day/leave/holiday (no mark = present); monthly history with Edit
- Salary: per-day amount set by admin; auto-calculate total, deducted (absent + holidays), final salary; monthly history
- Classes & Subjects: tabular list (class + subject); Teacher Detail: read-only profile

### Teacher Dashboard & Navigation
- Session selector on login (admin-allowed sessions only)
- Bottom navigation: Home, Communication, Profile, Menu
- Home: today's circulars for teacher's classes; bold date/month/day at top center; tap → full black-text view
- Communication: session pre-selected, class selector, student search, chat with text + multi-type attachments (image/audio/video/file)
- Profile: read-only teacher profile
- Menu: My Class, My Timetable, Leave, Salary, Progress, Homework, Lesson Plan, Event Calendar, Greetings, My Academics

### Teacher > My Class
- Top tabs (class teachers only): Class Incharge, Class Students, Class Timetable, Attendance, Leave, Subjects
- Class Students: alphabetical; tap → full profile
- Class Timetable: day select → tabular view
- Attendance: per-student calendar marking; monthly history with Edit/Delete
- Leave: per-student date/days/reason; Approve or Reject
- Subjects: alphabetical list with teacher names

### Teacher > My Timetable
- Day selector → tabular timetable (period no, bold period name, class, subject)

### Teacher > Leave
- Two tabs: My Leave and Other Leave
- My Leave: Add Leave form (day, date, reason, class selector); submit to admin; history shows Approved/Rejected
- Other Leave: read-only list of all teachers' leave records

### Teacher > Salary
- Month selector; shows Total Amount, Deducted Amount, Approved Amount from admin data

### Teacher > Progress
- Assigned classes list → progress titles → alphabetical student list with teacher's subject → enter obtained marks per student → submit to admin

### Teacher > Homework
- Add Homework: session, class, title, description, multiple image/video attachments; saved to history

### Teacher > Lesson Plan
- Form: session, class, subject dropdown, topic, start date, end date; Send & Save to admin and teacher history

### Teacher > My Academics
- Top tabs: Class Incharge, Classes to Teach, My Attendance
- Classes to Teach: tabular (class + subject)
- My Attendance: read-only personal attendance history

### Backend (Motoko)
- Single main actor with stable types and CRUD for all entities: Sessions, Classes, Students, Teachers, Circulars, Timetables, Subjects, Fees, Greetings, LessonPlans, EventCalendar, Progress, Leave, Attendance, Salary, Homework, Communication/Messages
- Student and teacher records store username, password, code
- Session records store per-role visibility flags
- Fees include late-fee accrual logic (₹30 per 5 days when pending > ₹2000)
- Salary auto-calculated from attendance (present days × per_day_rate)

### UI Theme
- Consistent orange accent color (#F97316 or similar) throughout
- Active nav indicators, primary buttons, and key elements in orange
- Circular full-view and all content text rendered in black on white/light background
- Mobile-first layout with clean typographic hierarchy

**User-visible outcome:** Admin can log in and fully manage sessions, classes, students, teachers, timetables, subjects, fees, circulars, greetings, lesson plans, event calendar, progress sheets, leave approvals, attendance, and salary. Teachers can log in and access their personal dashboard covering home circulars, communication with students, class management, timetable, leave, salary, progress marks entry, homework, lesson plans, and academics — all within a unified orange-themed mobile-first interface backed by a Motoko canister.
