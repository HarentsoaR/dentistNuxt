// stores/auth.ts
import { defineStore } from 'pinia';
import { useChatStore } from '~/stores/chat';
import { useNotificationStore } from '~/stores/notification';




// Define the User structure based on your Go model
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string; // Optional phone number
}

export const useAuthStore = defineStore('auth', () => {
  // STATE
  const user = ref<User | null>(null);
  const token = useCookie<string | null>('auth_token', {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    secure: true,
    sameSite: 'strict'
  }); // Persists in cookies

  // GETTERS
  const isAuthenticated = computed(() => !!token.value && !!user.value); // Make this more robust
  const userRole = computed(() => user.value?.role);

  // ACTIONS
  async function register(payload: any) {
    const notificationStore = useNotificationStore();
    
    try {
      await $fetch('https://dentistapi-production-92f7.up.railway.app/auth/register', {
        method: 'POST',
        body: payload
      });

      notificationStore.success(
        'Registration Successful!',
        'Your account has been created successfully. Please sign in to continue.',
        5000
      );
    } catch (error: any) {
      notificationStore.error(
        'Registration Failed',
        error.data?.error || 'An error occurred during registration. Please try again.',
        5000
      );
      throw error;
    }
  }

  async function login(payload: any) {
    const response: any = await $fetch('https://dentistapi-production-92f7.up.railway.app/auth/login', {
      method: 'POST',
      body: payload
    });

    token.value = response.token;
    user.value = response.user;

    // Show welcome notification
    const notificationStore = useNotificationStore();
    notificationStore.success(
      'Welcome Back!',
      `Welcome back, ${user.value?.fullName || 'User'}! We're glad to see you again.`,
      5000
    );
  }

  async function logout() {
    const chatStore = useChatStore();
    
    try {
      // Clear the auth_token cookie by setting it to null and maxAge to 0
      token.value = null;
      // Force cookie removal by setting maxAge to 0
      const cookie = useCookie('auth_token', {
        maxAge: 0,
        path: '/',
        secure: true,
        sameSite: 'strict'
      });
      cookie.value = null;
      
      user.value = null;
      chatStore.clearChat();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  // --- THIS IS THE NEW FUNCTION THAT FIXES THE ERROR ---
  // This action will be called by a plugin when the app starts.
  async function initializeAuth() {
    if (token.value && !user.value) {
      try {
        // Fetch the user data using the existing token
        const userData = await $fetch<User>('https://dentistapi-production-92f7.up.railway.app/api/user/me', {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        });
        user.value = userData;
      } catch (error) {
        console.error("Session token is invalid or expired. Logging out.", error);
        // If the token is invalid, clear everything to be safe
        logout();
      }
    }
  }

  return { user, token, isAuthenticated, userRole, register, login, logout, initializeAuth };
});