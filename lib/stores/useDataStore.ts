// lib/stores/useDataStore.ts
import { create } from 'zustand';
import axios from 'axios';

type Project = { id: number; name: string; description: string };
type GeoPoint = { id: string; lat: number; lon: number; reviewState?: string };
type SubmissionCounts = {
  id: string;
  total: number;
  edited: number;
  rejected: number;
  approved: number;
}


type DataState = {
  projects: Project[];
  geoPoints: GeoPoint[];
  submissionCounts: SubmissionCounts; // Keyed by formId
  fetchProjects: () => Promise<void>;
  fetchGeoPoints: (projectId: number, datasetId: string) => Promise<void>;
  fetchSubmissionCounts: (projectId: number, formId: string) => Promise<void>;
};

export const useDataStore = create<DataState>((set, get) => {
  const cache: { projects?: Project[] } = {};

  return {
    projects: [],
    geoPoints: [],
    submissionCounts: {id:'',total:0,edited:0,rejected:0,approved:0},
    fetchProjects: async () => {
      if (cache.projects) {
        set({ projects: cache.projects });
        return;
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('odk-token') : null;
      if (!token) {
        console.error('No token found in localStorage');
        set({ projects: [] });
        return;
      }
      try {
        const response = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
          params: {}, // Limit to 10 projects
        });
        console.log('Projects fetched:', response.data.length, response.data.map((p: Project) => ({ id: p.id, name: p.name })));
        cache.projects = response.data;
        set({ projects: response.data });
      } catch (err: any) {
        console.error('Error fetching projects:', {
          message: err.message || 'Unknown error',
          status: err.response?.status,
          data: err.response?.data,
          code: err.code,
          config: err.config ? { url: err.config.url, headers: err.config.headers } : null,
        });
        set({ projects: [] });
      }
    },
    fetchGeoPoints: async (projectId, datasetId) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('odk-token') : null;
      if (!token) {
        console.error('No token found in localStorage');
        set({ geoPoints: [] });
        return;
      }
      try {
        const response = await axios.get(`/api/projects/${projectId}/datasets/${datasetId}/entities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('GeoPoints fetched:', response.data.length);
        set({ geoPoints: response.data}); // Limit to 100 geoPoints
      } catch (err: any) {
        console.error('Error fetching dataset entities:', {
          message: err.message || 'Unknown error',
          status: err.response?.status,
          data: err.response?.data,
          code: err.code,
          config: err.config ? { url: err.config.url, headers: err.config.headers } : null,
        });
        set({ geoPoints: [] });
      }
    },
    fetchSubmissionCounts: async (projectId, formId) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('odk-token') : null;
      if (!token) {
        console.error('No token found in localStorage');
        set({ submissionCounts: { ...get().submissionCounts, [formId]: { id:'', total: 0, edited: 0, rejected: 0, approved: 0 } } });
        return;
      }
      try {
        const response = await axios.get(`/api/projects/${projectId}/forms/${formId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { $top: 1000 }, // Limit to avoid large responses; adjust as needed
        });
        const submissions = response.data;
        const counts = {
          id:formId,
          total: submissions.length,
          edited: submissions.filter((s: any) => s.reviewState === 'edited').length,
          rejected: submissions.filter((s: any) => s.reviewState === 'rejected').length,
          approved: submissions.filter((s: any) => s.reviewState === 'approved').length,
        };
        console.log(`Submission counts for form ${formId}:`, counts);
        set({
          //submissionCounts: { ...get().submissionCounts, [formId]: counts },
          submissionCounts: counts,
        });
      } catch (err: any) {
        console.error('Error fetching submission counts:', {
          message: err.message || 'Unknown error',
          status: err.response?.status,
          data: err.response?.data,
          code: err.code,
          config: err.config ? { url: err.config.url, headers: err.config.headers } : null,
        });
        set({ submissionCounts: { ...get().submissionCounts, [formId]: { id:'', total: 0, edited: 0, rejected: 0, approved: 0 } } });
      }
    },
  };
});
