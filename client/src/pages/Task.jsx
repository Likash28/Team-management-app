import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  User,
  Clock,
  Calendar,
  ChevronDown
} from 'lucide-react'
import API from '../api/axios'
import CommentSection from '../components/CommentSection'
import { toast } from 'react-toastify'

const Task = () => {
  const { workspaceId, taskId } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [primaryQuery, setPrimaryQuery] = useState('')
  const [secondaryQuery, setSecondaryQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeDropdown, setActiveDropdown] = useState(null)

  const [workspaceMembers, setWorkspaceMembers] = useState([])

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true)
        const { data } = await API.get(`/tasks/${workspaceId}/${taskId}`)
        setTask(data)
        setPrimaryQuery(data.primaryAssignee?.name || '')
        setSecondaryQuery(data.secondaryAssignee?.name || '')
      } catch (err) {
        toast.error("Task not found")
        navigate(`/workspace/${workspaceId}`)
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [taskId, workspaceId, navigate])

  useEffect(() => {
    const fetchTaskAndMembers = async () => {
      try {
        setLoading(true);
        const { data: taskData } = await API.get(`/tasks/${workspaceId}/${taskId}`);
        setTask(taskData);
        setPrimaryQuery(taskData.primaryAssignee?.name || '');
        setSecondaryQuery(taskData.secondaryAssignee?.name || '');

        // @mention dropdown
        const { data: membersData } = await API.get(`/workspaces/${workspaceId}/members`);
        setWorkspaceMembers(membersData.filter(member => member.user).map(member => member.user));
      } catch (err) {
        toast.error("Task or Members not found");
        navigate(`/workspace/${workspaceId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskAndMembers();
  }, [taskId, workspaceId, navigate]);


  const updateField = async (fieldName, value) => {
    try {
      const { data } = await API.patch(`/tasks/${workspaceId}/${taskId}`, {
        [fieldName]: value
      })
      setTask(data)
      toast.success(`${fieldName} updated`)
    } catch (err) {
      toast.error("Update failed")
    }
  }

  useEffect(() => {
    const query = activeDropdown === 'primary' ? primaryQuery : secondaryQuery
    if (!activeDropdown || query.length < 1) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await API.get(`/workspaces/${workspaceId}/search-members?query=${query}`)
        setSuggestions(data)
      } catch (err) {
        console.error("Search failed", err)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [primaryQuery, secondaryQuery, activeDropdown, workspaceId])

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Done':
      case 'Pass':
        return 'bg-[#F0FDF4] text-[#166534]'; 
      case 'In Progress':
        return 'bg-blue-100 text-blue-600'; 
      case 'Fail':
        return 'bg-red-100 text-red-600'; 
      case 'Checked In':
        return 'bg-purple-100 text-purple-600'; 
      default:
        return 'bg-gray-100 text-gray-500'; 
    }
  };

  if (loading) return <div className="p-10 text-gray-400 animate-pulse">Syncing Task Board...</div>
  if (!task) return null

  return (
    <div className="w-full space-y-6 pb-20">
      <button
        onClick={() => navigate(`/workspace/${workspaceId}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-[#001E2B] transition-colors mb-4 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Workspace</span>
      </button>

      {/* MODIFIED: Changed min-h-[80vh] to a fixed h-[85vh] to trap the flexbox grid */}
      <div className="bg-white rounded-4xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row h-[85vh]">

        {/* MODIFIED: Added overflow-y-auto and custom-scrollbar so the left panel scrolls independently */}
        <div className="flex-[2.5] border-r border-gray-50 overflow-y-auto custom-scrollbar">
          <div className="p-8 bg-gray-50/50 border-b border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-gray-400 text-xs font-bold uppercase">
                <ClipboardList size={16} />
                <span>Task Item : #{task.numericId}</span>
              </div>

              {/* Refined Priority Selector */}
              <div className="relative group">
                <select
                  value={task.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                  className={`appearance-none text-[10px] font-black uppercase pl-4 pr-8 py-2 rounded-full border-none cursor-pointer outline-none shadow-sm transition-all ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                    task.priority === 'medium' ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-blue-100 text-blue-600'
                    }`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
              </div>
            </div>

            <input
              type="text"
              className="text-xl font-bold text-[#001E2B] bg-transparent border-none outline-none focus:ring-2 focus:ring-[#00ED64] rounded-xl w-full px-2 transition-all"
              defaultValue={task.title}
              onBlur={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="p-8 space-y-10">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</h3>
              <textarea
                className="w-full p-6 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-[#00ED64] min-h-12.5 outline-none text-[#001E2B] transition-all resize-none"
                defaultValue={task.description}
                onBlur={(e) => updateField('description', e.target.value)}
                placeholder="Write the technical requirements here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Primary Assignee', query: primaryQuery, setQuery: setPrimaryQuery, key: 'primaryAssignee', type: 'primary' },
                { label: 'Secondary Assignee', query: secondaryQuery, setQuery: setSecondaryQuery, key: 'secondaryAssignee', type: 'secondary' }
              ].map((field) => (
                <div key={field.type} className="space-y-3 relative">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{field.label}</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#00ED64] text-[#001E2B] transition-all"
                    value={field.query}
                    onChange={(e) => field.setQuery(e.target.value)}
                    onFocus={() => setActiveDropdown(field.type)}
                    placeholder="Search member..."
                  />
                  {activeDropdown === field.type && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {suggestions.map((user) => (
                        <button
                          key={user._id}
                          className="w-full text-left p-4 hover:bg-[#F0FDF4] flex flex-col border-b border-gray-50 last:border-0"
                          onClick={() => {
                            updateField(field.key, user._id)
                            field.setQuery(user.name)
                            setActiveDropdown(null)
                          }}
                        >
                          <span className="font-bold text-[#001E2B]">{user.name}</span>
                          <span className="text-xs text-gray-400">{user.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#00ED64]" /> Status Workflow
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Development', key: 'devStatus', options: ['Not Started', 'In Progress', 'Checked In', 'Done'] },
                  { label: 'Unit Test', key: 'unitTestStatus', options: ['Not Started', 'In Progress', 'Pass', 'Fail'] },
                  { label: 'SIT', key: 'sitStatus', options: ['Not Started', 'In Progress', 'Pass', 'Fail'] },
                  { label: 'UAT', key: 'uatStatus', options: ['Not Started', 'In Progress', 'Pass', 'Fail'] }
                ].map((phase) => (
                  <div key={phase.key} className="p-4 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col gap-2 relative group">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{phase.label}</span>
                    <div className="relative">
                      <select
                        value={task[phase.key]}
                        onChange={(e) => updateField(phase.key, e.target.value)}
                        className={`w-full appearance-none border-none rounded-xl text-[10px] font-black uppercase py-2.5 px-3 focus:ring-2 focus:ring-[#00ED64] cursor-pointer outline-none shadow-sm pr-8 transition-all ${getStatusStyles(task[phase.key])}`}
                      >
                        {phase.options.map(opt => (
                          <option key={opt} value={opt} className="bg-white text-black font-normal">
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MODIFIED: Added overflow-hidden to trap the comment scroll in the right column */}
        <div className="flex-1 bg-gray-50/20 p-8 flex flex-col overflow-hidden">
          
          {/* MODIFIED: Added flex-1 flex flex-col min-h-0 to make the internal comment list strictly scrollable */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 shrink-0">
              <MessageSquare size={18} /> Discussion
            </h3>

            <div className="flex-1 min-h-0">
              <CommentSection
                taskId={taskId}
                workspaceMembers={workspaceMembers}
              />
            </div>
          </div>

          {/* MODIFIED: Added shrink-0 and mt-6 so the bottom details don't get squished by the comments */}
          <div className="pt-6 border-t border-gray-100 space-y-6 shrink-0 mt-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Set Deadline
              </label>
              <input
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold text-[#001E2B] focus:ring-2 focus:ring-[#00ED64] outline-none shadow-sm transition-all cursor-pointer"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-2"><Clock size={12} /> Created On</span>
                <span className="font-bold text-[#001E2B]">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-2"><User size={12} /> Owner</span>
                <span className="font-bold text-[#001E2B]">{task.createdBy?.name}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Task