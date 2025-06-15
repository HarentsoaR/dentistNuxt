<template>
  <div>
    <!-- Floating Chat Button with Pulse and Tooltip -->
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <transition name="fade-slide-chat">
        <div v-if="!chatStore.isChatOpen" class="mb-2">
          <div class="bg-white px-3 py-2 rounded-lg shadow-lg text-gray-700 text-xs font-medium mb-2 animate-fade-in-up">Chat with us!</div>
        </div>
      </transition>
      <button
        @click="handleToggleChat"
        class="bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full p-4 shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 transition-transform animate-bounce-pulse relative"
        aria-label="Open chat"
      >
        <svg v-if="!chatStore.isChatOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <!-- Chat Window -->
      <transition name="slide-bounce-chat">
        <div v-if="chatStore.isChatOpen" class="mt-4 w-80 max-w-full h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up">
          <!-- Header -->
          <div class="p-4 bg-gradient-to-r from-teal-600 to-cyan-500 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg class="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.104-.672-2-1.5-2S9 9.896 9 11s.672 2 1.5 2S12 12.104 12 11zm6 2c0-1.104-.672-2-1.5-2S15 11.896 15 13s.672 2 1.5 2S18 14.104 18 13zm-12 0c0-1.104-.672-2-1.5-2S3 11.896 3 13s.672 2 1.5 2S6 14.104 6 13z"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white leading-tight">DentaCare Assistant</h3>
              <p class="text-xs text-cyan-100">We're here to help!</p>
            </div>
          </div>

          <!-- Messages Area -->
          <div ref="messagesContainer" class="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
            <div v-if="chatStore.messages.length === 0 && !chatStore.isLoading" class="text-center text-gray-500 pt-10 animate-fade-in">
              <svg class="h-12 w-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              Ask about our services or prices!
            </div>
            <transition-group name="msg-fade-slide" tag="div">
              <div v-for="message in chatStore.messages" :key="message.id" class="flex w-full" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
                <div
                  class="max-w-[75%] px-4 py-2 rounded-2xl shadow-md mb-2 animate-fade-in"
                  :class="{
                    'bg-gradient-to-r from-teal-500 to-cyan-500 text-white self-end': message.sender === 'user',
                    'bg-white text-gray-700 border border-gray-200 self-start': message.sender === 'bot',
                  }"
                >
                  <p class="text-sm" v-html="message.text.replace(/\n/g, '<br />')"></p>
                  <p class="text-xs mt-1" :class="message.sender === 'user' ? 'text-cyan-100 text-right' : 'text-gray-400 text-left'">
                    {{ message.sender === 'user' ? 'You' : 'Bot' }} - {{ formatTimestamp(message.timestamp) }}
                  </p>
                </div>
              </div>
            </transition-group>
            <div v-if="chatStore.isLoading" class="flex justify-start animate-fade-in">
              <div class="max-w-[75%] px-4 py-3 rounded-2xl shadow bg-gray-200 text-gray-500 flex items-center gap-2">
                <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
                <span class="ml-2 text-xs">Bot is typing...</span>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <form @submit.prevent="handleSendMessage" class="p-3 border-t border-gray-200 bg-white">
            <div class="flex items-center space-x-2">
              <input
                ref="messageInput"
                type="text"
                v-model="newMessage"
                placeholder="Ask me anything about your appointment..."
                class="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm"
                :disabled="chatStore.isLoading"
              />
              <button
                type="submit"
                class="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 disabled:opacity-50 transition-transform"
                :disabled="chatStore.isLoading || !newMessage.trim()"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>
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

/* Animations */
@keyframes bouncePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
  50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(13, 148, 136, 0.15); }
}
.animate-bounce-pulse {
  animation: bouncePulse 1.5s infinite;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

/* Chat window slide-in */
.slide-bounce-chat-enter-active, .slide-bounce-chat-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-bounce-chat-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}
.slide-bounce-chat-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

/* Chat button fade/slide */
.fade-slide-chat-enter-active, .fade-slide-chat-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-chat-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-chat-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Message fade/slide */
.msg-fade-slide-enter-active, .msg-fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.msg-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.msg-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Typing indicator dots */
.typing-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 2px;
  background: #38bdf8;
  border-radius: 50%;
  animation: typingBlink 1.2s infinite both;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBlink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}
</style>