// import { useState, useEffect } from 'react'
// import { api } from '../../utils/api'
// import { useApp, useToast } from '../../contexts/AppContext'

// function timeAgo(dateStr) {
//   const diff = Date.now() - new Date(dateStr).getTime()
//   const mins = Math.floor(diff / 60000)
//   if (mins < 1) return 'just now'
//   if (mins < 60) return `${mins}m ago`
//   const hrs = Math.floor(mins / 60)
//   if (hrs < 24) return `${hrs}h ago`
//   return `${Math.floor(hrs / 24)}d ago`
// }

// export default function CommentsBox({ documentId }) {
//   const { state } = useApp()
//   const toast = useToast()
//   const [comments, setComments] = useState([])
//   const [users, setUsers] = useState([])
//   const [text, setText] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [posting, setPosting] = useState(false)
//   const [editingId, setEditingId] = useState(null)
//   const [editText, setEditText] = useState('')

//   useEffect(() => {
//     async function load() {
//       try {
//         const [c, u] = await Promise.all([api.getComments(documentId), api.getUsers()])
//         setComments(c)
//         setUsers(u)
//       } catch {
//         toast('Failed to load comments', 'error')
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [documentId])

//   function getUserName(id) {
//     const u = users.find(u => u.id === id)
//     return u ? u.name : 'Unknown User'
//   }
//   function getUserAvatar(id) {
//     const u = users.find(u => u.id === id)
//     return u?.avatar || '??'
//   }

//   async function handlePost(e) {
//     e.preventDefault()
//     if (!text.trim()) return
//     setPosting(true)
//     try {
//       const comment = await api.createComment({
//         documentId,
//         authorId: state.user.id,
//         content: text.trim(),
//         createdAt: new Date().toISOString(),
//         edited: false,
//       })
//       setComments(c => [...c, comment])
//       setText('')
//       toast('Comment posted!')
//     } catch {
//       toast('Failed to post comment', 'error')
//     } finally {
//       setPosting(false)
//     }
//   }

//   async function handleEdit(id) {
//     if (!editText.trim()) return
//     try {
//       const updated = await api.updateComment(id, { content: editText.trim(), edited: true })
//       setComments(c => c.map(cm => cm.id === id ? updated : cm))
//       setEditingId(null)
//       toast('Comment updated!')
//     } catch {
//       toast('Failed to update comment', 'error')
//     }
//   }

//   async function handleDelete(id) {
//     if (!window.confirm('Delete this comment?')) return
//     try {
//       await api.deleteComment(id)
//       setComments(c => c.filter(cm => cm.id !== id))
//       toast('Comment deleted')
//     } catch {
//       toast('Failed to delete comment', 'error')
//     }
//   }

//   if (loading) return <div className="loading-screen"><div className="spinner" /></div>

//   return (
//     <div data-testid="comments-box">
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//         <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)' }}>
//           Comments <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>({comments.length})</span>
//         </h3>
//       </div>

//       {comments.length === 0 ? (
//         <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)', fontSize: 13 }}>
//           No comments yet. Be the first to comment!
//         </div>
//       ) : (
//         <div className="comment-list">
//           {comments.map(c => (
//             <div key={c.id} className="comment-item">
//               <div className="avatar sm" style={{ fontSize: 9 }}>{getUserAvatar(c.authorId)}</div>
//               <div className="comment-bubble" style={{ flex: 1 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <span>
//                     <span className="comment-author">{getUserName(c.authorId)}</span>
//                     <span className="comment-time">{timeAgo(c.createdAt)}</span>
//                     {c.edited && <span style={{ fontSize: 10, color: 'var(--gray-400)', marginLeft: 4 }}>(edited)</span>}
//                   </span>
//                   {c.authorId === state.user.id && (
//                     <span style={{ display: 'flex', gap: 4 }}>
//                       <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11 }}
//                         onClick={() => { setEditingId(c.id); setEditText(c.content) }}>Edit</button>
//                       <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11, color: 'var(--danger)' }}
//                         onClick={() => handleDelete(c.id)}>Delete</button>
//                     </span>
//                   )}
//                 </div>
//                 {editingId === c.id ? (
//                   <div style={{ marginTop: 6 }}>
//                     <textarea className="form-textarea" value={editText} onChange={e => setEditText(e.target.value)} style={{ minHeight: 60 }} />
//                     <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
//                       <button className="btn btn-primary btn-sm" onClick={() => handleEdit(c.id)}>Save</button>
//                       <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="comment-text">{c.content}</p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <form onSubmit={handlePost} className="comment-input-wrap">
//         <div className="avatar sm">{state.user.avatar}</div>
//         <textarea
//           className="form-textarea"
//           placeholder="Add a comment…"
//           value={text}
//           onChange={e => setText(e.target.value)}
//           style={{ minHeight: 60, flex: 1 }}
//           data-testid="comment-input"
//         />
//         <button className="btn btn-primary btn-sm" type="submit" disabled={posting || !text.trim()} data-testid="comment-submit">
//           {posting ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : 'Post'}
//         </button>
//       </form>
//     </div>
//   )
// }

import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useApp, useToast } from "../../contexts/AppContext";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommentsBox({ documentId }) {
  const { state } = useApp();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [c, u] = await Promise.all([
          api.getComments(documentId),
          api.getUsers(),
        ]);
        setComments(c);
        setUsers(u);
      } catch {
        toast("Failed to load comments", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [documentId]);

  function getUserName(id) {
    const u = users.find((u) => u.id === id);
    return u ? u.name : id; // fall back to the raw id (author string from Cassandra)
  }
  function getUserAvatar(id) {
    const u = users.find((u) => u.id === id);
    return u?.avatar || id?.slice(0, 2).toUpperCase() || "??";
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const comment = await api.createComment({
        documentId,
        authorId: state.user.id,
        content: text.trim(),
      });
      setComments((c) => [comment, ...c]); // prepend — Cassandra returns newest first
      setText("");
      toast("Comment posted!");
    } catch {
      toast("Failed to post comment", "error");
    } finally {
      setPosting(false);
    }
  }

  async function handleEdit(commentId) {
    if (!editText.trim()) return;
    try {
      const updated = await api.updateComment(commentId, {
        content: editText.trim(),
        documentId, // ← pass documentId so api.js can build the URL
      });
      setComments((c) => c.map((cm) => (cm.id === commentId ? updated : cm)));
      setEditingId(null);
      toast("Comment updated!");
    } catch {
      toast("Failed to update comment", "error");
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.deleteComment(commentId, documentId); // ← pass documentId
      setComments((c) => c.filter((cm) => cm.id !== commentId));
      toast("Comment deleted");
    } catch {
      toast("Failed to delete comment", "error");
    }
  }

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );

  return (
    <div data-testid="comments-box">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-900)" }}>
          Comments{" "}
          <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>
            ({comments.length})
          </span>
        </h3>
      </div>

      {comments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: "var(--gray-400)",
            fontSize: 13,
          }}
        >
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="avatar sm" style={{ fontSize: 9 }}>
                {getUserAvatar(c.authorId)}
              </div>
              <div className="comment-bubble" style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    <span className="comment-author">
                      {getUserName(c.authorId)}
                    </span>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                    {c.edited && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--gray-400)",
                          marginLeft: 4,
                        }}
                      >
                        (edited)
                      </span>
                    )}
                  </span>
                  {c.authorId === state.user.id && (
                    <span style={{ display: "flex", gap: 4 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "2px 6px", fontSize: 11 }}
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.content);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{
                          padding: "2px 6px",
                          fontSize: 11,
                          color: "var(--danger)",
                        }}
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </span>
                  )}
                </div>

                {editingId === c.id ? (
                  <div style={{ marginTop: 6 }}>
                    <textarea
                      className="form-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{ minHeight: 60 }}
                    />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(c.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{c.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handlePost} className="comment-input-wrap">
        <div className="avatar sm">{state.user?.avatar}</div>
        <textarea
          className="form-textarea"
          placeholder="Add a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ minHeight: 60, flex: 1 }}
          data-testid="comment-input"
        />
        <button
          className="btn btn-primary btn-sm"
          type="submit"
          disabled={posting || !text.trim()}
          data-testid="comment-submit"
        >
          {posting ? (
            <span
              className="spinner"
              style={{ width: 12, height: 12, borderWidth: 2 }}
            />
          ) : (
            "Post"
          )}
        </button>
      </form>
    </div>
  );
}
