import React, { useState, useEffect } from "react";
import { Youtube, Play, CheckCircle2, Circle, Plus, Trash2, ExternalLink, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface Video {
  id: string;
  title: string;
  duration: string;
  youtubeId: string;
  completed: boolean;
}

interface Playlist {
  id: number;
  name: string;
  playlistUrl: string;
  description: string;
  videos: Video[];
}

export default function YoutubePlaylist() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ playlistId: number; video: Video } | null>(null);
  const [playlistIdToConfirmDelete, setPlaylistIdToConfirmDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form states for creating custom playlist
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/playlists");
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          playlistUrl: newUrl,
          description: newDesc,
        }),
      });
      const data = await res.json();
      setPlaylists((prev) => [...prev, data]);
      setNewName("");
      setNewUrl("");
      setNewDesc("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create playlist", err);
    }
  };

  const toggleVideoCompletion = async (playlistId: number, videoId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/video/${videoId}/toggle`, {
        method: "PUT",
      });
      const updatedPlaylist = await res.json();
      
      // Update local state
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? updatedPlaylist : p))
      );

      // If active video completion was toggled, update activeVideo state too
      if (activeVideo && activeVideo.playlistId === playlistId && activeVideo.video.id === videoId) {
        setActiveVideo((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            video: { ...prev.video, completed: !prev.video.completed },
          };
        });
      }
    } catch (err) {
      console.error("Failed to toggle video", err);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    try {
      await fetch(`/api/playlists/${id}`, { method: "DELETE" });
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (expandedId === id) setExpandedId(null);
      if (activeVideo && activeVideo.playlistId === id) setActiveVideo(null);
      setPlaylistIdToConfirmDelete(null);
      showToastMessage("Study playlist deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete playlist", err);
      showToastMessage("Failed to delete study playlist.", "error");
    }
  };

  return (
    <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-3xl shadow-xl space-y-5" id="youtube-playlist-tracker">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border flex items-center space-x-2 animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300" 
            : "bg-rose-950/90 border-rose-500/30 text-rose-300"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            toast.type === "success" ? "bg-emerald-400" : "bg-rose-400"
          }`} />
          <span className="text-xs font-mono font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Youtube className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-medium text-xs uppercase tracking-wider text-white">YouTube Study Playlists</h3>
            <p className="text-[10px] text-slate-400">Watch, track & complete video lectures</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 font-sans text-[10px] hover:bg-white/[0.03] transition-all cursor-pointer font-medium uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? "Close" : "Add Playlist"}</span>
        </button>
      </div>

      {/* Add Playlist Form */}
      {showAddForm && (
        <form onSubmit={handleCreatePlaylist} className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">Playlist Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. Organic Chemistry Reactions"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">YouTube Playlist URL or ID</label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-slate-200 text-xs focus:border-indigo-500 focus:outline-none font-mono"
              placeholder="e.g. https://youtube.com/playlist?list=..."
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">Brief Description</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
              placeholder="Revision notes, solved numerical exercises"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition cursor-pointer"
          >
            Create Playlist Progress
          </button>
        </form>
      )}

      {/* Embedded Video Player */}
      {activeVideo && (
        <div className="bg-black/80 rounded-2xl border border-rose-500/20 overflow-hidden relative shadow-inner">
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo.video.youtubeId}`}
              title={activeVideo.video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div className="p-3 bg-slate-950/90 border-t border-white/5 flex items-center justify-between">
            <div className="truncate pr-4">
              <span className="block text-[9px] font-bold text-rose-500 uppercase tracking-wider">Now Playing</span>
              <span className="text-xs text-white truncate block font-medium mt-0.5">{activeVideo.video.title}</span>
            </div>
            <button
              onClick={() => toggleVideoCompletion(activeVideo.playlistId, activeVideo.video.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 ${
                activeVideo.video.completed
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {activeVideo.video.completed ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              <span>{activeVideo.video.completed ? "Completed" : "Mark as Completed"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Playlist List */}
      <div className="space-y-3.5">
        {playlists.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6 font-mono">No playlists tracked yet.</p>
        ) : (
          playlists.map((playlist) => {
            const completedCount = playlist.videos.filter((v) => v.completed).length;
            const totalCount = playlist.videos.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isExpanded = expandedId === playlist.id;

            return (
              <div key={playlist.id} className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/30">
                {/* Playlist Header Row */}
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0" onClick={() => setExpandedId(isExpanded ? null : playlist.id)}>
                    <div className="flex items-center space-x-2 cursor-pointer group">
                      <h4 className="font-display font-semibold text-xs text-slate-200 group-hover:text-white transition truncate">{playlist.name}</h4>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate leading-relaxed">{playlist.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="pt-2.5 space-y-1">
                      <div className="flex justify-between text-[9px] font-mono font-medium text-slate-400">
                        <span>Progress: {completedCount}/{totalCount} videos</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {playlistIdToConfirmDelete === playlist.id ? (
                    <div className="flex items-center gap-1.5 shrink-0 self-start animate-fade-in">
                      <span className="text-[9px] text-rose-400 font-mono uppercase tracking-wider">Delete?</span>
                      <button
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setPlaylistIdToConfirmDelete(null)}
                        className="px-2 py-1 rounded-lg border border-white/10 text-slate-400 font-mono text-[9px] uppercase tracking-wider hover:bg-white/5 transition cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPlaylistIdToConfirmDelete(playlist.id)}
                      className="p-1.5 rounded-lg border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Expanded Videos List */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-slate-950/60 p-3 space-y-1.5">
                    {playlist.videos.map((video) => (
                      <div
                        key={video.id}
                        className="p-2.5 rounded-xl hover:bg-white/[0.03] transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          <button
                            onClick={() => toggleVideoCompletion(playlist.id, video.id)}
                            className="text-slate-500 hover:text-white transition shrink-0"
                          >
                            {video.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                            )}
                          </button>
                          <div className="truncate leading-tight">
                            <span className={`block font-medium truncate ${video.completed ? "text-slate-500 line-through" : "text-slate-300"}`}>
                              {video.title}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono flex items-center mt-0.5">
                              <Clock className="w-2.5 h-2.5 mr-1" />
                              {video.duration}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveVideo({ playlistId: playlist.id, video })}
                          className="px-2 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 transition flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wide shrink-0 font-mono cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-rose-500/10" />
                          <span>Watch</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
