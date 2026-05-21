import { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

const Home = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const userName = localStorage.getItem('userName') || 'User';
  const menuRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const [totalCollaborators, setTotalCollaborators] = useState(0) 

  // FETCH REAL DATA FROM BACKEND
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await API.get('/workspaces');
        setWorkspaces(response.data.workspaces);
        setTotalCollaborators(response.data.totalUniqueCollaborators)
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = async () => {
    try {
      const { data } = await API.post('/workspaces', { name: newWorkspaceName });

      toast.success("Workspace created successfully!");

      // 2. Clear inputs and close modal
      setIsModalOpen(false);
      setNewWorkspaceName("");

      // 3. Navigate to the new workspace page using the new ID
      navigate(`/workspace/${data._id}`);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create workspace";
      toast.error(errorMsg);
    }
  };

  const handleCopyLink = (code) => {

    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin
    const link = `${baseUrl}/join/${code}`

    navigator.clipboard.writeText(link);
    toast.info("Invite URL copied!");
    setActiveMenu(null);
  };

  const totalTasks = workspaces.reduce((sum, ws) => sum + (ws.taskCount || 0), 0);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ED64]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#001E2B]">Welcome, {userName}!</h1>
          <p className="text-gray-500 mt-1">Today’s priorities at a glance.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#00ED64] text-[#001E2B] font-bold px-6 py-3 rounded-2xl hover:shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} />
          Create Workspace
        </button>
      </div>

      {/* Stats derived from Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Tasks</p>
          <h3 className="text-3xl font-bold mt-2">{totalTasks}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Workspaces</p>
          <h3 className="text-3xl font-bold mt-2">{workspaces.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Collaborators</p>
          <h3 className="text-3xl font-bold mt-2">{totalCollaborators}</h3>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workspaces.length > 0 ? (
          workspaces.map((ws) => (
            <div
              key={ws._id}
              onClick={() => navigate(`/workspace/${ws._id}`)}
              className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#00684A] font-bold text-xl">
                  {ws.name.charAt(0)}
                </div>

                {/* 3-Dot Dropdown Menu */}
                <div className="relative" ref={activeMenu === ws._id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents navigating to workspace
                      setActiveMenu(activeMenu === ws._id ? null : ws._id);
                    }}
                    className="text-gray-300 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {activeMenu === ws._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toast.info("Edit function coming soon!"); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        Edit Name
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyLink(ws.inviteCode); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#00684A] font-semibold hover:bg-gray-50"
                      >
                        Copy Invite Link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#001E2B]">{ws.name}</h3>
              <p className="text-gray-400 text-sm mt-1">Status: Active</p>

              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                <span>{ws.totalCount} Members</span>
                <span className="text-[#00ED64] font-bold group-hover:underline">Open →</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-20 bg-gray-50 rounded-4xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No workspaces found. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Workspace Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-4xl p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#001E2B]">Create Workspace</h2>
              <p className="text-gray-500 text-sm">Set up a new space for your team.</p>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#001E2B]">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Team"
                  className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-[#00ED64] transition-all"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2 opacity-60">
                <label className="text-sm font-semibold text-[#001E2B]">Owner</label>
                <input
                  type="text"
                  disabled
                  value={userName}
                  className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => { setIsModalOpen(false); setNewWorkspaceName(""); }}
                  className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim()}
                  className="flex-1 py-4 bg-[#00ED64] text-[#001E2B] font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;