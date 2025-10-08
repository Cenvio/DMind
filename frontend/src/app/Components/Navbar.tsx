'use client'
import { useState } from 'react'
import { Menu, X, Github } from 'lucide-react'
import githubLogin from '@/app/lib/auth'
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {!isOpen && (
        <button onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      )}

      {isOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black bg-opacity-50 z-30"/>}

      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">DocuMind</h1>
            <button onClick={toggleSidebar} className="p-1 text-gray-600 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-4">
            <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              1
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              2
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              3
            </button>
          </nav>
          <div className="absolute bottom-6 left-6 right-6">
            <button  onClick={githubLogin}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors">
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    </>
  )
}