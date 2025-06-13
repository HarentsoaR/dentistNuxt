import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  icon?: string
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  function add(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString()
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000 // Default 5 seconds
    }
    
    notifications.value.push(newNotification)

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newNotification.duration)
    }

    return id
  }

  function remove(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(title: string, message: string, duration?: number) {
    return add({
      type: 'success',
      title,
      message,
      duration,
      icon: 'heroicons:check-circle'
    })
  }

  function error(title: string, message: string, duration?: number) {
    return add({
      type: 'error',
      title,
      message,
      duration,
      icon: 'heroicons:exclamation-circle'
    })
  }

  function info(title: string, message: string, duration?: number) {
    return add({
      type: 'info',
      title,
      message,
      duration,
      icon: 'heroicons:information-circle'
    })
  }

  function warning(title: string, message: string, duration?: number) {
    return add({
      type: 'warning',
      title,
      message,
      duration,
      icon: 'heroicons:exclamation-triangle'
    })
  }

  return {
    notifications,
    add,
    remove,
    success,
    error,
    info,
    warning
  }
}) 