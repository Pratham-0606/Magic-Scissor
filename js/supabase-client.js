/**
 * Magic Scissors - Supabase Client & Real-Time Data Store
 */
import { createClient } from '@supabase/supabase-js';

// Default Supabase configuration
const ENV_URL = import.meta.env?.VITE_SUPABASE_URL || "";
const ENV_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.realtimeChannel = null;
    this.listeners = [];
    this.init();
  }

  init() {
    if (this.realtimeChannel && this.client) {
      try { this.client.removeChannel(this.realtimeChannel); } catch (e) {}
      this.realtimeChannel = null;
    }

    // Check localStorage for saved custom keys if env is empty
    const storedUrl = localStorage.getItem("ms_supabase_url") || ENV_URL;
    const storedKey = localStorage.getItem("ms_supabase_key") || ENV_KEY;

    if (storedUrl && storedKey && !storedUrl.includes("your-project")) {
      try {
        this.client = createClient(storedUrl, storedKey);
        this.isConfigured = true;
        this.setupRealtime();
        console.log("✦ Supabase connected successfully to:", storedUrl);
      } catch (err) {
        console.warn("Supabase init failed, falling back to local reactive storage:", err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
      console.log("ℹ Supabase credentials pending. Running in reactive offline-first storage mode.");
    }
  }

  getConnectionStatus() {
    return {
      isConfigured: this.isConfigured,
      mode: this.isConfigured ? 'Supabase Real-Time Connected' : 'Offline Reactive Storage',
      storageBackend: this.isConfigured ? 'Remote PostgreSQL + Local Fallback' : 'Local Indexed/LocalStorage Store'
    };
  }

  setCredentials(url, key) {
    if (url && key) {
      localStorage.setItem("ms_supabase_url", url);
      localStorage.setItem("ms_supabase_key", key);
      this.init();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // 1. Appointments Data Storing
  // --------------------------------------------------------------------------
  async saveAppointment(data) {
    const record = {
      id: data.id || 'apt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      client_name: data.clientName,
      client_phone: data.clientPhone,
      client_email: data.clientEmail || '',
      service_id: data.serviceId,
      service_name: data.serviceName,
      preferred_date: data.preferredDate,
      time_slot: data.timeSlot,
      notes: data.notes || '',
      status: 'pending', // pending | confirmed | completed | cancelled
      created_at: new Date().toISOString()
    };

    // 1. Always save to local reactive store for instant feedback
    const localApts = this.getLocalAppointments();
    localApts.unshift(record);
    localStorage.setItem("ms_appointments", JSON.stringify(localApts));
    this.notifyListeners(localApts);

    // 2. If Supabase configured, push to remote 'appointments' table
    if (this.isConfigured && this.client) {
      try {
        const { error } = await this.client
          .from('appointments')
          .insert([record]);
        if (error) console.error("Supabase insert error:", error);
      } catch (e) {
        console.warn("Failed to sync appointment to Supabase:", e);
      }
    }

    // 3. Log lead event
    this.trackLeadEvent('new_appointment_booked', { service: data.serviceName, phone: data.clientPhone });

    return record;
  }

  async getAppointments() {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          localStorage.setItem("ms_appointments", JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn("Supabase fetch error, using local data:", e);
      }
    }
    return this.getLocalAppointments();
  }

  async updateAppointmentStatus(id, newStatus) {
    const localApts = this.getLocalAppointments();
    const apt = localApts.find(a => a.id === id);
    if (apt) {
      apt.status = newStatus;
      localStorage.setItem("ms_appointments", JSON.stringify(localApts));
      this.notifyListeners(localApts);
    }

    if (this.isConfigured && this.client) {
      try {
        await this.client
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (e) {
        console.warn("Supabase status update error:", e);
      }
    }
    return apt;
  }

  getLocalAppointments() {
    try {
      const data = localStorage.getItem("ms_appointments");
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Seed with realistic demo bookings so client sees live tracking immediately!
    const defaultSeed = [
      {
        id: "apt_101",
        client_name: "Sneha Patil",
        client_phone: "+91 98221 12345",
        client_email: "sneha.p@gmail.com",
        service_id: "signature-haircut",
        service_name: "Signature Scissor Cut & Couture Blowdry",
        preferred_date: new Date().toISOString().split("T")[0],
        time_slot: "Morning (10:00 AM - 1:00 PM)",
        notes: "Prefers Senior Stylist",
        status: "confirmed",
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "apt_102",
        client_name: "Rohan Deshmukh",
        client_phone: "+91 94228 67890",
        client_email: "rohan.d@yahoo.com",
        service_id: "royal-barber-shave",
        service_name: "The Royal Gent Beard Architecture & Hot Towel Shave",
        preferred_date: new Date().toISOString().split("T")[0],
        time_slot: "Evening (5:00 PM - 9:00 PM)",
        notes: "First time visit",
        status: "pending",
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    localStorage.setItem("ms_appointments", JSON.stringify(defaultSeed));
    return defaultSeed;
  }

  // --------------------------------------------------------------------------
  // 2. Real-Time Subscriptions
  // --------------------------------------------------------------------------
  onAppointmentsChange(callback) {
    this.listeners.push(callback);
    // Immediately call with current data
    callback(this.getLocalAppointments());
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) {}
    });
  }

  setupRealtime() {
    if (!this.client || !this.isConfigured) return;
    if (this.realtimeChannel) {
      try { this.client.removeChannel(this.realtimeChannel); } catch (e) {}
      this.realtimeChannel = null;
    }
    try {
      this.realtimeChannel = this.client
        .channel('public:appointments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          this.getAppointments().then(data => this.notifyListeners(data));
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime subscription notice:", e);
    }
  }

  // --------------------------------------------------------------------------
  // 3. Lead & Click Tracking (WhatsApp, Dialpad, Instagram)
  // --------------------------------------------------------------------------
  trackLeadEvent(eventType, meta = {}) {
    const event = {
      event_type: eventType,
      metadata: meta,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      user_agent: navigator.userAgent
    };

    // Track locally
    try {
      const events = JSON.parse(localStorage.getItem("ms_analytics") || "[]");
      events.unshift(event);
      if (events.length > 50) events.pop();
      localStorage.setItem("ms_analytics", JSON.stringify(events));
    } catch (e) {}

    // Push to Supabase if configured
    if (this.isConfigured && this.client) {
      this.client.from('lead_events').insert([event]).then(() => {}).catch(() => {});
    }
  }

  getAnalyticsSummary() {
    try {
      const events = JSON.parse(localStorage.getItem("ms_analytics") || "[]");
      const apts = this.getLocalAppointments();
      return {
        totalAppointments: apts.length,
        pendingAppointments: apts.filter(a => a.status === 'pending').length,
        confirmedAppointments: apts.filter(a => a.status === 'confirmed').length,
        whatsappClicks: events.filter(e => e.event_type === 'whatsapp_click').length,
        dialpadCalls: events.filter(e => e.event_type === 'dialpad_call').length,
        recentEvents: events.slice(0, 10)
      };
    } catch (e) {
      return { totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, whatsappClicks: 0, dialpadCalls: 0, recentEvents: [] };
    }
  }

  // --------------------------------------------------------------------------
  // 4. Client Accounts & Authentication
  // --------------------------------------------------------------------------
  async signUpUser(name, email, phone, password) {
    // If Supabase Auth is configured
    if (this.isConfigured && this.client) {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone: phone }
        }
      });
      if (error) {
        throw new Error(error.message || "Unable to create account. Please check your credentials.");
      }
      if (data?.user) {
        const profile = {
          id: data.user.id,
          name,
          email,
          phone,
          vip_tier: "Studio Elite Member",
          loyalty_points: 250,
          joined_date: new Date().toISOString()
        };
        localStorage.setItem("ms_current_user", JSON.stringify(profile));
        return { success: true, user: profile };
      }
    }

    // Local account simulation
    const profile = {
      id: "usr_" + Date.now(),
      name,
      email,
      phone,
      vip_tier: "Studio Elite Member",
      loyalty_points: 250,
      joined_date: new Date().toISOString()
    };
    localStorage.setItem("ms_current_user", JSON.stringify(profile));
    return { success: true, user: profile };
  }

  async signInUser(email, password) {
    if (this.isConfigured && this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message || "Invalid login credentials.");
      }
      if (data?.user) {
        const profile = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email,
          phone: data.user.user_metadata?.phone || '+91 98000 00000',
          vip_tier: "Platinum VIP Member",
          loyalty_points: 620,
          joined_date: data.user.created_at
        };
        localStorage.setItem("ms_current_user", JSON.stringify(profile));
        return { success: true, user: profile };
      }
    }

    // Local profile fallback
    const profile = {
      id: "usr_demo",
      name: email.split('@')[0].toUpperCase(),
      email,
      phone: "+91 99601 35849",
      vip_tier: "Studio Elite Member",
      loyalty_points: 450,
      joined_date: new Date().toISOString()
    };
    localStorage.setItem("ms_current_user", JSON.stringify(profile));
    return { success: true, user: profile };
  }

  signOutUser() {
    localStorage.removeItem("ms_current_user");
    if (this.isConfigured && this.client) {
      this.client.auth.signOut().catch(() => {});
    }
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem("ms_current_user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
