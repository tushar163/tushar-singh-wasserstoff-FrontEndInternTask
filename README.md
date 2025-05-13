# 📝 Real-Time Collaborative Editor

A basic real-time text editor built using **React**, **TypeScript**, **TailwindCSS**, **TipTap**, and **Yjs**. Multiple users can edit the same document simultaneously, with visible live updates and user indicators.

---

## 🚀 Features

- 🖋️ Real-time collaborative editing
- 🌐 Multi-tab/browser sync using **Socket.IO**
- 👤 User identity and presence (name + color)
- 💬 Live cursor positions with usernames
- 🛠️ Rich-text formatting via **TipTap** (bold, italic, lists, undo/redo)

---

## 📸 Demo

Live Link: [https://your-live-url.com](https://your-live-url.com)  
Try it in multiple tabs to test real-time sync!

---

## 📦 Tech Stack

- **ReactJS** with **TypeScript**
- **TailwindCSS** for UI
- **TipTap** (ProseMirror-based rich text editor)
- **Yjs** for shared CRDT document state
- **Socket.IO** for real-time transport
- **tippy.js** for tooltip/cursor rendering

---

## 🔧 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/realtime-editor.git
cd realtime-editor

# Install dependencies
npm install

# Start the client
npm run dev
