// src/components/Editor.js
"use client"
import { useEffect, useState, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { v4 as uuidv4 } from "uuid"

// Import menu bar icons
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaCode,
  FaParagraph,
  FaHeading,
  FaListOl,
  FaListUl,
  FaQuoteLeft,
  FaRedo,
  FaUndo,
  FaFont,
  FaPalette
} from "react-icons/fa"

export default function Editor({ username }) {
  const ydocRef = useRef(null)
  const providerRef = useRef(null)
  const [users, setUsers] = useState([])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Collaboration.configure({
        document: (() => {
          const ydoc = new Y.Doc()
          ydocRef.current = ydoc
          return ydoc
        })()
      }),
      CollaborationCursor.configure({
        provider: (() => {
          const provider = new WebsocketProvider("wss://demos.yjs.dev", "tiptap-room", ydocRef.current)
          providerRef.current = provider
          return provider
        })(),
        user: {
          name: username,
          color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`
        }
      })
    ],
    content: '<p>Start typing here...</p>',
  })

  useEffect(() => {
    if (!providerRef.current) return

    const provider = providerRef.current
    provider.awareness.setLocalStateField("user", {
      name: username,
      color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`,
      id: uuidv4()
    })

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.map(s => s.user))
    }

    provider.awareness.on("change", updateUsers)
    updateUsers()

    return () => {
      provider.destroy()
      ydocRef.current?.destroy()
    }
  }, [])

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="p-4 h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Collaborative Editor</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm">Active users:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {users.map((user, index) => (
                <div
                  key={user.id || index}
                  className="px-3 py-1 text-sm rounded-full shadow-sm flex items-center gap-2"
                  style={{ 
                    backgroundColor: user.color,
                    color: getContrastColor(user.color)
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                  {user.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
          {/* Menu Bar */}
          <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200">
            {/* Text Formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
              title="Bold"
            >
              <FaBold className="text-gray-700" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
              title="Italic"
            >
              <FaItalic className="text-gray-700" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
              title="Underline"
            >
              <FaUnderline className="text-gray-700" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
              title="Strikethrough"
            >
              <FaStrikethrough className="text-gray-700" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
              title="Code"
            >
              <FaCode className="text-gray-700" />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            {/* Headings */}
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
              title="Heading 1"
            >
              <FaHeading className="text-gray-700" />
              <span className="text-xs ml-1">1</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
              title="Heading 2"
            >
              <FaHeading className="text-gray-700" />
              <span className="text-xs ml-1">2</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
              title="Heading 3"
            >
              <FaHeading className="text-gray-700" />
              <span className="text-xs ml-1">3</span>
            </button>
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('paragraph') ? 'bg-gray-200' : ''}`}
              title="Paragraph"
            >
              <FaParagraph className="text-gray-700" />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            {/* Lists */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
              title="Bullet List"
            >
              <FaListUl className="text-gray-700" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
              title="Numbered List"
            >
              <FaListOl className="text-gray-700" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
              title="Blockquote"
            >
              <FaQuoteLeft className="text-gray-700" />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            {/* Undo/Redo */}
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Undo"
            >
              <FaUndo className="text-gray-700" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Redo"
            >
              <FaRedo className="text-gray-700" />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            {/* Link */}
            <button
              onClick={setLink}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
              title="Link"
            >
              <FaFont className="text-gray-700" />
            </button>

            {/* Text Color - Ensures black text */}
            <button
              onClick={() => editor.chain().focus().setColor('#000000').run()}
              className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('textStyle', { color: '#000000' }) ? 'bg-gray-200' : ''}`}
              title="Black Text"
            >
              <FaPalette className="text-gray-700" />
              <span className="text-xs ml-1">Black</span>
            </button>
          </div>

          {/* Editor Content */}
          <EditorContent 
            editor={editor} 
            className="prose prose-sm sm:prose-base focus:outline-none max-w-none p-6 min-h-[400px] text-black"
          />
        </div>
      </div>
    </div>
  )
}

function getContrastColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(4, 2), 16)
  const g = parseInt(hexColor.substr(6, 2), 16)
  const b = parseInt(hexColor.substr(8, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
}