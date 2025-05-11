// pages/index.js
"use client"
import { useState } from "react"
import Editor from "@/components/Editor"

export default function Home() {
  const [username, setUsername] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="p-4">
      {!submitted ? (
        <form
          onSubmit={e => {
            e.preventDefault()
            if (username.trim()) setSubmitted(true)
          }}
          className="flex flex-col gap-3 max-w-sm mx-auto mt-20"
        >
          <label className="text-lg font-medium">Enter your username:</label>
          <input
            className="border p-2 rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. Alice"
          />
          <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            Join Editor
          </button>
        </form>
      ) : (
        <Editor username={username} />
      )}
    </main>
  )
}
