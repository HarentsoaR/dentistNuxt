// stores/chat.ts
import { defineStore } from 'pinia';

// Define the structure of a single message
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Define the store using the setup function style
export const useChatStore = defineStore('chat', () => {
  // --- STATE (like the `state` property in the Options API) ---
  const isChatOpen = ref(false);
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);

  // --- ACTIONS (like the `actions` property) ---

  function toggleChat() {
    isChatOpen.value = !isChatOpen.value;
  }

  // A helper function to add a new message to the state
  function addMessage(text: string, sender: 'user' | 'bot') {
    messages.value.push({
      id: `msg_${Date.now()}_${Math.random()}`, // A slightly more unique ID
      text,
      sender,
      timestamp: new Date(),
    });
  }

  async function sendMessage(userMessage: string) {
    // Prevent sending empty messages
    if (!userMessage.trim()) return;

    // Add the user's message to the chat window immediately
    addMessage(userMessage, 'user');
    
    // Show the "Bot is typing..." indicator
    isLoading.value = true;

    try {
      // Get the auth token to talk to the protected backend endpoint
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error("User is not authenticated.");
      }

      // Call your Go backend API
      const response = await $fetch<{ message: string; success: boolean }>('/api/chat', {
        method: 'POST',
        baseURL: 'http://localhost:8080',
        body: {
          message: userMessage,
        },
        // ** THIS IS THE CRUCIAL PART FOR YOUR PROTECTED API **
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`,
        },
      });

      // Add the bot's response from the backend
      if (response.success && response.message) {
        addMessage(response.message, 'bot');
      } else {
        addMessage("Sorry, I received an unusual response. Please try again.", 'bot');
      }

    } catch (error) {
      console.error("Chat API error:", error);
      addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
    } finally {
      // Hide the "Bot is typing..." indicator
      isLoading.value = false;
    }
  }

  function clearChat() {
    messages.value = [];
  }

  // Expose all state and actions so components can use them
  return {
    isChatOpen,
    messages,
    isLoading,
    toggleChat,
    addMessage,
    sendMessage,
    clearChat,
  };
});