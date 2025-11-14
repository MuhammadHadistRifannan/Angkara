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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      boats: {
        Row: {
          available: boolean | null
          base_price: number
          capacity: number
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          location: string
          min_passengers: number | null
          name: string
          operator_id: string
          type: Database["public"]["Enums"]["boat_type"]
        }
        Insert: {
          available?: boolean | null
          base_price: number
          capacity: number
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          location: string
          min_passengers?: number | null
          name: string
          operator_id: string
          type: Database["public"]["Enums"]["boat_type"]
        }
        Update: {
          available?: boolean | null
          base_price?: number
          capacity?: number
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          location?: string
          min_passengers?: number | null
          name?: string
          operator_id?: string
          type?: Database["public"]["Enums"]["boat_type"]
        }
        Relationships: [
          {
            foreignKeyName: "boats_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          boat_id: string
          booking_date: string
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          created_at: string | null
          departure_time: string
          id: string
          notes: string | null
          passengers: number
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          total_price: number
          user_id: string
        }
        Insert: {
          boat_id: string
          booking_date: string
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string | null
          departure_time: string
          id?: string
          notes?: string | null
          passengers: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          total_price: number
          user_id: string
        }
        Update: {
          boat_id?: string
          booking_date?: string
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string | null
          departure_time?: string
          id?: string
          notes?: string | null
          passengers?: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          address: string | null
          company_name: string
          created_at: string | null
          email: string
          id: string
          ksop_certificate: string | null
          phone: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          company_name: string
          created_at?: string | null
          email: string
          id?: string
          ksop_certificate?: string | null
          phone: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string | null
          email?: string
          id?: string
          ksop_certificate?: string | null
          phone?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          boat_id: string
          booking_id: string
          comment: string | null
          created_at: string | null
          id: string
          photos: string[] | null
          rating: number
          safety_rating: number | null
          service_rating: number | null
          user_id: string
        }
        Insert: {
          boat_id: string
          booking_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          rating: number
          safety_rating?: number | null
          service_rating?: number | null
          user_id: string
        }
        Update: {
          boat_id?: string
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          rating?: number
          safety_rating?: number | null
          service_rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_packages: {
        Row: {
          available: boolean | null
          created_at: string | null
          description: string | null
          duration_hours: number
          id: string
          includes: string[] | null
          max_participants: number | null
          name: string
          operator_id: string
          price: number
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_hours: number
          id?: string
          includes?: string[] | null
          max_participants?: number | null
          name: string
          operator_id: string
          price: number
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number
          id?: string
          includes?: string[] | null
          max_participants?: number | null
          name?: string
          operator_id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "tour_packages_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
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
      boat_type: "speedboat" | "kapal_kayu"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      payment_status: "pending" | "dp_paid" | "fully_paid" | "refunded"
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
    Enums: {
      boat_type: ["speedboat", "kapal_kayu"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      payment_status: ["pending", "dp_paid", "fully_paid", "refunded"],
    },
  },
} as const
