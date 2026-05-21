import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus,
  ListTodo,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  X,
  Users as UsersIcon
} from 'lucide-react'
import API from '../api/axios'
import { toast } from 'react-toastify'

const Workspace = () => {
  const navigate = useNavigate()
  const { workspaceId } = useParams()

  const [workspaceName, setWorkspaceName] = useState("")
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState('list')
  const [activeFilters, setActiveFilters] = useState({})
  const [members, setMembers] = useState([])
  const [pendingMembers, setPendingMembers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)

  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [primaryAssigneeId, setPrimaryAssigneeId] = useState("")
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [hoveredUser, setHoveredUser] = useState(null)

  const currentUser = JSON.parse(localStorage.getItem('user'))
  const myMembership = members.find(m => m.user?._id === currentUser?._id)
  const isAdmin = myMembership?.role === 'admin' || myMembership?.role === 'owner'

  const fetchWorkspaceData = useCallback(async (filters = {}) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams(filters).toString()
      const tasksUrl = queryParams ? `/tasks/${workspaceId}?${queryParams}` : `/tasks/${workspaceId}`

      const [wsRes, taskRes, memberRes] = await Promise.all([
        API.get('/workspaces'),
        API.get(tasksUrl),
        API.get(`/workspaces/${workspaceId}/members`)
      ])

      const found = wsRes.data.workspaces?.find(ws => ws._id === workspaceId)
      setWorkspaceName(found ? found.name : "My Workspace")
      setTasks(taskRes.data)

      const allMembers = memberRes.data
      setMembers(allMembers.filter(m => m.status === 'active' || !m.status))
      setPendingMembers(allMembers.filter(m => m.status === 'pending'))

    } catch (err) {
      toast.error("Error syncing tasks")
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    if (workspaceId) fetchWorkspaceData()

    const handleOpenPending = () => setIsPendingModalOpen(true)
    window.addEventListener('openPendingRequests', handleOpenPending)
    return () => window.removeEventListener('openPendingRequests', handleOpenPending)
  }, [workspaceId, fetchWorkspaceData])

  const handleStatusUpdate = async (memberId, action) => {
    try {
      await API.patch(`/workspaces/${workspaceId}/members/${memberId}/status`, { action })
      toast.success(action === 'approve' ? "Member approved!" : "Request rejected")
      fetchWorkspaceData()
    } catch (err) {
      toast.error("Action failed")
    }
  }

  const handleFilterChange = (newFilter) => {
    const updatedFilters = { ...activeFilters, ...newFilter }
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === "") delete updatedFilters[key]
    })
    setActiveFilters(updatedFilters)
    fetchWorkspaceData(updatedFilters)
  }

  if (loading) return <div className="p-10 animate-pulse text-gray-400 text-center font-bold uppercase tracking-widest">Syncing Data Grid...</div>

  return (
    <div className="space-y-8 pb-20">
      <div className='flex justify-between items-end'>
        <div>
          <h1 className="text-3xl font-bold text-[#001E2B]">Welcome to {workspaceName}</h1>
          <p className="text-gray-400 mt-1 text-xs font-medium">Workspace ID: {workspaceId}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#00ED64] text-[#001E2B] font-bold px-6 py-3 rounded-2xl hover:shadow-lg transition-all active:scale-95">
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      {/* Pending Requests Modal (Overlay) */}
      {isPendingModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#001E2B]/40 backdrop-blur-md" onClick={() => setIsPendingModalOpen(false)}></div>
          <div className="bg-white/90 backdrop-blur-2xl border border-white max-w-2xl w-full rounded-[40px] shadow-2xl relative z-10 p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#001E2B] flex items-center gap-3">
                <UsersIcon className="text-[#00ED64]" /> Pending Access Requests
              </h2>
              <button onClick={() => setIsPendingModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-4 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
              {pendingMembers.length > 0 ? pendingMembers.map(req => (
                <div key={req._id} className="flex items-center justify-between bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                  <div>
                    <p className="font-bold text-[#001E2B]">{req.user?.name}</p>
                    <p className="text-xs text-gray-400">{req.user?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusUpdate(req._id, 'reject')} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">Reject</button>
                    <button onClick={() => handleStatusUpdate(req._id, 'approve')} className="px-4 py-2 text-xs font-bold bg-[#00ED64] text-[#001E2B] rounded-xl transition-all active:scale-95 shadow-sm hover:shadow-[#00ED64]/20">Approve</button>
                  </div>
                </div>
              )) : <p className="text-center text-gray-400 py-10">All caught up! No requests.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Control Bar with Phase Filters Restored */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-400 px-2 border-r border-gray-100 mr-1">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase">Filters</span>
          </div>

          {/* Assignee Filter */}
          <select
            value={activeFilters.primaryAssignee || ''}
            onChange={(e) => handleFilterChange({ primaryAssignee: e.target.value })}
            className="text-[11px] font-bold uppercase text-[#001E2B] outline-none bg-gray-50 px-3 py-2 rounded-xl cursor-pointer"
          >
            <option value="">Assignee: All</option>
            {members.map(m => <option key={m._id} value={m.user?._id}>{m.user?.name}</option>)}
          </select>

          {/* Development & Status Filters Restored */}
          {[
            { label: 'Dev', key: 'devStatus' },
            { label: 'Unit Test', key: 'unitTestStatus' },
            { label: 'SIT', key: 'sitStatus' },
            { label: 'UAT', key: 'uatStatus' }
          ].map((phase) => (
            <select
              key={phase.key}
              value={activeFilters[phase.key] || ''}
              onChange={(e) => handleFilterChange({ [phase.key]: e.target.value })}
              className="text-[11px] font-bold uppercase text-[#001E2B] outline-none bg-gray-50 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="">{phase.label}: All</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              {phase.key === 'devStatus' ? (
                <>
                  <option value="Checked In">Checked In</option>
                  <option value="Done">Done</option>
                </>
              ) : (
                <>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </>
              )}
            </select>
          ))}
        </div>

        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1">
          <button onClick={() => setViewType('grid')} className={`p-2 rounded-xl transition-all ${viewType === 'grid' ? 'bg-white text-[#001E2B] shadow-sm' : 'text-gray-400'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewType('list')} className={`p-2 rounded-xl transition-all ${viewType === 'list' ? 'bg-white text-[#001E2B] shadow-sm' : 'text-gray-400'}`}>
            <TableIcon size={18} />
          </button>
        </div>
      </div>

      {viewType === 'list' ? (
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-green-100 text-[11px] text-gray-700 uppercase font-black tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">ID</th>
                <th className="px-6 py-5">Task Title</th>
                <th className="px-6 py-5">Assignee</th>
                <th className="px-6 py-5">Development</th>
                <th className="px-6 py-5">Unit Test</th>
                <th className="px-6 py-5">SIT</th>
                <th className="px-6 py-5">UAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map(task => (
                <tr key={task._id} onClick={() => navigate(`/workspace/${workspaceId}/task/${task._id}`)} className="hover:bg-gray-100 cursor-pointer transition-colors group">
                  <td className="px-8 py-5 text-[12px] text-gray-500">#{task.numericId || 'N/A'}</td>
                  <td className="px-6 py-5 group-hover:text-[#00684A] font-bold">{task.title}</td>
                  <td className="px-6 py-5 text-[15px] tracking-tighter">{task.primaryAssignee?.name}</td>
                  <td className="px-6 py-5 text-[12px]"><StatusBadge status={task.devStatus} /></td>
                  <td className="px-6 py-5 text-[12px]"><StatusBadge status={task.unitTestStatus} /></td>
                  <td className="px-6 py-5 text-[12px]"><StatusBadge status={task.sitStatus} /></td>
                  <td className="px-6 py-5 text-[12px]"><StatusBadge status={task.uatStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ... Grid View Logic ... */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task._id} onClick={() => navigate(`/workspace/${workspaceId}/task/${task._id}`)} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:border-[#00ED64] transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#F0FDF4] p-3 rounded-2xl text-[#00684A]"><ListTodo size={20} /></div>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{task.priority}</span>
              </div>
              <h3 className="font-bold text-[#001E2B] mb-1 group-hover:text-[#00684A]">{task.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Not Started': return 'bg-red-50 text-red-500'
      case 'In Progress': return 'bg-yellow-50 text-yellow-600'
      case 'Done':
      case 'Pass': return 'bg-green-100 text-green-700'
      case 'Fail': return 'bg-red-500 text-white'
      default: return 'bg-gray-50 text-gray-400'
    }
  }
  return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyles(status)}`}>{status || 'Not Started'}</span>
}

export default Workspace