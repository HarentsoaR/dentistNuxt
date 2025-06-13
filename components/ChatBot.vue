<template>
    <div class="fixed bottom-5 right-5 z-50">
      <!-- Chat Toggle Button -->
      <button
        @click="handleToggleChat"
        class="bg-teal-600 text-white rounded-full p-4 shadow-lg hover:bg-teal-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        <svg v-if="!chatStore.isChatOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
  
      <!-- Chat Window -->
      <transition
        enter-active-class="transition ease-out duration-300 transform"
        enter-from-class="opacity-0 translate-y-10 scale-90"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition ease-in duration-200 transform"
        leave-from-class="opacity-0 translate-y-10 scale-90"
      >
        <div v-if="chatStore.isChatOpen" class="absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="p-4 bg-teal-600 text-white flex items-center gap-3">
            <Icon name="heroicons:chat-bubble-left-right-solid" class="h-6 w-6" />
            <h3 class="text-lg font-semibold">DentaCare Assistant</h3>
          </div>
  
          <!-- Messages Area -->
          <div ref="messagesContainer" class="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
            <div v-if="chatStore.messages.length === 0 && !chatStore.isLoading" class="text-center text-gray-500 pt-10">
                <Icon name="heroicons:sparkles" class="h-12 w-12 text-gray-300 mx-auto mb-2" />
                Ask about our services or prices!
            </div>
            <div v-for="message in chatStore.messages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
              <div
                class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow"
                :class="{
                  'bg-teal-500 text-white': message.sender === 'user',
                  'bg-white text-gray-700 border border-gray-200': message.sender === 'bot',
                }"
              >
                <p class="text-sm" v-html="message.text.replace(/\n/g, '<br />')"></p>
                <p class="text-xs mt-1" :class="message.sender === 'user' ? 'text-teal-100 text-right' : 'text-gray-400 text-left'">
                  {{ message.sender === 'user' ? 'You' : 'Bot' }} - {{ formatTimestamp(message.timestamp) }}
                </p>
              </div>
            </div>
            <div v-if="chatStore.isLoading" class="flex justify-start">
              <div class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow bg-gray-200 text-gray-500 animate-pulse">
                <p class="text-sm">Bot is typing...</p>
              </div>
            </div>
          </div>
  
          <!-- Input Area -->
          <form @submit.prevent="handleSendMessage" class="p-4 border-t border-gray-200 bg-white">
            <div class="flex items-center space-x-2">
              <input
                ref="messageInput"
                type="text"
                v-model="newMessage"
                placeholder="Type your message..."
                class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                :disabled="chatStore.isLoading"
              />
              <button
                type="submit"
                class="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                :disabled="chatStore.isLoading || !newMessage.trim()"
              >
                <Icon name="heroicons:paper-airplane" class="h-6 w-6" />
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>
</template>
  
<script setup>
import { ref, nextTick, watch } from 'vue';
import { useChatStore } from '~/stores/chat';
  
const chatStore = useChatStore();
  
const newMessage = ref('');
const messagesContainer = ref(null);
const messageInput = ref(null);
  
const formatTimestamp = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
  
const scrollToBottom = () => {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    });
  }
};
  
watch(() => chatStore.messages.length, scrollToBottom);
  
watch(() => chatStore.isChatOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      messageInput.value?.focus();
      scrollToBottom();
      if (chatStore.messages.length === 0 && !chatStore.isLoading) {
        chatStore.addMessage("Hello! How can I help you with our services, appointments, or prices today?", "bot");
      }
    });
  }
});
  
const handleToggleChat = () => {
  chatStore.toggleChat();
};
  
const handleSendMessage = async () => {
  const trimmedMessage = newMessage.value.trim();
  if (!trimmedMessage) return;
  
  // Call the store action, which handles all the logic
  await chatStore.sendMessage(trimmedMessage);
  
  newMessage.value = '';
  nextTick(() => messageInput.value?.focus());
};
</script>
  
<style scoped>
.overflow-y-auto { scroll-behavior: smooth; }
</style>