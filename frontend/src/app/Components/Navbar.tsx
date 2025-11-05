'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Home, GitBranch } from 'lucide-react'
import AuthButton from './auth/AuthButton'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navigate = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const isActive = (path: string) => pathname === path

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
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">DocuMind</h1>
            <button onClick={toggleSidebar} className="p-1 text-gray-600 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-2 flex-1">
            <button
              onClick={() => navigate('/dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/repositories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive('/repositories')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GitBranch className="w-5 h-5" />
              Repositories
            </button>
          </nav>
          <div className="pt-4 border-t">
            <AuthButton />
          </div>
        </div>
      </div>
    </>
  )
}