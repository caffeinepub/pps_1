import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Class {
    id: ClassId;
    students: Array<StudentId>;
    name: string;
}
export type TimetableId = bigint;
export interface Circular {
    id: CircularId;
    title: string;
    date: bigint;
    description: string;
    sessionId: SessionId;
    attachments: Array<ExternalBlob>;
    classIds: Array<ClassId>;
}
export type SessionId = string;
export interface TimetableEntry {
    day: string;
    periodName: string;
    periodNumber: bigint;
}
export type StudentId = string;
export type TeacherId = string;
export interface Teacher {
    id: TeacherId;
    name: string;
    classId: ClassId;
}
export interface Timetable {
    id: TimetableId;
    classId: ClassId;
    entries: Array<TimetableEntry>;
}
export interface Session {
    id: SessionId;
    name: string;
    classes: Array<Class>;
}
export type CircularId = bigint;
export type ClassId = string;
export interface UserProfile {
    username: string;
    name: string;
    role: string;
    schoolCode: string;
}
export interface Student {
    id: StudentId;
    name: string;
    classId: ClassId;
    admissionNo: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClassToSession(sessionId: SessionId, classId: ClassId, className: string): Promise<boolean>;
    addStudent(id: StudentId, name: string, admissionNo: string, classId: ClassId): Promise<StudentId>;
    addTeacher(id: TeacherId, name: string, classId: ClassId): Promise<TeacherId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(user: Principal, role: UserRole): Promise<void>;
    createCircular(title: string, description: string, attachments: Array<ExternalBlob>, sessionId: SessionId, classIds: Array<ClassId>): Promise<CircularId>;
    createSession(name: string): Promise<SessionId>;
    createTimetable(classId: ClassId, entries: Array<TimetableEntry>): Promise<TimetableId>;
    deleteCircular(id: CircularId): Promise<void>;
    deleteStudent(id: StudentId): Promise<void>;
    deleteTeacher(id: TeacherId): Promise<void>;
    getAllCirculars(): Promise<Array<Circular>>;
    getAllSessions(): Promise<Array<Session>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getStudent(id: StudentId): Promise<Student | null>;
    getStudentsByClass(classId: ClassId): Promise<Array<Student>>;
    getTeacher(id: TeacherId): Promise<Teacher | null>;
    getTimetable(classId: ClassId): Promise<Timetable | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCircular(id: CircularId, title: string, description: string, attachments: Array<ExternalBlob>, sessionId: SessionId, classIds: Array<ClassId>): Promise<boolean>;
    updateStudent(id: StudentId, name: string, admissionNo: string, classId: ClassId): Promise<boolean>;
    updateTeacher(id: TeacherId, name: string, classId: ClassId): Promise<boolean>;
}
