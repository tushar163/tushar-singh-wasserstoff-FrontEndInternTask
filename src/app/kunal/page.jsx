'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import io from 'socket.io-client'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'


class SocketIOProvider {
    constructor(ydoc, socket, user, onSynced) {
        this.ydoc = ydoc
        this.socket = socket
        this.user = user
        this.onSynced = onSynced

        this.awareness = {
            states: new Map(),
            listeners: new Map(),
            localState: {},

            getLocalState: () => this.awareness.localState,

            setLocalState: (state) => {
                this.awareness.localState = state
                this.awareness.states.set(this.socket.id, state)
                this.socket.emit('awareness-update', {
                    clientId: this.socket.id,
                    state,
                })
                this._notifyListeners()
            },

            setLocalStateField: (key, value) => {
                const current = this.awareness.localState || {}
                const newState = { ...current, [key]: value }
                this.awareness.setLocalState(newState)
            },

            on: (event, callback) => {
                const listeners = this.awareness.listeners.get(event) || []
                listeners.push(callback)
                this.awareness.listeners.set(event, listeners)
            },

            off: (event, callback) => {
                const listeners = this.awareness.listeners.get(event) || []
                const index = listeners.indexOf(callback)
                if (index !== -1) listeners.splice(index, 1)
                this.awareness.listeners.set(event, listeners)
            },

            getStates: () => this.awareness.states,
        }

        this._notifyListeners = () => {
            const updateListeners = this.awareness.listeners.get('update') || []
            updateListeners.forEach((cb) => cb({ states: this.awareness.states }))
        }

        this.setupSocketListeners()
    }

    setupSocketListeners() {
        this.socket.on('document-state', (update) => {
            try {
                // Ensure update is binary
                const binaryUpdate =
                    update instanceof Uint8Array ? update : new Uint8Array(update)

                Y.applyUpdate(this.ydoc, binaryUpdate)
                console.log('✅ Document synced from server')
                this.onSynced?.()
            } catch (err) {
                console.error('Failed to apply Yjs update:', err)
            }
        })

        this.ydoc.on('update', (update) => {
            console.log('📤 Sending local document update to server')
            this.socket.emit('document-update', update)
        })

        this.socket.on('document-update', (update) => {
            try {
                const binaryUpdate = update instanceof Uint8Array ? update : new Uint8Array(update);
                Y.applyUpdate(this.ydoc, binaryUpdate);
            } catch (err) {
                console.error('Failed to apply live update:', err);
            }
        });


        this.socket.on('awareness-update', ({ clientId, state }) => {
            if (state) {
                this.awareness.states.set(clientId, state)
            } else {
                this.awareness.states.delete(clientId)
            }
            this._notifyListeners()
        })
    }

    disconnect() {
        this.socket.disconnect()
    }

    destroy() {
        this.socket.off('document-state')
        this.socket.off('awareness-update')
        this.socket.disconnect()
        this.ydoc?.destroy()
    }
}

export default function CollaborativeEditor() {
    const [username, setUsername] = useState('')
    const [userColor, setUserColor] = useState('')
    const [status, setStatus] = useState('disconnected')
    const [provider, setProvider] = useState(null)
    const [editorReady, setEditorReady] = useState(false)
    const [synced, setSynced] = useState(false)

    const ydoc = useRef(new Y.Doc())
    const socketRef = useRef(null)

    useEffect(() => {
        const name = prompt('Enter your name') || 'Anonymous'
        const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`

        setUsername(name)
        setUserColor(color)

        const socket = io('https://qkn06q73-3000.inc1.devtunnels.ms', {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket'],
            forceBase64: false,
        })

        socketRef.current = socket

        socket.on('connect', () => {
            setStatus('connected')

            const newProvider = new SocketIOProvider(
                ydoc.current,
                socket,
                { name, color },
                () => {
                    setSynced(true)
                }
            )

            setProvider(newProvider)
            setEditorReady(true)
        })

        socket.on('disconnect', () => {
            setStatus('disconnected')
        })

        return () => {
            socket?.disconnect()
            ydoc.current?.destroy()
        }
    }, [])

    if (!editorReady || !provider) {
        return <div className="p-6">Connecting to collaboration server...</div>
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Collaborative Editor</h1>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                        />
                        <span
                            className="px-3 py-1 rounded-md text-white"
                            style={{ backgroundColor: userColor }}
                        >
                            {username}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="border-b min-h-[500px] p-4">
                        {synced && provider ? (
                            <EditorWrapper
                                provider={provider}
                                username={username}
                                userColor={userColor}
                                ydoc={ydoc.current}
                            />
                        ) : (
                            <div>Connecting and syncing document...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function EditorWrapper({ provider, username, userColor, ydoc }) {
    CollaborationCursor.configure({
        provider,
        user: {
            name: username,
            color: userColor,
        },
        render: (user) => {
            const caret = document.createElement('span')
            caret.classList.add('cursor-caret')
            caret.style.borderLeft = `2px solid ${user.color}`
            caret.style.marginLeft = '-1px'
            caret.style.height = '1em'
            caret.style.display = 'inline-block'
            caret.style.position = 'relative'

            const nameTag = document.createElement('div')
            nameTag.textContent = user.name
            nameTag.style.position = 'absolute'
            nameTag.style.top = '-1.5em'
            nameTag.style.left = '0'
            nameTag.style.backgroundColor = user.color
            nameTag.style.color = '#fff'
            nameTag.style.padding = '2px 6px'
            nameTag.style.fontSize = '0.75rem'
            nameTag.style.borderRadius = '4px'
            nameTag.style.whiteSpace = 'nowrap'
            nameTag.style.zIndex = '100'

            caret.appendChild(nameTag)
            // return caret

            // Attach with tooltip
            // tippy(caret, {
            //     content: label,
            //     allowHTML: true,
            //     placement: 'top',
            //     arrow: false,
            //     duration: 0,
            // })


            return caret
        },
    })

    const editor = useEditor({
        extensions: [
            StarterKit,
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider,
                user: {
                    name: username,
                    color: userColor,
                },
                render: (user) => {
                    const cursor = document.createElement('span')
                    cursor.classList.add('cursor')
                    cursor.style.borderLeft = `2px solid ${user.color}`
                    cursor.style.marginLeft = '-1px'
                    cursor.style.height = '1em'
                    cursor.style.display = 'inline-block'

                    const label = document.createElement('div')
                    label.classList.add('cursor-label')
                    label.style.backgroundColor = user.color
                    label.style.color = 'white'
                    label.style.fontSize = '0.75rem'
                    label.style.padding = '2px 4px'
                    label.style.borderRadius = '4px'
                    label.textContent = user.name

                    tippy(cursor, {
                        content: label,
                        placement: 'top',
                        arrow: false,
                        duration: 0,
                    })

                    return cursor
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[500px] p-4',
            },
        },
    })

    if (!editor) return <div>Initializing editor...</div>

    return <EditorContent editor={editor} />
}
