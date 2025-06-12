// stores/auth.ts
import { defineStore } from 'pinia';

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
  const token = useCookie<string | null>('auth_token'); // Persists in cookies

  // GETTERS
  const isAuthenticated = computed(() => !!token.value && !!user.value); // Make this more robust
  const userRole = computed(() => user.value?.role);

  // ACTIONS
  async function register(payload: any) {
    await $fetch('http://localhost:8080/auth/register', {
      method: 'POST',
      body: payload
    });
  }

  async function login(payload: any) {
    const response: any = await $fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      body: payload
    });

    token.value = response.token;
    user.value = response.user;
  }

  function logout() {
    token.value = null;
    user.value = null;
    // Redirect to login page to ensure clean state
    navigateTo('/auth/login');
  }

  // --- THIS IS THE NEW FUNCTION THAT FIXES THE ERROR ---
  // This action will be called by a plugin when the app starts.
  async function initializeAuth() {
    if (token.value && !user.value) {
      try {
        // Fetch the user data using the existing token
        const userData = await $fetch<User>('http://localhost:8080/api/user/me', {
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