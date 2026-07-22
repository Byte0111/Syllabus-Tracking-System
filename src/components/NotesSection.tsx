import React, { useState, useEffect } from "react";
import { Search, Star, Tag, Link2, Plus, BookOpen, Clock, Trash, File, Upload, X } from "lucide-react";
import { PersonalNote } from "../types";

export default function NotesSection() {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [search, setSearch] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [links, setLinks] = useState<string>("");

  // File Upload states
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; data?: string } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // New delete confirmation & toast states
  const [noteIdToConfirmDelete, setNoteIdToConfirmDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFile = (file: File) => {
    const textReader = new FileReader();
    const dataReader = new FileReader();

    const isText = file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".txt");

    if (isText) {
      textReader.onload = (event) => {
        const textContent = event.target?.result as string;
        setContent(textContent);
        if (!title) {
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          setTitle(baseName);
        }
      };
      textReader.readAsText(file);
    }

    dataReader.onload = (event) => {
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        data: event.target?.result as string
      });
    };
    dataReader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags,
          links,
          fileName: uploadedFile?.name,
          fileSize: uploadedFile?.size,
          fileData: uploadedFile?.data
        }),
      });
      const data = await res.json();
      setNotes((prev) => [data, ...prev]);
      setTitle("");
      setContent("");
      setTags("");
      setLinks("");
      setUploadedFile(null);
      showToastMessage("Study note created successfully!", "success");
    } catch (err) {
      console.error(err);
      showToastMessage("Failed to create study note.", "error");
    }
  };

  const toggleFavorite = (id: number) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, favorite: !n.favorite };
        }
        return n;
      })
    );
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        showToastMessage("Study note deleted successfully!", "success");
      } else {
        showToastMessage("Failed to delete study note.", "error");
      }
      setNoteIdToConfirmDelete(null);
    } catch (err) {
      console.error(err);
      showToastMessage("An error occurred while deleting study note.", "error");
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative" id="personal-notes-hub">
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

      {/* Create Note Section - Crisp white theme with bigger fonts */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-5 h-fit text-slate-800">
        <h3 className="font-display font-bold text-base uppercase tracking-wider text-slate-800 pb-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Create Study Note</span>
        </h3>
        
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none font-sans"
              placeholder="e.g. Gauss Theorem Summary"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Content / Breakdown</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-sm sm:text-base focus:bg-white focus:border-indigo-500 focus:outline-none font-sans leading-relaxed"
              placeholder="Write formulas, proofs, or key memory tricks..."
              required
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none font-sans"
              placeholder="Physics, Electrostatics, Formulas"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Reference Web Link</label>
            <input
              type="url"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none font-mono"
              placeholder="https://example.com"
            />
          </div>

          {/* File Upload Drag-and-Drop Zone - Repaired Event Bubbling & UI */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Upload Notes / File</label>
            {uploadedFile ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-indigo-100 rounded-xl">
                <div className="flex items-center space-x-3 min-w-0">
                  <File className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="truncate text-left">
                    <span className="block text-xs text-slate-800 truncate font-semibold">{uploadedFile.name}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">{uploadedFile.size}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                  title="Remove uploaded file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  const el = document.getElementById("note-file-upload");
                  if (el) el.click();
                }}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                    : "border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-slate-100 text-slate-500"
                }`}
              >
                <input
                  type="file"
                  id="note-file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <Upload className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
                <span className="block text-xs font-bold text-slate-700">Drag & drop study note/file</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">or click to browse from device</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm tracking-wider uppercase transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Create Note</span>
          </button>
        </form>
      </div>

      {/* Browsing & Searching Section - White theme and larger fonts */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search Bar with custom styling */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 focus:border-indigo-500 focus:outline-none font-sans placeholder:text-slate-400 shadow-sm"
            placeholder="Search notes by subject, title, tag, or formula keywords..."
          />
        </div>

        {/* Notes List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="md:col-span-2 py-20 text-center text-slate-500 font-mono text-sm bg-white border border-slate-200 rounded-3xl">
              No notes matching your search filter.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 text-slate-800"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-display font-bold text-slate-800 text-base sm:text-lg truncate pr-2" title={note.title}>
                      {note.title}
                    </h4>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => toggleFavorite(note.id)}
                        className="cursor-pointer text-slate-400 hover:text-amber-500 transition"
                        title="Favorite"
                      >
                        <Star className={`w-5 h-5 ${note.favorite ? "text-amber-400 fill-amber-400" : "text-slate-300 hover:text-slate-500"}`} />
                      </button>
                      {noteIdToConfirmDelete === note.id ? (
                        <div className="flex items-center gap-1.5 shrink-0 animate-fade-in">
                          <span className="text-[10px] text-rose-500 font-mono font-bold uppercase">Delete?</span>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[9px] uppercase tracking-wider transition cursor-pointer font-bold"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setNoteIdToConfirmDelete(null)}
                            className="px-2 py-1 rounded border border-slate-200 text-slate-500 font-mono text-[9px] uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer font-bold"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNoteIdToConfirmDelete(note.id)}
                          className="cursor-pointer text-slate-400 hover:text-rose-500 transition"
                          title="Delete Note"
                        >
                          <Trash className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed font-sans whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  
                  {/* File Attachment badge inside card */}
                  {note.fileName && (
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3.5 text-xs text-slate-700 gap-2">
                      <div className="flex items-center space-x-2 truncate">
                        <File className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-semibold truncate" title={note.fileName}>{note.fileName}</span>
                      </div>
                      {note.fileData ? (
                        <a
                          href={note.fileData}
                          download={note.fileName}
                          className="text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-500 hover:underline shrink-0 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100"
                        >
                          DOWNLOAD
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">{note.fileSize || "Local"}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100/60"
                      >
                        <Tag className="w-3 h-3 mr-0.5 shrink-0 text-indigo-500" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {note.links && note.links.length > 0 && note.links[0] && (
                    <div className="flex items-center text-xs text-slate-500 font-mono">
                      <Link2 className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
                      <a href={note.links[0]} target="_blank" rel="noreferrer" className="hover:underline hover:text-indigo-600 truncate">
                        {note.links[0]}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
