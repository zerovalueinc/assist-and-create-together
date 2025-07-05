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
      company_analysis_reports: {
        Row: {
          company_name: string | null
          company_profile: Json | null
          company_url: string | null
          competitive_landscape: string | null
          created_at: string | null
          decision_makers: Json | null
          go_to_market_strategy: string | null
          icp_profile: Json | null
          id: string
          location: string | null
          llm_output: string | null
          market_trends: string | null
          pain_points: Json | null
          research_summary: string | null
          technologies: Json | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          company_name?: string | null
          company_profile?: Json | null
          company_url?: string | null
          competitive_landscape?: string | null
          created_at?: string | null
          decision_makers?: Json | null
          go_to_market_strategy?: string | null
          icp_profile?: Json | null
          id?: string
          location?: string | null
          llm_output?: string | null
          market_trends?: string | null
          pain_points?: Json | null
          research_summary?: string | null
          technologies?: Json | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          company_name?: string | null
          company_profile?: Json | null
          company_url?: string | null
          competitive_landscape?: string | null
          created_at?: string | null
          decision_makers?: Json | null
          go_to_market_strategy?: string | null
          icp_profile?: Json | null
          id?: string
          location?: string | null
          llm_output?: string | null
          market_trends?: string | null
          pain_points?: Json | null
          research_summary?: string | null
          technologies?: Json | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_analysis_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_analysis_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      company_analyzer_outputs_unrestricted: {
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
          workspace_id: string | null
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
          workspace_id?: string | null
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
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_analyzer_outputs_unrestricted_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_analyzer_outputs_unrestricted_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      gtm_playbooks: {
        Row: {
          company_name: string
          company_url: string | null
          created_at: string
          id: string
          icp_data: Json
          playbook_type: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          company_name: string
          company_url?: string | null
          created_at?: string
          id?: string
          icp_data: Json
          playbook_type?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          company_name?: string
          company_url?: string | null
          created_at?: string
          id?: string
          icp_data?: Json
          playbook_type?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gtm_playbooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gtm_playbooks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
      saved_reports: {
        Row: {
          company_name: string | null
          created_at: string | null
          report_id: string | null
          id: number
          url: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          report_id?: string | null
          id?: number
          url?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          report_id?: string | null
          id?: number
          url?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "company_analysis_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
      workspaces: {
        Row: {
          brand_color: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          brand_color?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          brand_color?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      company_analyzer_outputs: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          schemaVersion: number | null;
          companyname: string | null;
          company_profile: any | null;
          decision_makers: string[] | null;
          pain_points: string[] | null;
          technologies: string[] | null;
          location: string | null;
          market_trends: string[] | null;
          competitive_landscape: string[] | null;
          go_to_market_strategy: string | null;
          research_summary: string | null;
          website: string | null;
          llm_output: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          schemaVersion?: number | null;
          companyname?: string | null;
          company_profile?: any | null;
          decision_makers?: string[] | null;
          pain_points?: string[] | null;
          technologies?: string[] | null;
          location?: string | null;
          market_trends?: string[] | null;
          competitive_landscape?: string[] | null;
          go_to_market_strategy?: string | null;
          research_summary?: string | null;
          website?: string | null;
          llm_output?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          schemaVersion?: number | null;
          companyname?: string | null;
          company_profile?: any | null;
          decision_makers?: string[] | null;
          pain_points?: string[] | null;
          technologies?: string[] | null;
          location?: string | null;
          market_trends?: string[] | null;
          competitive_landscape?: string[] | null;
          go_to_market_strategy?: string | null;
          research_summary?: string | null;
          website?: string | null;
          llm_output?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_analyzer_outputs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_analyzer_outputs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          }
        ];
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
