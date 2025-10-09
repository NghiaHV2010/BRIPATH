import { create } from 'zustand';
import * as cvApi from '../api/cv_api';
import type { CV } from '@/types/cv';
import type { Job } from '@/types/job';

interface CVState {
  currentCV: CV | null;
  cvs: CV[];
  isUploading: boolean;
  isLoading: boolean;
  error: string | null;
  uploadCV: (file: File) => Promise<CV>;
  fetchCVs: () => Promise<void>;
  fetchCurrentCV: () => Promise<void>;
  deleteCV: (cvId: number) => Promise<void>;
  fetchSuitableJobs: (cvId: number) => Promise<Job[]>;
  updateCV: (cv: CV) => void;
  clearError: () => void;
  
}

export const useCVStore = create<CVState>((set) => ({
  currentCV: null,
  cvs: [],
  isUploading: false,
  isLoading: false,
  error: null,

  uploadCV: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      const result = await cvApi.uploadCV<CV>(file);
      set((state) => ({
        cvs: [...state.cvs, result],
        currentCV: result,
        isUploading: false,
      }));
      return result;
    } catch (error: any) {
      set({
        isUploading: false,
        error: error.response?.data?.message || 'Failed to upload CV'
      });
      throw error;
    }
  },

  fetchCVs: async () => {
    set({ isLoading: true, error: null });
    try {
      const cvs = await cvApi.fetchCVs<CV[]>();
      set({ cvs, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch CVs'
      });
    }
  },

  fetchCurrentCV: async () => {
    set({ isLoading: true, error: null });
    try {
      const cvs = await cvApi.fetchUserCVs<CV[]>();
      const currentCV = cvs.length > 0 ? cvs[0] : null;
      set({ cvs, currentCV, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch CV'
      });
    }
  },

  deleteCV: async (cvId: number) => {
    set({ error: null });
    try {
      await cvApi.deleteUserCV(cvId);
      set((state) => ({
        cvs: state.cvs.filter((cv) => cv.id !== cvId),
        currentCV: state.currentCV?.id === cvId ? null : state.currentCV,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete CV'
      });
      throw error;
    }
  },

  fetchSuitableJobs: async (cvId: number) => {
    set({ isLoading: true, error: null });
    try {
      const jobs = await cvApi.fetchSuitableJobs<Job[]>(cvId);
      set({ isLoading: false });
      return jobs;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch suitable jobs'
      });
      throw error;
    }
  },

  updateCV: (cv: CV) => set({ currentCV: cv }),

  clearError: () => set({ error: null }),
}));
