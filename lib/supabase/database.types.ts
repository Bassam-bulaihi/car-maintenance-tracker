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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      inbound_message_events: {
        Row: {
          message_sid: string
          received_at: string
        }
        Insert: {
          message_sid: string
          received_at?: string
        }
        Update: {
          message_sid?: string
          received_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          delivery_status: Database["public"]["Enums"]["notification_delivery_status"]
          id: string
          message_type: Database["public"]["Enums"]["notification_message_type"]
          provider_message_sid: string | null
          responded_at: string | null
          response: Database["public"]["Enums"]["notification_response"] | null
          response_text: string | null
          sent_at: string | null
          service_item_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          delivery_status?: Database["public"]["Enums"]["notification_delivery_status"]
          id?: string
          message_type: Database["public"]["Enums"]["notification_message_type"]
          provider_message_sid?: string | null
          responded_at?: string | null
          response?: Database["public"]["Enums"]["notification_response"] | null
          response_text?: string | null
          sent_at?: string | null
          service_item_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          delivery_status?: Database["public"]["Enums"]["notification_delivery_status"]
          id?: string
          message_type?: Database["public"]["Enums"]["notification_message_type"]
          provider_message_sid?: string | null
          responded_at?: string | null
          response?: Database["public"]["Enums"]["notification_response"] | null
          response_text?: string | null
          sent_at?: string | null
          service_item_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "vehicle_service_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      odometer_readings: {
        Row: {
          id: string
          reading_km: number
          recorded_at: string
          source: Database["public"]["Enums"]["odometer_source"]
          vehicle_id: string
        }
        Insert: {
          id?: string
          reading_km: number
          recorded_at?: string
          source: Database["public"]["Enums"]["odometer_source"]
          vehicle_id: string
        }
        Update: {
          id?: string
          reading_km?: number
          recorded_at?: string
          source?: Database["public"]["Enums"]["odometer_source"]
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "odometer_readings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      preset_recommended_parts: {
        Row: {
          created_at: string
          id: string
          part_name: string
          preset_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          part_name: string
          preset_id: string
        }
        Update: {
          created_at?: string
          id?: string
          part_name?: string
          preset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preset_recommended_parts_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "vehicle_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      preset_service_items: {
        Row: {
          created_at: string
          id: string
          interval_km: number | null
          interval_months: number | null
          preset_id: string
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          preset_id: string
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          created_at?: string
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          preset_id?: string
          service_type?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: [
          {
            foreignKeyName: "preset_service_items_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "vehicle_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_history: {
        Row: {
          confirmed_at: string
          id: string
          odometer_at_service: number
          service_type: Database["public"]["Enums"]["service_type"]
          vehicle_id: string
        }
        Insert: {
          confirmed_at?: string
          id?: string
          odometer_at_service: number
          service_type: Database["public"]["Enums"]["service_type"]
          vehicle_id: string
        }
        Update: {
          confirmed_at?: string
          id?: string
          odometer_at_service?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          language: Database["public"]["Enums"]["app_language"]
          name: string
          phone_number: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          language?: Database["public"]["Enums"]["app_language"]
          name: string
          phone_number: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          name?: string
          phone_number?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      vehicle_presets: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          make: string
          model: string
          recommended_oil: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          make: string
          model: string
          recommended_oil?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          make?: string
          model?: string
          recommended_oil?: string | null
          year?: number
        }
        Relationships: []
      }
      vehicle_service_items: {
        Row: {
          created_at: string
          id: string
          interval_km: number | null
          interval_months: number | null
          last_service_date: string | null
          last_service_odometer: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          last_service_date?: string | null
          last_service_odometer?: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          last_service_date?: string | null
          last_service_odometer?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_service_items_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          current_odometer: number
          id: string
          make: string
          model: string
          odometer_updated_at: string | null
          plate_no: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_odometer?: number
          id?: string
          make: string
          model: string
          odometer_updated_at?: string | null
          plate_no?: string | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          current_odometer?: number
          id?: string
          make?: string
          model?: string
          odometer_updated_at?: string | null
          plate_no?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      app_language: "ar" | "en"
      notification_delivery_status:
        | "pending"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
      notification_message_type:
        | "odometer_request"
        | "service_due"
        | "re_reminder"
      notification_response: "done" | "not_done" | "invalid"
      odometer_source: "whatsapp" | "web"
      service_status: "ok" | "due" | "overdue"
      service_type:
        | "engine_oil"
        | "transmission_fluid"
        | "brake_fluid"
        | "brake_pads"
        | "air_filter"
        | "oil_filter"
        | "tires"
      user_role: "owner" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_language: ["ar", "en"],
      notification_delivery_status: [
        "pending",
        "sent",
        "delivered",
        "read",
        "failed",
      ],
      notification_message_type: [
        "odometer_request",
        "service_due",
        "re_reminder",
      ],
      notification_response: ["done", "not_done", "invalid"],
      odometer_source: ["whatsapp", "web"],
      service_status: ["ok", "due", "overdue"],
      service_type: [
        "engine_oil",
        "transmission_fluid",
        "brake_fluid",
        "brake_pads",
        "air_filter",
        "oil_filter",
        "tires",
      ],
      user_role: ["owner", "admin"],
    },
  },
} as const
