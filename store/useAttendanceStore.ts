import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceData, Subject, SubjectDetail } from '../services/portalService';

interface AttendanceState {
  data: AttendanceData | null;
  subjectDetails: Record<string, SubjectDetail>;
  loading: boolean;
  syncing: boolean;
  syncMessage: string;
  syncProgress: { current: number; total: number } | null;
  error: string | null;
  setAttendanceData: (data: AttendanceData) => void;
  initAttendance: () => void;
  addSubject: (subject: Subject) => void;
  finaliseAttendance: () => void;
  setSubjectDetail: (id: string, detail: SubjectDetail) => void;
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setSyncMessage: (message: string) => void;
  setSyncProgress: (progress: { current: number; total: number } | null) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      data: null,
      subjectDetails: {},
      loading: false,
      syncing: false,
      syncMessage: '',
      syncProgress: null,
      error: null,
      setAttendanceData: (data) => set((state) => {
        const hasLegacyIds = data.subjects.some(s => !s.id.includes('-'));
        if (hasLegacyIds) return { data, subjectDetails: {} };
        return { data };
      }),
      initAttendance: () => set({ data: { overallPercentage: 0, subjects: [] } }),
      addSubject: (subject) => set((state) => {
        let subjects = [];
        if (state.data) {
          const exists = state.data.subjects.some(s => s.id === subject.id);
          if (exists) {
            // Update in place so UI doesn't jump
            subjects = state.data.subjects.map(s => s.id === subject.id ? subject : s);
          } else {
            subjects = [...state.data.subjects, subject];
          }
        } else {
          subjects = [subject];
        }

        const totalConducted = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
        const totalPresent = subjects.reduce((sum, s) => sum + s.present, 0);
        const overallPercentage = totalConducted > 0
          ? Math.round((totalPresent / totalConducted) * 1000) / 10
          : 0;
        return { data: { overallPercentage, subjects } };
      }),
      finaliseAttendance: () => {},  // all subjects are already in via addSubject
      setSubjectDetail: (id, detail) => set((state) => {
        const newData = state.data ? {
          ...state.data,
          subjects: state.data.subjects.map(s => 
            s.id === id ? { ...s, teacher: detail.subject.teacher } : s
          )
        } : state.data;
        
        return {
          data: newData,
          subjectDetails: { ...state.subjectDetails, [id]: detail }
        };
      }),
      setLoading: (loading) => set({ loading }),
      setSyncing: (syncing) => set({ syncing }),
      setSyncMessage: (syncMessage) => set({ syncMessage }),
      setSyncProgress: (syncProgress) => set({ syncProgress }),
      setError: (error) => set({ error }),
      clear: () => set({ data: null, subjectDetails: {}, error: null })
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
