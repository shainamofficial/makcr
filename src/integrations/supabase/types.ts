export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chat_message: {
        Row: {
          chat_session_id: string
          content: string
          created_at: string
          id: string
          role: string
          structured_data_extracted: Json | null
        }
        Insert: {
          chat_session_id: string
          content: string
          created_at?: string
          id?: string
          role: string
          structured_data_extracted?: Json | null
        }
        Update: {
          chat_session_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          structured_data_extracted?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_session"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_session: {
        Row: {
          created_at: string
          current_topic: string | null
          id: string
          session_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_topic?: string | null
          id?: string
          session_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_topic?: string | null
          id?: string
          session_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_session_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          created_at: string
          hq_city: string | null
          hq_country: string | null
          id: string
          industry: string | null
          linkedin_page: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          hq_city?: string | null
          hq_country?: string | null
          id?: string
          industry?: string | null
          linkedin_page?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          hq_city?: string | null
          hq_country?: string | null
          id?: string
          industry?: string | null
          linkedin_page?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      degree: {
        Row: {
          created_at: string
          degree_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      discipline: {
        Row: {
          created_at: string
          discipline_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discipline_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discipline_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree_id: string
          discipline_id: string
          end_date: string | null
          id: string
          institution_id: string
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          degree_id: string
          discipline_id: string
          end_date?: string | null
          id?: string
          institution_id: string
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          degree_id?: string
          discipline_id?: string
          end_date?: string | null
          id?: string
          institution_id?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_degree_id_fkey"
            columns: ["degree_id"]
            isOneToOne: false
            referencedRelation: "degree"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "discipline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institution"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_curricular: {
        Row: {
          created_at: string
          description: string | null
          education_id: string
          end_date: string | null
          extra_curricular_type_id: string | null
          id: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          education_id: string
          end_date?: string | null
          extra_curricular_type_id?: string | null
          id?: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          education_id?: string
          end_date?: string | null
          extra_curricular_type_id?: string | null
          id?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_curricular_education_id_fkey"
            columns: ["education_id"]
            isOneToOne: false
            referencedRelation: "education"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_curricular_extra_curricular_type_id_fkey"
            columns: ["extra_curricular_type_id"]
            isOneToOne: false
            referencedRelation: "extra_curricular_type"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_curricular_type: {
        Row: {
          created_at: string
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      institution: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          institution_name: string
          institution_type: string
          linkedin_page: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution_name: string
          institution_type: string
          linkedin_page?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution_name?: string
          institution_type?: string
          linkedin_page?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      institution_organization: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          linkedin_page: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          linkedin_page?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          linkedin_page?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_organization_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institution"
            referencedColumns: ["id"]
          },
        ]
      }
      position_of_responsibility: {
        Row: {
          created_at: string
          description: string | null
          education_id: string
          end_date: string | null
          id: string
          institution_organization_id: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          education_id: string
          end_date?: string | null
          id?: string
          institution_organization_id?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          education_id?: string
          end_date?: string | null
          id?: string
          institution_organization_id?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_of_responsibility_education_id_fkey"
            columns: ["education_id"]
            isOneToOne: false
            referencedRelation: "education"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_of_responsibility_institution_organization_id_fkey"
            columns: ["institution_organization_id"]
            isOneToOne: false
            referencedRelation: "institution_organization"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_picture: {
        Row: {
          created_at: string
          id: string
          link_to_storage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_to_storage: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_to_storage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_picture_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          created_at: string
          description: string | null
          education_id: string | null
          end_date: string | null
          id: string
          project_type_id: string | null
          project_urls: Json | null
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          education_id?: string | null
          end_date?: string | null
          id?: string
          project_type_id?: string | null
          project_urls?: Json | null
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          education_id?: string | null
          end_date?: string | null
          id?: string
          project_type_id?: string | null
          project_urls?: Json | null
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_education_id_fkey"
            columns: ["education_id"]
            isOneToOne: false
            referencedRelation: "education"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_project_type_id_fkey"
            columns: ["project_type_id"]
            isOneToOne: false
            referencedRelation: "project_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      project_type: {
        Row: {
          created_at: string
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      resume: {
        Row: {
          chat_session_id: string | null
          created_at: string
          generated_resume_link: string | null
          id: string
          include_profile_picture: boolean | null
          job_description: string
          resume_template_id: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_session_id?: string | null
          created_at?: string
          generated_resume_link?: string | null
          id?: string
          include_profile_picture?: boolean | null
          job_description: string
          resume_template_id?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_session_id?: string | null
          created_at?: string
          generated_resume_link?: string | null
          id?: string
          include_profile_picture?: boolean | null
          job_description?: string
          resume_template_id?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_resume_template_id_fkey"
            columns: ["resume_template_id"]
            isOneToOne: false
            referencedRelation: "resume_template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_template: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          preview_image_url: string | null
          template_config: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          preview_image_url?: string | null
          template_config?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          preview_image_url?: string | null
          template_config?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      skill: {
        Row: {
          category: string
          created_at: string
          id: string
          skill_name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          skill_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          skill_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          middle_name: string | null
          phone_number: string | null
          profile_picture_id: string | null
          profile_summary: string | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          phone_number?: string | null
          profile_picture_id?: string | null
          profile_summary?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          phone_number?: string | null
          profile_picture_id?: string | null
          profile_summary?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_picture_id_fkey"
            columns: ["profile_picture_id"]
            isOneToOne: false
            referencedRelation: "profile_picture"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skill_mapping: {
        Row: {
          created_at: string
          id: string
          proficiency: string
          skill_id: string
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency: string
          skill_id: string
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          proficiency?: string
          skill_id?: string
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_mapping_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skill_mapping_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      work_experience: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_full_remote: boolean | null
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_full_remote?: boolean | null
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_full_remote?: boolean | null
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      work_experience_points: {
        Row: {
          created_at: string
          details: string
          id: string
          impact: string | null
          links: Json | null
          updated_at: string
          work_experience_id: string
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          impact?: string | null
          links?: Json | null
          updated_at?: string
          work_experience_id: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          impact?: string | null
          links?: Json | null
          updated_at?: string
          work_experience_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_points_work_experience_id_fkey"
            columns: ["work_experience_id"]
            isOneToOne: false
            referencedRelation: "work_experience"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
