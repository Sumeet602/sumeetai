import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"

const KEY = (conversationId) => `messages-${conversationId}`
const TTL = 24 * 60 * 60
const MAX = 20

const readList = (raw) => {
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : null
    } catch {
        return null
    }
}

export const getMemory = async (conversationId) => {
    const key = KEY(conversationId)

    const cached = readList(await redis.get(key))
    if (cached) return cached

    // Cache miss (or poisoned/non-array cache) -> rebuild from the chat service.
    const fromDb = await getMessages(conversationId)
    const messages = Array.isArray(fromDb)
        ? fromDb.map((m) => ({ role: m.role, content: m.content }))
        : []

    await redis.set(key, JSON.stringify(messages), "EX", TTL)
    return messages
}

export const addMessage = async (conversationId, role, content) => {
    const key = KEY(conversationId)

    const messages = readList(await redis.get(key)) || []
    messages.push({ role, content })

    const trimmed = messages.length > MAX ? messages.slice(-MAX) : messages
    await redis.set(key, JSON.stringify(trimmed), "EX", TTL)
}
