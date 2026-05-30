import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { ToastContainer } from 'react-toastify'

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <aside className="w-64 shrink-0 bg-[#001E2B] h-full hidden md:block">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 shrink-0 z-20">
          <Navbar />
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

export default DashboardLayout