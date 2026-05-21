import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* 1. SIDEBAR: Fixed width */}
      <aside className="w-64 flex-shrink-0 bg-[#001E2B] h-full hidden md:block">
        <Sidebar />
      </aside>

      {/* 2. CONTENT WRAPPER */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* NAVBAR: Fixed at top */}
        <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0 z-20">
          <Navbar />
        </header>

        {/* MAIN SCROLL AREA: Removed max-w-6xl to allow widespread content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Using w-full ensures it stretches to the edges */}
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout