/**
 * API Hooks using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  patientsAPI,
  studiesAPI,
  analysisAPI,
  reportsAPI,
  configAPI,
  healthCheck,
} from '@/lib/api';

// Health Check
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthCheck,
    refetchInterval: 30000, // Check every 30 seconds
  });
};

// Config
export const useConfig = () => {
  return useQuery({
    queryKey: ['config'],
    queryFn: configAPI.get,
  });
};

// Patients
export const usePatients = (params?: any) => {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientsAPI.list(params),
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsAPI.get(id),
    enabled: !!id,
  });
};

export const usePatientHistory = (id: string) => {
  return useQuery({
    queryKey: ['patient-history', id],
    queryFn: () => patientsAPI.getHistory(id),
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => patientsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

// Studies
export const useStudiesByPatient = (patientId: string) => {
  return useQuery({
    queryKey: ['studies', patientId],
    queryFn: () => studiesAPI.listByPatient(patientId),
    enabled: !!patientId,
  });
};

export const useStudy = (id: string) => {
  return useQuery({
    queryKey: ['study', id],
    queryFn: () => studiesAPI.get(id),
    enabled: !!id,
  });
};

export const useUploadStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, files }: { patientId: string; files: File[] }) =>
      studiesAPI.upload(patientId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studies'] });
    },
  });
};

// Analysis
export const useAnalysesByStudy = (studyId: string) => {
  return useQuery({
    queryKey: ['analyses', studyId],
    queryFn: () => analysisAPI.listByStudy(studyId),
    enabled: !!studyId,
  });
};

export const useAnalysis = (id: string) => {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisAPI.get(id),
    enabled: !!id,
  });
};

export const useCreateAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analysisAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
};

// Reports
export const useReportsByStudy = (studyId: string) => {
  return useQuery({
    queryKey: ['reports', studyId],
    queryFn: () => reportsAPI.listByStudy(studyId),
    enabled: !!studyId,
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsAPI.get(id),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useFinalizeReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsAPI.finalize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
