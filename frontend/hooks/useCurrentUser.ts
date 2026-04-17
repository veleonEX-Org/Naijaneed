import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  state_id?: string;
  lga_id?: string;
  area?: string;
  is_admin?: boolean;
  hasPassword?: boolean;
  hasBackupPin?: boolean;
}

export const useCurrentUser = () => {
  return useQuery<UserProfile | null>({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/api/auth/me').then(r => r.data),
    staleTime: 1000 * 60 * 5,  // cache for 5 minutes
    retry: false,              // don't retry if not logged in
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password?: string }) => 
      api.post('/api/auth/login', { phone, password }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPassword: string) => api.patch('/api/profile/password', { newPassword }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useRequestReset = () => {
  return useMutation({
    mutationFn: (phone: string) => api.post('/api/auth/forgot-password', { phone }).then(r => r.data),
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/api/auth/reset-password', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => api.patch('/api/profile', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};
export const useUpdateBackupPin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pin: string) => api.patch('/api/profile/pin', { pin }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useResetPasswordWithPin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/api/auth/reset-password-pin', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};
