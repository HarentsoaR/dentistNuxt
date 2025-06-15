import { createI18n } from "vue-i18n";

export default createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        back: "Back",
        next: "Next",
        previous: "Previous",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        welcome: "Welcome",
        with: "with",
        allRightsReserved: "All rights reserved.",
        reschedule: "Reschedule",
        backToTop: "Back to Top",
        patientPrefix: "Patient ID",
        servicePrefix: "Service ID",
        viewAll: "View All",
        details: "Details",
        today: "Today",
        tomorrow: "Tomorrow",
        inXDays: "In {count} days",
        past: "Past",
        more: "More",
        less: "Less",
        allStatuses: "All Statuses",
        appName: "DentaCare",
        appSubtitle: "Dental Clinic Management"
      },
      nav: {
        dashboard: "Dashboard",
        appointments: "Appointments",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        login: "Login",
        register: "Register"
      },
      auth: {
        subtitle: "Professional Dental Care Management",
        login: {
          title: "Sign in to your account",
          subtitle: "Welcome back to DentaCare",
          email: "Email address",
          password: "Password",
          submit: "Sign in",
          submitting: "Signing in...",
          forgotPassword: "Forgot your password?",
          noAccount: "Don't have an account?",
          createAccount: "Create one here",
          orContinueWith: "Or continue with",
          google: "Continue with Google",
          success: "Successfully signed in!",
          error: "Invalid credentials. Please try again.",
          emailPlaceholder: "Enter your email address",
          passwordPlaceholder: "Enter your password"
        },
        register: {
          title: "Create your account",
          subtitle: "Join DentaCare today",
          fullName: "Full Name",
          email: "Email address",
          phone: "Phone Number",
          password: "Password",
          confirmPassword: "Confirm Password",
          submit: "Create Account",
          submitting: "Creating Account...",
          hasAccount: "Already have an account?",
          signIn: "Sign in here",
          success: "Account created successfully! Please sign in.",
          error: "Registration failed. Please try again.",
          fullNamePlaceholder: "Enter your full name",
          emailPlaceholder: "Enter your email address",
          phonePlaceholder: "Enter your phone number",
          passwordPlaceholder: "Create a password",
          confirmPasswordPlaceholder: "Confirm your password"
        }
      },
      dashboard: {
        title: "Dashboard",
        welcome: "Welcome back, {name}",
        subtitle: "Here's what's happening with your appointments",
        stats: {
          upcoming: "Upcoming",
          completed: "Completed",
          cancelled: "Cancelled",
          total: "Total"
        },
        quickActions: {
          title: "Quick Actions",
          bookAppointment: "Book Appointment",
          viewAppointments: "View Appointments",
          manageAppointments: "Manage All Appointments"
        }
      },
      appointments: {
        title: "Appointments",
        myAppointments: "My Appointments",
        bookNew: "Book New Appointment",
        upcoming: "Upcoming",
        history: "History",
        noUpcoming: "You have no upcoming appointments.",
        noHistory: "You have no past appointments.",
        status: {
          scheduled: "Scheduled",
          completed: "Completed",
          cancelled: "Cancelled",
          confirmed: "Confirmed"
        },
        booking: {
          title: "Book a New Appointment",
          subtitle: "Fill in the details below to schedule your visit",
          service: "Select a Service",
          selectService: "Please select a service",
          date: "Date",
          time: "Time",
          submit: "Confirm Booking",
          submitting: "Scheduling...",
          success: "Appointment booked successfully!",
          error: "Could not book appointment. Please try again."
        },
        services: {
          checkup: "Annual Check-up and Cleaning",
          whitening: "Teeth Whitening",
          filling: "Cavity Filling",
          rootCanal: "Root Canal Therapy",
          extraction: "Wisdom Tooth Extraction",
          consultation: "Consultation",
          emergency: "Emergency Visit"
        }
      },
      theme: {
        light: "Light",
        dark: "Dark",
        system: "System"
      },
      notification: {
        login: {
          failedTitle: "Login Failed"
        },
        logout: {
          successTitle: "Logged Out",
          successMessage: "You have been successfully logged out.",
          failedTitle: "Logout Failed",
          failedMessage: "Logout failed. Please try again."
        }
      },
      component: {
        appointmentCard: {
          withDoctor: "With Dr. {doctorName}"
        },
        chatBot: {
          title: "Chat Assistant", // Existing, keep
          send: "Send", // Existing, keep
          tooltip: "Chat with us!",
          openChatLabel: "Open chat",
          assistantName: "DentaCare Assistant",
          greeting: "We're here to help!", // Updated value for greeting
          prompt: "Ask about our services or prices!",
          userLabel: "You",
          botLabel: "Bot",
          typing: "Bot is typing...",
          inputPlaceholder: "Ask me anything about your appointment...", // Replaces old 'placeholder'
          initialMessage: "Hello! How can I help you with our services, appointments, or prices today?"
        },
        passwordInput: {
          show: "Show password",
          hide: "Hide password",
          strength: {
            weak: "Weak password",
            fair: "Fair password",
            good: "Good password",
            strong: "Strong password",
            default: "Enter a password"
          },
          requirements: {
            minLength: "At least 8 characters",
            number: "Contains a number",
            symbol: "Contains a symbol",
            uppercase: "Contains uppercase letter"
          },
          match: {
            passwordsMatch: "Passwords match",
            passwordsDoNotMatch: "Passwords do not match"
          }
        }
      },
      page: {
        error: {
          title: "Error",
          defaultMessage: "An unexpected error occurred.",
          backHome: "Back to Homepage"
        },
        index: {
          mainTitle: "Comprehensive Dental Care Platform",
          mainSubtitle: "Manage appointments, patients, and staff efficiently.",
          stats: {
            thisMonth: "This Month"
          },
          staffDashboard: {
            title: "Staff Dashboard",
            subtitle: "Overview of clinic operations and upcoming tasks.",
            schedule: "My Schedule",
            managePatients: "Manage Patients",
            viewReports: "View Reports"
          },
          clientDashboard: {
            title: "Patient Portal",
            subtitle: "Access your appointment history and manage your profile.",
            myAppointments: "My Appointments",
            bookNew: "Book New Appointment",
            myProfile: "My Profile"
          },
          upcomingAppointments: {
            title: "Upcoming Appointments",
            viewDetails: "View Details",
            noAppointments: "No upcoming appointments."
          }
        },
        calendar: {
          title: "Appointment Calendar",
          month: "Month",
          week: "Week",
          day: "Day",
          today: "Today",
          view: "View",
          newEvent: "New Event",
          eventDetails: "Appointment Details"
        },
        patients: {
          title: "Patient Management",
          list: "Patient List",
          addPatient: "Add New Patient",
          searchPlaceholder: "Search patients by name or ID",
          id: "Patient ID",
          name: "Name",
          email: "Email",
          phone: "Phone",
          totalAppointments: "Total Appointments",
          lastVisit: "Last Visit",
          noPatients: "No patients found.",
          details: {
            title: "Patient Details",
            personalInfo: "Personal Information",
            appointmentHistory: "Appointment History",
            bookAppointment: "Book New Appointment"
          }
        },
        reports: {
          title: "Reports",
          generateReport: "Generate Report",
          appointmentTrends: "Appointment Trends",
          financialSummary: "Financial Summary",
          patientDemographics: "Patient Demographics",
          selectDateRange: "Select Date Range",
          exportPdf: "Export as PDF",
          exportCsv: "Export as CSV"
        },
        settings: {
          title: "Settings",
          sections: {
            profile: "Profile Settings",
            account: "Account Settings",
            notifications: "Notification Preferences",
            theme: "Theme Settings",
            language: "Language Settings"
          },
          profile: {
            updateSuccess: "Profile updated successfully.",
            updateError: "Failed to update profile."
          },
          account: {
            changePassword: "Change Password",
            newPassword: "New Password",
            confirmNewPassword: "Confirm New Password",
            passwordChangedSuccess: "Password changed successfully.",
            passwordChangedError: "Failed to change password."
          },
          notifications: {
            emailNotifications: "Email Notifications",
            smsNotifications: "SMS Notifications",
            pushNotifications: "Push Notifications",
            appointmentReminders: "Appointment Reminders",
            promotionalUpdates: "Promotional Updates"
          },
          language: {
            selectLanguage: "Select Language"
          }
        },
        appointments: {
          manage: {
            title: "Manage All Appointments",
            searchPlaceholder: "Search by patient name, doctor, or status",
            filterByStatus: "Filter by Status",
            rescheduleAppointment: "Reschedule Appointment",
            cancelAppointment: "Cancel Appointment",
            confirmAppointment: "Confirm Appointment",
            appointmentUpdated: "Appointment updated successfully.",
            appointmentCancelled: "Appointment cancelled."
          },
          my: {
            title: "My Appointments",
            reschedule: "Reschedule",
            cancel: "Cancel",
            viewDetails: "View Details"
          },
          new: {
            title: "Book New Appointment",
            selectDoctor: "Select Doctor (Optional)",
            notes: "Additional Notes (Optional)",
            placeholderNotes: "E.g., preferred contact method, specific concerns"
          }
        },
        layouts: {
          auth: {
            footer: "&copy; {year} DentaCare. Your smile, our priority."
          },
          default: {
            logoutConfirm: {
              title: "Confirm Logout",
              message: "Are you sure you want to log out?"
            },
            sidebar: {
              patients: "Patients",
              calendar: "Calendar",
              reports: "Reports",
              settings: "Settings"
            },
            userRoleDefault: "User",
            pageTitles: {
              dashboard: "Overview",
              appointments: "Appointments",
              myAppointments: "My Appointments",
              bookAppointment: "Book New Appointment",
              manageAppointments: "Manage All Appointments",
              patients: "Patient Directory",
              patientDetails: "Patient Details",
              calendar: "Clinic Calendar",
              reports: "Clinic Reports",
              settings: "Application Settings",
              profile: "My Profile"
            },
            pageSubtitles: {
              dashboard: "Main operational overview and statistics.",
              appointments: "Manage and view all appointments.",
              myAppointments: "View and manage your personal appointments.",
              bookAppointment: "Schedule a new appointment for a patient or yourself.",
              manageAppointments: "Oversee and update all scheduled appointments.",
              patients: "Access and manage patient records.",
              patientDetails: "Detailed information for patient {patientName}.",
              calendar: "View and manage the clinic's appointment schedule.",
              reports: "Generate and view various clinic performance reports.",
              settings: "Configure application preferences and user settings.",
              profile: "View and update your personal profile information."
            }
          }
        }
      }
    },
    fr: {
      common: {
        loading: "Chargement...",
        error: "Erreur",
        success: "Succès",
        cancel: "Annuler",
        confirm: "Confirmer",
        save: "Enregistrer",
        edit: "Modifier",
        delete: "Supprimer",
        back: "Retour",
        next: "Suivant",
        previous: "Précédent",
        search: "Rechercher",
        filter: "Filtrer",
        sort: "Trier",
        welcome: "Bienvenue",
        with: "avec",
        allRightsReserved: "Tous droits réservés.",
        reschedule: "Reprogrammer",
        backToTop: "[FR] Back to Top",
        patientPrefix: "[FR] Patient ID",
        servicePrefix: "[FR] Service ID",
        viewAll: "[FR] View All",
        details: "[FR] Details",
        today: "[FR] Today",
        tomorrow: "[FR] Tomorrow",
        inXDays: "[FR] In {count} days",
        past: "[FR] Past",
        more: "[FR] More",
        less: "[FR] Less",
        allStatuses: "[FR] All Statuses",
        appName: "[FR] DentaCare",
        appSubtitle: "[FR] Dental Clinic Management"
      },
      nav: {
        dashboard: "Tableau de bord",
        appointments: "Rendez-vous",
        profile: "Profil",
        settings: "Paramètres",
        logout: "Déconnexion",
        login: "Connexion",
        register: "S'inscrire"
      },
      auth: {
        subtitle: "Gestion professionnelle des soins dentaires",
        login: {
          title: "Connectez-vous à votre compte",
          subtitle: "Bienvenue sur DentaCare",
          email: "Adresse e-mail",
          password: "Mot de passe",
          submit: "Se connecter",
          submitting: "Connexion...",
          forgotPassword: "Mot de passe oublié ?",
          noAccount: "Vous n'avez pas de compte ?",
          createAccount: "Créez-en un ici",
          orContinueWith: "Ou continuer avec",
          google: "Continuer avec Google",
          success: "Connexion réussie !",
          error: "Identifiants invalides. Veuillez réessayer.",
          emailPlaceholder: "[FR] Enter your email address",
          passwordPlaceholder: "[FR] Enter your password"
        },
        register: {
          title: "Créez votre compte",
          subtitle: "Rejoignez DentaCare aujourd'hui",
          fullName: "Nom complet",
          email: "Adresse e-mail",
          phone: "Numéro de téléphone",
          password: "Mot de passe",
          confirmPassword: "Confirmer le mot de passe",
          submit: "Créer un compte",
          submitting: "Création du compte...",
          hasAccount: "Vous avez déjà un compte ?",
          signIn: "Connectez-vous ici",
          success: "Compte créé avec succès ! Veuillez vous connecter.",
          error: "Échec de l'inscription. Veuillez réessayer.",
          fullNamePlaceholder: "[FR] Enter your full name",
          emailPlaceholder: "[FR] Enter your email address",
          phonePlaceholder: "[FR] Enter your phone number",
          passwordPlaceholder: "[FR] Create a password",
          confirmPasswordPlaceholder: "[FR] Confirm your password"
        }
      },
      dashboard: {
        title: "Tableau de bord",
        welcome: "Bon retour, {name}",
        subtitle: "Voici ce qui se passe avec vos rendez-vous",
        stats: {
          upcoming: "À venir",
          completed: "Terminés",
          cancelled: "Annulés",
          total: "Total"
        },
        quickActions: {
          title: "Actions rapides",
          bookAppointment: "Prendre rendez-vous",
          viewAppointments: "Voir les rendez-vous",
          manageAppointments: "Gérer tous les rendez-vous"
        }
      },
      appointments: {
        title: "Rendez-vous",
        myAppointments: "Mes rendez-vous",
        bookNew: "Nouveau rendez-vous",
        upcoming: "À venir",
        history: "Historique",
        noUpcoming: "Vous n'avez aucun rendez-vous à venir.",
        noHistory: "Vous n'avez aucun rendez-vous passé.",
        status: {
          scheduled: "Programmé",
          completed: "Terminé",
          cancelled: "Annulé",
          confirmed: "Confirmé"
        },
        booking: {
          title: "Prendre un nouveau rendez-vous",
          subtitle: "Remplissez les détails ci-dessous pour planifier votre visite",
          service: "Sélectionner un service",
          selectService: "Veuillez sélectionner un service",
          date: "Date",
          time: "Heure",
          submit: "Confirmer la réservation",
          submitting: "Planification...",
          success: "Rendez-vous réservé avec succès !",
          error: "Impossible de réserver le rendez-vous. Veuillez réessayer."
        },
        services: {
          checkup: "Contrôle annuel et nettoyage",
          whitening: "Blanchiment des dents",
          filling: "Plombage de carie",
          rootCanal: "Traitement de canal",
          extraction: "Extraction de dent de sagesse",
          consultation: "Consultation",
          emergency: "Visite d'urgence"
        }
      },
      theme: {
        light: "Clair",
        dark: "Sombre",
        system: "Système"
      },
      notification: {
        login: {
          failedTitle: "[FR] Login Failed"
        },
        logout: {
          successTitle: "[FR] Logged Out",
          successMessage: "[FR] You have been successfully logged out.",
          failedTitle: "[FR] Logout Failed",
          failedMessage: "[FR] Logout failed. Please try again."
        }
      },
      component: {
        appointmentCard: {
          withDoctor: "[FR] With Dr. {doctorName}"
        },
        chatBot: {
          title: "[FR] Chat Assistant", // Existing, keep
          send: "[FR] Send", // Existing, keep
          tooltip: "[FR] Chat with us!",
          openChatLabel: "[FR] Open chat",
          assistantName: "[FR] DentaCare Assistant",
          greeting: "[FR] We're here to help!", // Updated value for greeting
          prompt: "[FR] Ask about our services or prices!",
          userLabel: "[FR] You",
          botLabel: "[FR] Bot",
          typing: "[FR] Bot is typing...",
          inputPlaceholder: "[FR] Ask me anything about your appointment...", // Replaces old 'placeholder'
          initialMessage: "[FR] Hello! How can I help you with our services, appointments, or prices today?"
        },
        passwordInput: {
          show: "[FR] Show password",
          hide: "[FR] Hide password",
          strength: {
            weak: "[FR] Weak password",
            fair: "[FR] Fair password",
            good: "[FR] Good password",
            strong: "[FR] Strong password",
            default: "[FR] Enter a password"
          },
          requirements: {
            minLength: "[FR] At least 8 characters",
            number: "[FR] Contains a number",
            symbol: "[FR] Contains a symbol",
            uppercase: "[FR] Contains uppercase letter"
          },
          match: {
            passwordsMatch: "[FR] Passwords match",
            passwordsDoNotMatch: "[FR] Passwords do not match"
          }
        }
      },
      page: {
        error: {
          title: "[FR] Error",
          defaultMessage: "[FR] An unexpected error occurred.",
          backHome: "[FR] Back to Homepage"
        },
        index: {
          mainTitle: "[FR] Comprehensive Dental Care Platform",
          mainSubtitle: "[FR] Manage appointments, patients, and staff efficiently.",
          stats: {
            thisMonth: "[FR] This Month"
          },
          staffDashboard: {
            title: "[FR] Staff Dashboard",
            subtitle: "[FR] Overview of clinic operations and upcoming tasks.",
            schedule: "[FR] My Schedule",
            managePatients: "[FR] Manage Patients",
            viewReports: "[FR] View Reports"
          },
          clientDashboard: {
            title: "[FR] Patient Portal",
            subtitle: "[FR] Access your appointment history and manage your profile.",
            myAppointments: "[FR] My Appointments",
            bookNew: "[FR] Book New Appointment",
            myProfile: "[FR] My Profile"
          },
          upcomingAppointments: {
            title: "[FR] Upcoming Appointments",
            viewDetails: "[FR] View Details",
            noAppointments: "[FR] No upcoming appointments."
          }
        },
        calendar: {
          title: "[FR] Appointment Calendar",
          month: "[FR] Month",
          week: "[FR] Week",
          day: "[FR] Day",
          today: "[FR] Today",
          view: "[FR] View",
          newEvent: "[FR] New Event",
          eventDetails: "[FR] Appointment Details"
        },
        patients: {
          title: "[FR] Patient Management",
          list: "[FR] Patient List",
          addPatient: "[FR] Add New Patient",
          searchPlaceholder: "[FR] Search patients by name or ID",
          id: "[FR] Patient ID",
          name: "[FR] Name",
          email: "[FR] Email",
          phone: "[FR] Phone",
          totalAppointments: "[FR] Total Appointments",
          lastVisit: "[FR] Last Visit",
          noPatients: "[FR] No patients found.",
          details: {
            title: "[FR] Patient Details",
            personalInfo: "[FR] Personal Information",
            appointmentHistory: "[FR] Appointment History",
            bookAppointment: "[FR] Book New Appointment"
          }
        },
        reports: {
          title: "[FR] Reports",
          generateReport: "[FR] Generate Report",
          appointmentTrends: "[FR] Appointment Trends",
          financialSummary: "[FR] Financial Summary",
          patientDemographics: "[FR] Patient Demographics",
          selectDateRange: "[FR] Select Date Range",
          exportPdf: "[FR] Export as PDF",
          exportCsv: "[FR] Export as CSV"
        },
        settings: {
          title: "[FR] Settings",
          sections: {
            profile: "[FR] Profile Settings",
            account: "[FR] Account Settings",
            notifications: "[FR] Notification Preferences",
            theme: "[FR] Theme Settings",
            language: "[FR] Language Settings"
          },
          profile: {
            updateSuccess: "[FR] Profile updated successfully.",
            updateError: "[FR] Failed to update profile."
          },
          account: {
            changePassword: "[FR] Change Password",
            newPassword: "[FR] New Password",
            confirmNewPassword: "[FR] Confirm New Password",
            passwordChangedSuccess: "[FR] Password changed successfully.",
            passwordChangedError: "[FR] Failed to change password."
          },
          notifications: {
            emailNotifications: "[FR] Email Notifications",
            smsNotifications: "[FR] SMS Notifications",
            pushNotifications: "[FR] Push Notifications",
            appointmentReminders: "[FR] Appointment Reminders",
            promotionalUpdates: "[FR] Promotional Updates"
          },
          language: {
            selectLanguage: "[FR] Select Language"
          }
        },
        appointments: {
          manage: {
            title: "[FR] Manage All Appointments",
            searchPlaceholder: "[FR] Search by patient name, doctor, or status",
            filterByStatus: "[FR] Filter by Status",
            rescheduleAppointment: "[FR] Reschedule Appointment",
            cancelAppointment: "[FR] Cancel Appointment",
            confirmAppointment: "[FR] Confirm Appointment",
            appointmentUpdated: "[FR] Appointment updated successfully.",
            appointmentCancelled: "[FR] Appointment cancelled."
          },
          my: {
            title: "[FR] My Appointments",
            reschedule: "[FR] Reschedule",
            cancel: "[FR] Cancel",
            viewDetails: "[FR] View Details"
          },
          new: {
            title: "[FR] Book New Appointment",
            selectDoctor: "[FR] Select Doctor (Optional)",
            notes: "[FR] Additional Notes (Optional)",
            placeholderNotes: "[FR] E.g., preferred contact method, specific concerns"
          }
        },
        layouts: {
          auth: {
            footer: "[FR] &copy; {year} DentaCare. Your smile, our priority."
          },
          default: {
            logoutConfirm: {
              title: "[FR] Confirm Logout",
              message: "[FR] Are you sure you want to log out?"
            },
            sidebar: {
              patients: "[FR] Patients",
              calendar: "[FR] Calendar",
              reports: "[FR] Reports",
              settings: "[FR] Settings"
            },
            userRoleDefault: "[FR] User",
            pageTitles: {
              dashboard: "[FR] Overview",
              appointments: "[FR] Appointments",
              myAppointments: "[FR] My Appointments",
              bookAppointment: "[FR] Book New Appointment",
              manageAppointments: "[FR] Manage All Appointments",
              patients: "[FR] Patient Directory",
              patientDetails: "[FR] Patient Details",
              calendar: "[FR] Clinic Calendar",
              reports: "[FR] Clinic Reports",
              settings: "[FR] Application Settings",
              profile: "[FR] My Profile"
            },
            pageSubtitles: {
              dashboard: "[FR] Main operational overview and statistics.",
              appointments: "[FR] Manage and view all appointments.",
              myAppointments: "[FR] View and manage your personal appointments.",
              bookAppointment: "[FR] Schedule a new appointment for a patient or yourself.",
              manageAppointments: "[FR] Oversee and update all scheduled appointments.",
              patients: "[FR] Access and manage patient records.",
              patientDetails: "[FR] Detailed information for patient {patientName}.",
              calendar: "[FR] View and manage the clinic's appointment schedule.",
              reports: "[FR] Generate and view various clinic performance reports.",
              settings: "[FR] Configure application preferences and user settings.",
              profile: "[FR] View and update your personal profile information."
            }
          }
        }
      }
    }
  }
})
