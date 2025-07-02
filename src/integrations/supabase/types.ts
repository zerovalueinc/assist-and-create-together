export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      company_analyzer_outputs: {
        Row: {
          company_name: string | null
          company_size: string | null
          competitive_landscape: Json | null
          created_at: string | null
          decision_makers: Json | null
          go_to_market_strategy: string | null
          id: string
          industry: string | null
          location: string | null
          market_trends: Json | null
          pain_points: Json | null
          research_summary: string | null
          revenue_range: string | null
          technologies: Json | null
          user_id: string
          website: string | null
        }
        Insert: {
          company_name?: string | null
          company_size?: string | null
          competitive_landscape?: Json | null
          created_at?: string | null
          decision_makers?: Json | null
          go_to_market_strategy?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          market_trends?: Json | null
          pain_points?: Json | null
          research_summary?: string | null
          revenue_range?: string | null
          technologies?: Json | null
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string | null
          company_size?: string | null
          competitive_landscape?: Json | null
          created_at?: string | null
          decision_makers?: Json | null
          go_to_market_strategy?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          market_trends?: Json | null
          pain_points?: Json | null
          research_summary?: string | null
          revenue_range?: string | null
          technologies?: Json | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_analyzer_outputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      icps: {
        Row: {
          company_size: string | null
          created_at: string | null
          funding: string | null
          id: number
          industries: string | null
          industry: string | null
          job_titles: string | null
          location_country: string | null
          pain_points: string | null
          persona: string | null
          technologies: string | null
          user_id: number
          valid_use_case: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string | null
          funding?: string | null
          id?: number
          industries?: string | null
          industry?: string | null
          job_titles?: string | null
          location_country?: string | null
          pain_points?: string | null
          persona?: string | null
          technologies?: string | null
          user_id: number
          valid_use_case?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string | null
          funding?: string | null
          id?: number
          industries?: string | null
          industry?: string | null
          job_titles?: string | null
          location_country?: string | null
          pain_points?: string | null
          persona?: string | null
          technologies?: string | null
          user_id?: number
          valid_use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "icps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_results: {
        Row: {
          created_at: string
          id: string
          pipeline_id: string
          results_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pipeline_id: string
          results_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pipeline_id?: string
          results_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_results_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipeline_states"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_states: {
        Row: {
          companies_processed: number
          config: Json | null
          contacts_found: number
          created_at: string
          current_phase: string
          emails_generated: number
          error: string | null
          id: string
          progress: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          companies_processed?: number
          config?: Json | null
          contacts_found?: number
          created_at?: string
          current_phase: string
          emails_generated?: number
          error?: string | null
          id?: string
          progress?: number
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          companies_processed?: number
          config?: Json | null
          contacts_found?: number
          created_at?: string
          current_phase?: string
          emails_generated?: number
          error?: string | null
          id?: string
          progress?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_reports: {
        Row: {
          company_name: string | null
          created_at: string | null
          icp_id: number | null
          id: number
          url: string | null
          user_id: number
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          icp_id?: number | null
          id?: number
          url?: string | null
          user_id: number
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          icp_id?: number | null
          id?: number
          url?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_icp_id_fkey"
            columns: ["icp_id"]
            isOneToOne: false
            referencedRelation: "icps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          email_verification_expires: string | null
          email_verification_token: string | null
          email_verified: boolean | null
          failed_login_attempts: number | null
          first_name: string | null
          id: number
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          password_hash: string
          password_reset_expires: string | null
          password_reset_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          email_verification_expires?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: number
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          password_hash: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          email_verification_expires?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: number
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          password_hash?: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
