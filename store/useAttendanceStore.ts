import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceData, SubjectDetail } from '../services/portalService';

interface AttendanceState {
  data: AttendanceData | null;
  subjectDetails: Record<string, SubjectDetail>;
  loading: boolean;
  error: string | null;
  setAttendanceData: (data: AttendanceData) => void;
  setSubjectDetail: (id: string, detail: SubjectDetail) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      data: null,
      subjectDetails: {},
      loading: false,
      error: null,
      setAttendanceData: (data) => set({ data }),
      setSubjectDetail: (id, detail) => set((state) => ({
        subjectDetails: { ...state.subjectDetails, [id]: detail }
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clear: () => set({ data: null, subjectDetails: {}, error: null })
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
