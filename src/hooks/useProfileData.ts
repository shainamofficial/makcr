import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

/** Resolve a profile picture storage path to a signed URL */
export async function getProfilePicSignedUrl(storagePath: string): Promise<string | null> {
  // If it's already a full URL (legacy data), return as-is
  if (storagePath.startsWith("http")) return storagePath;
  const { data } = await supabase.storage
    .from("profile-pictures")
    .createSignedUrl(storagePath, 3600);
  return data?.signedUrl ?? null;
}

export function useProfileData() {
  const { user } = useAuth();
  const uid = user?.id;

  const profileQuery = useQuery({
    queryKey: ["profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user")
        .select("*, profile_picture:profile_picture_id(id, link_to_storage)")
        .eq("id", uid!)
        .single();
      if (error) throw error;

      // Resolve signed URL for profile picture
      if (data?.profile_picture?.link_to_storage) {
        const signedUrl = await getProfilePicSignedUrl(data.profile_picture.link_to_storage);
        if (signedUrl) {
          (data as any).profile_picture.link_to_storage = signedUrl;
        }
      }

      return data;
    },
    meta: { errorMessage: "Failed to load profile data. Please refresh." },
  });

  const workQuery = useQuery({
    queryKey: ["work_experience", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_experience")
        .select("*, company:company_id(id, name), work_experience_points(id, details, impact, links)")
        .eq("user_id", uid!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      // Deduplicate work_experience_points by id as a safeguard
      return (data ?? []).map(we => ({
        ...we,
        work_experience_points: we.work_experience_points
          ? [...new Map(we.work_experience_points.map((p: any) => [p.id, p])).values()]
          : [],
      }));
    },
    meta: { errorMessage: "Failed to load work experience. Please refresh." },
  });

  const educationQuery = useQuery({
    queryKey: ["education", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select(`
          *,
          institution:institution_id(id, institution_name, institution_type),
          degree:degree_id(id, degree_name),
          discipline:discipline_id(id, discipline_name),
          extra_curricular(id, title, description, start_date, end_date, extra_curricular_type:extra_curricular_type_id(id, type)),
          position_of_responsibility(id, title, description, start_date, end_date, institution_organization:institution_organization_id(id, name))
        `)
        .eq("user_id", uid!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const skillsQuery = useQuery({
    queryKey: ["skills", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skill_mapping")
        .select("*, skill:skill_id(id, skill_name, category)")
        .eq("user_id", uid!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const projectsQuery = useQuery({
    queryKey: ["projects", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project")
        .select("*, project_type:project_type_id(id, type), education:education_id(id, institution:institution_id(institution_name))")
        .eq("user_id", uid!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const allLoading = profileQuery.isLoading || workQuery.isLoading || educationQuery.isLoading || skillsQuery.isLoading || projectsQuery.isLoading;

  const isEmpty =
    !allLoading &&
    !workQuery.data?.length &&
    !educationQuery.data?.length &&
    !skillsQuery.data?.length &&
    !projectsQuery.data?.length;

  return { profileQuery, workQuery, educationQuery, skillsQuery, projectsQuery, isEmpty, allLoading };
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from("user").update(updates).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile updated" });
    },
    onError: () => toast({ title: "Failed to update profile", variant: "destructive" }),
  });
}

// Autocomplete helpers
export async function searchCompanies(q: string) {
  const { data } = await supabase.from("company").select("id, name").ilike("name", `%${q}%`).limit(10);
  return data ?? [];
}

export async function searchInstitutions(q: string) {
  const { data } = await supabase.from("institution").select("id, institution_name, institution_type").ilike("institution_name", `%${q}%`).limit(10);
  return data ?? [];
}

export async function searchSkills(q: string) {
  const { data } = await supabase.from("skill").select("id, skill_name, category").ilike("skill_name", `%${q}%`).limit(10);
  return data ?? [];
}

export async function searchDegrees(q: string) {
  const { data } = await supabase.from("degree").select("id, degree_name").ilike("degree_name", `%${q}%`).limit(10);
  return data ?? [];
}

export async function searchDisciplines(q: string) {
  const { data } = await supabase.from("discipline").select("id, discipline_name").ilike("discipline_name", `%${q}%`).limit(10);
  return data ?? [];
}
