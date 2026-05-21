import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { MentionsInput, Mention } from 'react-mentions';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CommentSection = ({ taskId, workspaceMembers }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${taskId}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setComments([]);
    }
  };

  useEffect(() => { fetchComments(); }, [taskId]);

  const formatCommentDate = (date) => {
    const diffInHours = dayjs().diff(dayjs(date), 'hour');
    return diffInHours < 24 ? dayjs(date).format('hh:mm A') : dayjs(date).fromNow(true) + " ago";
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const mentionRegex = /@\[.*?\]\((.*?)\)/g;
    const mentions = [...newComment.matchAll(mentionRegex)].map(m => m[1]);

    try {
      const res = await API.post(`/comments/${taskId}`, { content: newComment, mentions });
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Post error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Input Area - Now uses bg-white for visibility */}
      <div className="relative bg-white p-1 rounded-2xl border-2 border-gray-100 focus-within:border-[#00ED64] transition-all flex items-center shadow-sm">
        <div className="flex-1">
          <MentionsInput
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share a thought..."
            className="syncnode-mentions"
            allowSuggestionsAboveCursor={true}
          >
            <Mention
              trigger="@"
              data={workspaceMembers.map(member => {
                const user = member.user || member;
                return { id: user._id, display: user.name };
              })}
              markup="@[__display__](__id__)"
              displayTransform={(id, display) => `@${display}`}
              className="bg-[#00ED64]/20 text-[#166534] font-bold rounded px-1"
            />
          </MentionsInput>
        </div>

        <button
          onClick={handlePostComment}
          className="mr-1 bg-[#001E2B] text-white p-2.5 rounded-full hover:bg-black transition-all active:scale-90 shadow-md shrink-0 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>

      {/* Scrollable Comment List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {comments.map(c => (
          <div key={c._id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className='flex justify-between items-center mb-2'>
              <span className="text-[10px] font-black uppercase text-[#001E2B] tracking-widest opacity-70">
                {c.user?.name || "Member"}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">
                {formatCommentDate(c.createdAt)}
              </span>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              {c.content.split(/(@\[.*?\]\(.*?\))/g).map((part, index) => {
                const mentionMatch = part.match(/@\[(.*?)\]\(.*?\)/);
                return mentionMatch ? (
                  <span key={index} className="text-[#166534] bg-[#F0FDF4] px-1.5 py-0.5 rounded-lg font-bold">
                    @{mentionMatch[1]}
                  </span>
                ) : part;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;