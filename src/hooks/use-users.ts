import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { del, fetcher, post, put } from '@/lib/axios'

// Types
export interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  role: string
}

export type UpdateUserDto = Partial<CreateUserDto>

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}

// Hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => fetcher<User[]>('/users'),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetcher<User>(`/users/${id}`),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserDto) => post<User>('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      put<User>(`/users/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => del<void>(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
