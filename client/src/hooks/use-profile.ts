import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, InsertExperience, InsertEducation, UpdateProfileRequest } from "@shared/schema";

export function useProfile() {
  const { toast } = useToast();

  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      
      const data = await res.json();
      // Validate with shared schema if possible, or cast
      return api.profile.get.responses[200].parse(data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const res = await fetch(api.profile.update.path, {
        method: api.profile.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profile.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(api.upload.resume.path, {
        method: api.upload.resume.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to upload and parse resume");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.profile.get.path], data.profile);
      toast({ title: "Resume Parsed", description: "Your profile has been autofilled with AI!" });
    },
    onError: (error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useAddExperience() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertExperience, "userId">) => {
      const res = await fetch(api.experience.create.path, {
        method: api.experience.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add experience");
      return api.experience.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      toast({ title: "Added", description: "Experience added successfully" });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.experience.delete.path, { id });
      const res = await fetch(url, { method: api.experience.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete experience");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      toast({ title: "Deleted", description: "Experience removed" });
    },
  });
}

export function useAddEducation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertEducation, "userId">) => {
      const res = await fetch(api.education.create.path, {
        method: api.education.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add education");
      return api.education.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      toast({ title: "Added", description: "Education added successfully" });
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.education.delete.path, { id });
      const res = await fetch(url, { method: api.education.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete education");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      toast({ title: "Deleted", description: "Education removed" });
    },
  });
}
