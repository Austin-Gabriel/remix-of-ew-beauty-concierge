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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          professional_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          professional_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          professional_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      background_checks: {
        Row: {
          adjudication: string | null
          checkr_candidate_id: string | null
          checkr_report_id: string | null
          created_at: string
          flagged_items: Json | null
          id: string
          professional_id: string
          provider: string
          report_completed_at: string | null
          status: Database["public"]["Enums"]["background_check_status"]
          updated_at: string
        }
        Insert: {
          adjudication?: string | null
          checkr_candidate_id?: string | null
          checkr_report_id?: string | null
          created_at?: string
          flagged_items?: Json | null
          id?: string
          professional_id: string
          provider?: string
          report_completed_at?: string | null
          status?: Database["public"]["Enums"]["background_check_status"]
          updated_at?: string
        }
        Update: {
          adjudication?: string | null
          checkr_candidate_id?: string | null
          checkr_report_id?: string | null
          created_at?: string
          flagged_items?: Json | null
          id?: string
          professional_id?: string
          provider?: string
          report_completed_at?: string | null
          status?: Database["public"]["Enums"]["background_check_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "background_checks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "background_checks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_pairs: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_pairs_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_pairs_blocker_user_id_fkey"
            columns: ["blocker_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_history: {
        Row: {
          actor_role: string | null
          actor_user_id: string | null
          booking_id: string
          created_at: string
          from_status: Database["public"]["Enums"]["booking_status"] | null
          id: string
          metadata: Json
          reason: string | null
          to_status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          actor_role?: string | null
          actor_user_id?: string | null
          booking_id: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["booking_status"] | null
          id?: string
          metadata?: Json
          reason?: string | null
          to_status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          actor_role?: string | null
          actor_user_id?: string | null
          booking_id?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["booking_status"] | null
          id?: string
          metadata?: Json
          reason?: string | null
          to_status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accepted_at: string | null
          access_notes_snapshot: string | null
          address_city: string | null
          address_line: string | null
          booking_type: Database["public"]["Enums"]["booking_type"]
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by:
            | Database["public"]["Enums"]["booking_cancelled_by"]
            | null
          commission_cents: number
          created_at: string
          customer_checked_in_at: string | null
          customer_destination: unknown
          customer_headcount: number
          customer_id: string
          customer_notes: string | null
          customer_rated_at: string | null
          decline_reason: string | null
          declined_at: string | null
          distance_to_customer_meters: number | null
          duration_minutes: number
          en_route_at: string | null
          estimated_pro_arrival_time: string | null
          expires_at: string | null
          id: string
          last_location_update_at: string | null
          location_type: Database["public"]["Enums"]["service_location"]
          mode: Database["public"]["Enums"]["booking_mode"]
          nearly_there_notified_at: string | null
          preparing_started_at: string | null
          price_cents: number
          pro_arrival_confirmed_by_customer_at: string | null
          pro_arrived_at: string | null
          pro_live_location: unknown
          pro_live_location_enabled: boolean
          pro_live_location_updated_at: string | null
          pro_notes: string | null
          pro_rated_at: string | null
          professional_id: string
          requested_at: string | null
          saved_address_id: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          service_ended_at: string | null
          service_fee_cents: number
          service_id: string
          service_started_at: string | null
          share_code: string | null
          share_code_attempts: number
          share_code_verified_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          stripe_captured_at: string | null
          stripe_hold_at: string | null
          stripe_payment_intent_id: string | null
          stripe_refunded_at: string | null
          subtotal_cents: number | null
          tip_cents: number
          total_cents: number | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          access_notes_snapshot?: string | null
          address_city?: string | null
          address_line?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?:
            | Database["public"]["Enums"]["booking_cancelled_by"]
            | null
          commission_cents?: number
          created_at?: string
          customer_checked_in_at?: string | null
          customer_destination?: unknown
          customer_headcount?: number
          customer_id: string
          customer_notes?: string | null
          customer_rated_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          distance_to_customer_meters?: number | null
          duration_minutes: number
          en_route_at?: string | null
          estimated_pro_arrival_time?: string | null
          expires_at?: string | null
          id?: string
          last_location_update_at?: string | null
          location_type: Database["public"]["Enums"]["service_location"]
          mode: Database["public"]["Enums"]["booking_mode"]
          nearly_there_notified_at?: string | null
          preparing_started_at?: string | null
          price_cents: number
          pro_arrival_confirmed_by_customer_at?: string | null
          pro_arrived_at?: string | null
          pro_live_location?: unknown
          pro_live_location_enabled?: boolean
          pro_live_location_updated_at?: string | null
          pro_notes?: string | null
          pro_rated_at?: string | null
          professional_id: string
          requested_at?: string | null
          saved_address_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_ended_at?: string | null
          service_fee_cents?: number
          service_id: string
          service_started_at?: string | null
          share_code?: string | null
          share_code_attempts?: number
          share_code_verified_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_captured_at?: string | null
          stripe_hold_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refunded_at?: string | null
          subtotal_cents?: number | null
          tip_cents?: number
          total_cents?: number | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          access_notes_snapshot?: string | null
          address_city?: string | null
          address_line?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?:
            | Database["public"]["Enums"]["booking_cancelled_by"]
            | null
          commission_cents?: number
          created_at?: string
          customer_checked_in_at?: string | null
          customer_destination?: unknown
          customer_headcount?: number
          customer_id?: string
          customer_notes?: string | null
          customer_rated_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          distance_to_customer_meters?: number | null
          duration_minutes?: number
          en_route_at?: string | null
          estimated_pro_arrival_time?: string | null
          expires_at?: string | null
          id?: string
          last_location_update_at?: string | null
          location_type?: Database["public"]["Enums"]["service_location"]
          mode?: Database["public"]["Enums"]["booking_mode"]
          nearly_there_notified_at?: string | null
          preparing_started_at?: string | null
          price_cents?: number
          pro_arrival_confirmed_by_customer_at?: string | null
          pro_arrived_at?: string | null
          pro_live_location?: unknown
          pro_live_location_enabled?: boolean
          pro_live_location_updated_at?: string | null
          pro_notes?: string | null
          pro_rated_at?: string | null
          professional_id?: string
          requested_at?: string | null
          saved_address_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_ended_at?: string | null
          service_fee_cents?: number
          service_id?: string
          service_started_at?: string | null
          share_code?: string | null
          share_code_attempts?: number
          share_code_verified_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_captured_at?: string | null
          stripe_hold_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refunded_at?: string | null
          subtotal_cents?: number | null
          tip_cents?: number
          total_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_saved_address_id_fkey"
            columns: ["saved_address_id"]
            isOneToOne: false
            referencedRelation: "saved_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_id: string | null
          created_at: string
          customer_archived_at: string | null
          customer_id: string
          id: string
          last_message_at: string | null
          professional_archived_at: string | null
          professional_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          customer_archived_at?: string | null
          customer_id: string
          id?: string
          last_message_at?: string | null
          professional_archived_at?: string | null
          professional_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          customer_archived_at?: string | null
          customer_id?: string
          id?: string
          last_message_at?: string | null
          professional_archived_at?: string | null
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_favorites: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          professional_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          professional_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          professional_id?: string
        }
        Relationships: []
      }
      customer_ratings: {
        Row: {
          booking_id: string
          created_at: string
          customer_id: string
          id: string
          private_notes: string | null
          professional_id: string
          rating: number
          tags: string[]
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_id: string
          id?: string
          private_notes?: string | null
          professional_id: string
          rating: number
          tags?: string[]
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          private_notes?: string | null
          professional_id?: string
          rating?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "customer_ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ratings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ratings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_safety_flags: {
        Row: {
          avg_rating: number | null
          blocked_at: string | null
          blocked_by_admin_id: string | null
          blocked_reason: string | null
          blocked_status: Database["public"]["Enums"]["customer_block_status"]
          customer_id: string
          flags: Json
          total_ratings: number
          updated_at: string
        }
        Insert: {
          avg_rating?: number | null
          blocked_at?: string | null
          blocked_by_admin_id?: string | null
          blocked_reason?: string | null
          blocked_status?: Database["public"]["Enums"]["customer_block_status"]
          customer_id: string
          flags?: Json
          total_ratings?: number
          updated_at?: string
        }
        Update: {
          avg_rating?: number | null
          blocked_at?: string | null
          blocked_by_admin_id?: string | null
          blocked_reason?: string | null
          blocked_status?: Database["public"]["Enums"]["customer_block_status"]
          customer_id?: string
          flags?: Json
          total_ratings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_safety_flags_blocked_by_admin_id_fkey"
            columns: ["blocked_by_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_safety_flags_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          name: string
          phone: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          name: string
          phone: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          config: Json
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          config?: Json
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          config?: Json
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      identity_verifications: {
        Row: {
          created_at: string
          document_country: string | null
          document_type: string | null
          id: string
          provider: string
          status: Database["public"]["Enums"]["identity_verification_status"]
          stripe_verification_session_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_country?: string | null
          document_type?: string | null
          id?: string
          provider?: string
          status?: Database["public"]["Enums"]["identity_verification_status"]
          stripe_verification_session_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_country?: string | null
          document_type?: string | null
          id?: string
          provider?: string
          status?: Database["public"]["Enums"]["identity_verification_status"]
          stripe_verification_session_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          admin_notes: string | null
          assigned_admin_id: string | null
          booking_id: string | null
          category: Database["public"]["Enums"]["incident_category"]
          created_at: string
          description: string
          evidence_urls: string[]
          id: string
          reported_user_id: string | null
          reporter_user_id: string
          resolution: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
        }
        Insert: {
          admin_notes?: string | null
          assigned_admin_id?: string | null
          booking_id?: string | null
          category: Database["public"]["Enums"]["incident_category"]
          created_at?: string
          description: string
          evidence_urls?: string[]
          id?: string
          reported_user_id?: string | null
          reporter_user_id: string
          resolution?: string | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
        }
        Update: {
          admin_notes?: string | null
          assigned_admin_id?: string | null
          booking_id?: string | null
          category?: Database["public"]["Enums"]["incident_category"]
          created_at?: string
          description?: string
          evidence_urls?: string[]
          id?: string
          reported_user_id?: string | null
          reporter_user_id?: string
          resolution?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          media_urls: string[]
          message_type: Database["public"]["Enums"]["message_type"]
          read_by_recipient_at: string | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          media_urls?: string[]
          message_type?: Database["public"]["Enums"]["message_type"]
          read_by_recipient_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          media_urls?: string[]
          message_type?: Database["public"]["Enums"]["message_type"]
          read_by_recipient_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json
          deep_link: string | null
          delivered_at: string | null
          id: string
          read_at: string | null
          recipient_user_id: string
          template_key: string
          title: string | null
        }
        Insert: {
          body?: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          deep_link?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          recipient_user_id: string
          template_key: string
          title?: string | null
        }
        Update: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          deep_link?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          recipient_user_id?: string
          template_key?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          professional_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          professional_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_inactivity_log: {
        Row: {
          booking_id: string | null
          created_at: string
          expired_at: string
          id: string
          professional_id: string
          reason: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          expired_at?: string
          id?: string
          professional_id: string
          reason?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          expired_at?: string
          id?: string
          professional_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_inactivity_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_locations: {
        Row: {
          accuracy_meters: number | null
          booking_id: string
          created_at: string
          heading: number | null
          id: string
          lat: number
          lng: number
          location: unknown
          professional_id: string
          recorded_at: string
          speed_mps: number | null
        }
        Insert: {
          accuracy_meters?: number | null
          booking_id: string
          created_at?: string
          heading?: number | null
          id?: string
          lat: number
          lng: number
          location: unknown
          professional_id: string
          recorded_at?: string
          speed_mps?: number | null
        }
        Update: {
          accuracy_meters?: number | null
          booking_id?: string
          created_at?: string
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          location?: unknown
          professional_id?: string
          recorded_at?: string
          speed_mps?: number | null
        }
        Relationships: []
      }
      pro_preferences: {
        Row: {
          created_at: string
          language: string
          message_policy: string
          mute_until: string | null
          notify_booking_cancelled: boolean
          notify_booking_confirmed: boolean
          notify_booking_reminders: boolean
          notify_client_reviews: boolean
          notify_marketing_features: boolean
          notify_marketing_tips: boolean
          notify_mentions: boolean
          notify_new_messages: boolean
          notify_new_request: boolean
          notify_payout_failed: boolean
          notify_payouts_processed: boolean
          search_visible: boolean
          show_last_active: boolean
          show_online_status: boolean
          text_size: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          language?: string
          message_policy?: string
          mute_until?: string | null
          notify_booking_cancelled?: boolean
          notify_booking_confirmed?: boolean
          notify_booking_reminders?: boolean
          notify_client_reviews?: boolean
          notify_marketing_features?: boolean
          notify_marketing_tips?: boolean
          notify_mentions?: boolean
          notify_new_messages?: boolean
          notify_new_request?: boolean
          notify_payout_failed?: boolean
          notify_payouts_processed?: boolean
          search_visible?: boolean
          show_last_active?: boolean
          show_online_status?: boolean
          text_size?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          language?: string
          message_policy?: string
          mute_until?: string | null
          notify_booking_cancelled?: boolean
          notify_booking_confirmed?: boolean
          notify_booking_reminders?: boolean
          notify_client_reviews?: boolean
          notify_marketing_features?: boolean
          notify_marketing_tips?: boolean
          notify_mentions?: boolean
          notify_new_messages?: boolean
          notify_new_request?: boolean
          notify_payout_failed?: boolean
          notify_payouts_processed?: boolean
          search_visible?: boolean
          show_last_active?: boolean
          show_online_status?: boolean
          text_size?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pro_reviews: {
        Row: {
          body: string | null
          booking_id: string
          created_at: string
          customer_id: string
          hidden_reason: string | null
          id: string
          is_hidden: boolean
          pro_replied_at: string | null
          pro_reply: string | null
          professional_id: string
          rating: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          body?: string | null
          booking_id: string
          created_at?: string
          customer_id: string
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean
          pro_replied_at?: string | null
          pro_reply?: string | null
          professional_id: string
          rating: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          body?: string | null
          booking_id?: string
          created_at?: string
          customer_id?: string
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean
          pro_replied_at?: string | null
          pro_reply?: string | null
          professional_id?: string
          rating?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      professional_payouts: {
        Row: {
          charges_enabled: boolean
          created_at: string
          payouts_enabled: boolean
          professional_id: string
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          charges_enabled?: boolean
          created_at?: string
          payouts_enabled?: boolean
          professional_id: string
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          charges_enabled?: boolean
          created_at?: string
          payouts_enabled?: boolean
          professional_id?: string
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_payouts_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_payouts_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          auto_accept_scheduled: boolean
          avg_rating: number | null
          background_check_status:
            | Database["public"]["Enums"]["background_check_status"]
            | null
          base_address: string | null
          base_location: unknown
          bio: string | null
          buffer_minutes: number
          can_accept_bookings: boolean
          cover_url: string | null
          created_at: string
          handle: string | null
          id: string
          identity_verified_at: string | null
          instagram: string | null
          is_online: boolean
          is_verified: boolean
          neighborhood: string | null
          onboarded_at: string | null
          service_radius_km: number
          suspended_at: string | null
          suspended_reason: string | null
          tagline: string | null
          tiktok: string | null
          total_bookings: number
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          auto_accept_scheduled?: boolean
          avg_rating?: number | null
          background_check_status?:
            | Database["public"]["Enums"]["background_check_status"]
            | null
          base_address?: string | null
          base_location?: unknown
          bio?: string | null
          buffer_minutes?: number
          can_accept_bookings?: boolean
          cover_url?: string | null
          created_at?: string
          handle?: string | null
          id: string
          identity_verified_at?: string | null
          instagram?: string | null
          is_online?: boolean
          is_verified?: boolean
          neighborhood?: string | null
          onboarded_at?: string | null
          service_radius_km?: number
          suspended_at?: string | null
          suspended_reason?: string | null
          tagline?: string | null
          tiktok?: string | null
          total_bookings?: number
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          auto_accept_scheduled?: boolean
          avg_rating?: number | null
          background_check_status?:
            | Database["public"]["Enums"]["background_check_status"]
            | null
          base_address?: string | null
          base_location?: unknown
          bio?: string | null
          buffer_minutes?: number
          can_accept_bookings?: boolean
          cover_url?: string | null
          created_at?: string
          handle?: string | null
          id?: string
          identity_verified_at?: string | null
          instagram?: string | null
          is_online?: boolean
          is_verified?: boolean
          neighborhood?: string | null
          onboarded_at?: string | null
          service_radius_km?: number
          suspended_at?: string | null
          suspended_reason?: string | null
          tagline?: string | null
          tiktok?: string | null
          total_bookings?: number
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_contacts: {
        Row: {
          created_at: string
          email: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked_status: Database["public"]["Enums"]["customer_block_status"]
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          total_incidents_reported: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          blocked_status?: Database["public"]["Enums"]["customer_block_status"]
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          total_incidents_reported?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          blocked_status?: Database["public"]["Enums"]["customer_block_status"]
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          total_incidents_reported?: number
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_addresses: {
        Row: {
          access_notes: string | null
          accessibility_notes: string | null
          address_text: string
          created_at: string
          has_pets: boolean
          id: string
          is_default: boolean
          label: string
          location: unknown
          pet_notes: string | null
          unit_info: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_notes?: string | null
          accessibility_notes?: string | null
          address_text: string
          created_at?: string
          has_pets?: boolean
          id?: string
          is_default?: boolean
          label: string
          location?: unknown
          pet_notes?: string | null
          unit_info?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_notes?: string | null
          accessibility_notes?: string | null
          address_text?: string
          created_at?: string
          has_pets?: boolean
          id?: string
          is_default?: boolean
          label?: string
          location?: unknown
          pet_notes?: string | null
          unit_info?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          location_type: Database["public"]["Enums"]["service_location"]
          name: string
          price_cents: number
          professional_id: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          location_type?: Database["public"]["Enums"]["service_location"]
          name: string
          price_cents: number
          professional_id: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          location_type?: Database["public"]["Enums"]["service_location"]
          name?: string
          price_cents?: number
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_triggers: {
        Row: {
          booking_id: string
          external_services_contacted: boolean
          id: string
          location: unknown
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          triggered_at: string
          triggered_by_user_id: string
        }
        Insert: {
          booking_id: string
          external_services_contacted?: boolean
          id?: string
          location?: unknown
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          triggered_at?: string
          triggered_by_user_id: string
        }
        Update: {
          booking_id?: string
          external_services_contacted?: boolean
          id?: string
          location?: unknown
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          triggered_at?: string
          triggered_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_triggers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_triggers_resolved_by_user_id_fkey"
            columns: ["resolved_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_triggers_triggered_by_user_id_fkey"
            columns: ["triggered_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      tos_acceptances: {
        Row: {
          accepted_at: string
          id: string
          ip_address: string | null
          tos_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          tos_version: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          tos_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tos_acceptances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_shares: {
        Row: {
          booking_id: string
          created_at: string
          expires_at: string
          id: string
          last_viewed_at: string | null
          revoked_at: string | null
          share_contact_email: string | null
          share_contact_name: string | null
          share_contact_phone: string | null
          share_token: string
          shared_by_user_id: string
          viewed_count: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          expires_at: string
          id?: string
          last_viewed_at?: string | null
          revoked_at?: string | null
          share_contact_email?: string | null
          share_contact_name?: string | null
          share_contact_phone?: string | null
          share_token: string
          shared_by_user_id: string
          viewed_count?: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_viewed_at?: string | null
          revoked_at?: string | null
          share_contact_email?: string | null
          share_contact_name?: string | null
          share_contact_phone?: string | null
          share_token?: string
          shared_by_user_id?: string
          viewed_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "trip_shares_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_shares_shared_by_user_id_fkey"
            columns: ["shared_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_status: {
        Row: {
          background_check_clear: boolean
          identity_verified: boolean
          insurance_uploaded: boolean
          license_uploaded: boolean
          overall_status: Database["public"]["Enums"]["verification_overall_status"]
          professional_id: string
          stripe_payouts_enabled: boolean
          tax_w9_complete: boolean
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          background_check_clear?: boolean
          identity_verified?: boolean
          insurance_uploaded?: boolean
          license_uploaded?: boolean
          overall_status?: Database["public"]["Enums"]["verification_overall_status"]
          professional_id: string
          stripe_payouts_enabled?: boolean
          tax_w9_complete?: boolean
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          background_check_clear?: boolean
          identity_verified?: boolean
          insurance_uploaded?: boolean
          license_uploaded?: boolean
          overall_status?: Database["public"]["Enums"]["verification_overall_status"]
          professional_id?: string
          stripe_payouts_enabled?: boolean
          tax_w9_complete?: boolean
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_status_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_status_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      background_checks_self: {
        Row: {
          created_at: string | null
          id: string | null
          professional_id: string | null
          report_completed_at: string | null
          status: Database["public"]["Enums"]["background_check_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          professional_id?: string | null
          report_completed_at?: string | null
          status?: Database["public"]["Enums"]["background_check_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          professional_id?: string | null
          report_completed_at?: string | null
          status?: Database["public"]["Enums"]["background_check_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "background_checks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "background_checks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      professionals_public: {
        Row: {
          auto_accept_scheduled: boolean | null
          avatar_url: string | null
          avg_rating: number | null
          base_location: unknown
          bio: string | null
          buffer_minutes: number | null
          city: string | null
          full_name: string | null
          id: string | null
          is_online: boolean | null
          is_verified: boolean | null
          service_radius_km: number | null
          total_bookings: number | null
          years_experience: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_badges: {
        Row: {
          background_check_clear: boolean | null
          identity_verified: boolean | null
          insurance_uploaded: boolean | null
          license_uploaded: boolean | null
          professional_id: string | null
        }
        Insert: {
          background_check_clear?: boolean | null
          identity_verified?: boolean | null
          insurance_uploaded?: boolean | null
          license_uploaded?: boolean | null
          professional_id?: string | null
        }
        Update: {
          background_check_clear?: boolean | null
          identity_verified?: boolean | null
          insurance_uploaded?: boolean | null
          license_uploaded?: boolean | null
          professional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_status_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_status_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      cleanup_stale_pro_locations: { Args: never; Returns: number }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_booking_destination_lnglat: {
        Args: { p_booking_id: string }
        Returns: {
          lat: number
          lng: number
        }[]
      }
      get_trip_share_by_token: { Args: { _token: string }; Returns: Json }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      recompute_pro_can_accept: {
        Args: { p_pro_id: string }
        Returns: undefined
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      update_pro_location: {
        Args: {
          _accuracy?: number
          _booking_id: string
          _heading?: number
          _lat: number
          _lng: number
          _speed?: number
        }
        Returns: Json
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "customer" | "professional" | "admin"
      background_check_status:
        | "pending"
        | "consent_required"
        | "processing"
        | "clear"
        | "consider"
        | "suspended"
        | "canceled"
      booking_cancelled_by: "customer" | "professional" | "system" | "admin"
      booking_mode: "scheduled" | "on_demand"
      booking_status:
        | "pending"
        | "confirmed"
        | "accepted"
        | "en_route"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "declined"
        | "preparing"
        | "expired"
        | "no_show"
        | "inactive"
      booking_type: "on_demand" | "scheduled"
      customer_block_status: "active" | "warned" | "restricted" | "banned"
      identity_verification_status:
        | "created"
        | "processing"
        | "verified"
        | "requires_input"
        | "canceled"
        | "failed"
      incident_category:
        | "safety_emergency"
        | "harassment"
        | "no_show"
        | "property_damage"
        | "poor_service"
        | "fraud"
        | "inappropriate_behavior"
        | "injury"
        | "other"
      incident_severity: "critical" | "high" | "medium" | "low"
      incident_status:
        | "open"
        | "investigating"
        | "resolved"
        | "dismissed"
        | "escalated_external"
      message_type: "text" | "image" | "system" | "location" | "safety_ping"
      notification_channel: "push" | "sms" | "email" | "in_app"
      service_category:
        | "barber"
        | "hairstylist"
        | "braider"
        | "nail_tech"
        | "makeup_artist"
        | "lash_tech"
        | "other"
      service_location: "at_customer" | "at_pro"
      verification_overall_status:
        | "incomplete"
        | "pending_review"
        | "verified"
        | "suspended"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      app_role: ["customer", "professional", "admin"],
      background_check_status: [
        "pending",
        "consent_required",
        "processing",
        "clear",
        "consider",
        "suspended",
        "canceled",
      ],
      booking_cancelled_by: ["customer", "professional", "system", "admin"],
      booking_mode: ["scheduled", "on_demand"],
      booking_status: [
        "pending",
        "confirmed",
        "accepted",
        "en_route",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
        "declined",
        "preparing",
        "expired",
        "no_show",
        "inactive",
      ],
      booking_type: ["on_demand", "scheduled"],
      customer_block_status: ["active", "warned", "restricted", "banned"],
      identity_verification_status: [
        "created",
        "processing",
        "verified",
        "requires_input",
        "canceled",
        "failed",
      ],
      incident_category: [
        "safety_emergency",
        "harassment",
        "no_show",
        "property_damage",
        "poor_service",
        "fraud",
        "inappropriate_behavior",
        "injury",
        "other",
      ],
      incident_severity: ["critical", "high", "medium", "low"],
      incident_status: [
        "open",
        "investigating",
        "resolved",
        "dismissed",
        "escalated_external",
      ],
      message_type: ["text", "image", "system", "location", "safety_ping"],
      notification_channel: ["push", "sms", "email", "in_app"],
      service_category: [
        "barber",
        "hairstylist",
        "braider",
        "nail_tech",
        "makeup_artist",
        "lash_tech",
        "other",
      ],
      service_location: ["at_customer", "at_pro"],
      verification_overall_status: [
        "incomplete",
        "pending_review",
        "verified",
        "suspended",
      ],
    },
  },
} as const
