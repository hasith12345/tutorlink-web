"use client"

import { useState, useEffect, useRef } from "react"
import { api, ClassFolder, ClassMaterial } from "@/lib/api"
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileText,
  Image,
  Video,
  Download,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Loader2,
} from "lucide-react"

interface FolderManagerProps {
  classId: string
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MaterialIcon({ resourceType, mimeType }: { resourceType: string; mimeType: string }) {
  if (resourceType === "image") return <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
  if (resourceType === "video") return <Video className="w-4 h-4 text-purple-500 flex-shrink-0" />
  return <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
}

export default function FolderManager({ classId }: FolderManagerProps) {
  const [folders, setFolders] = useState<ClassFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // New folder input
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [creatingFolder, setCreatingFolder] = useState(false)

  // Expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Rename state
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [renamingValue, setRenamingValue] = useState("")

  // Delete folder confirm
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)

  // Upload state per folder
  const [uploadingFolderId, setUploadingFolderId] = useState<string | null>(null)
  const [uploadDesc, setUploadDesc] = useState<Record<string, string>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Deleting material
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)

  useEffect(() => {
    loadFolders()
  }, [classId])

  async function loadFolders() {
    setLoading(true)
    setError("")
    try {
      const res = await api.getClassFolders(classId)
      setFolders(res.folders)
    } catch (e: any) {
      setError(e.message || "Failed to load folders")
    } finally {
      setLoading(false)
    }
  }

  function toggleExpand(folderId: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.has(folderId) ? next.delete(folderId) : next.add(folderId)
      return next
    })
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      const res = await api.createClassFolder(classId, newFolderName.trim())
      setFolders(prev => [...prev, res.folder])
      setNewFolderName("")
      setShowNewFolder(false)
      setExpandedFolders(prev => new Set([...prev, res.folder.id]))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreatingFolder(false)
    }
  }

  async function handleRenameFolder(folderId: string) {
    if (!renamingValue.trim()) return
    try {
      const res = await api.updateClassFolder(classId, folderId, { name: renamingValue.trim() })
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: res.folder.name } : f))
      setRenamingFolderId(null)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleReorder(folderId: string, direction: "up" | "down") {
    const idx = folders.findIndex(f => f.id === folderId)
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === folders.length - 1) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const newFolders = [...folders]
    const folderA = { ...newFolders[idx], order: newFolders[swapIdx].order }
    const folderB = { ...newFolders[swapIdx], order: newFolders[idx].order }
    newFolders[idx] = folderA
    newFolders[swapIdx] = folderB
    newFolders.sort((a, b) => a.order - b.order)
    setFolders(newFolders)

    try {
      await Promise.all([
        api.updateClassFolder(classId, folderA.id, { order: folderA.order }),
        api.updateClassFolder(classId, folderB.id, { order: folderB.order }),
      ])
    } catch (e: any) {
      setError(e.message)
      loadFolders()
    }
  }

  async function handleDeleteFolder(folderId: string) {
    setDeletingFolderId(null)
    try {
      await api.deleteClassFolder(classId, folderId)
      setFolders(prev => prev.filter(f => f.id !== folderId))
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleUpload(folderId: string, files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadingFolderId(folderId)
    setError("")
    try {
      const desc = uploadDesc[folderId] || ""
      const uploaded: ClassMaterial[] = []
      for (const file of Array.from(files)) {
        const res = await api.uploadClassMaterial(folderId, file, desc || undefined)
        uploaded.push(res.material)
      }
      setFolders(prev =>
        prev.map(f =>
          f.id === folderId ? { ...f, materials: [...f.materials, ...uploaded] } : f
        )
      )
      setUploadDesc(prev => ({ ...prev, [folderId]: "" }))
      if (fileInputRefs.current[folderId]) {
        fileInputRefs.current[folderId]!.value = ""
      }
    } catch (e: any) {
      setError(e.message || "Upload failed")
    } finally {
      setUploadingFolderId(null)
    }
  }

  async function handleTogglePublish(classId: string, folderId: string, material: ClassMaterial) {
    try {
      const res = await api.updateClassMaterial(classId, material.id, { isPublished: !material.isPublished })
      setFolders(prev =>
        prev.map(f =>
          f.id === folderId
            ? { ...f, materials: f.materials.map(m => m.id === material.id ? res.material : m) }
            : f
        )
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleDeleteMaterial(folderId: string, materialId: string) {
    setDeletingMaterialId(null)
    try {
      await api.deleteClassMaterial(classId, materialId)
      setFolders(prev =>
        prev.map(f =>
          f.id === folderId ? { ...f, materials: f.materials.filter(m => m.id !== materialId) } : f
        )
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Folder list */}
      {folders.map((folder, idx) => (
        <div key={folder.id} className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Folder header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
            <button onClick={() => toggleExpand(folder.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
              {expandedFolders.has(folder.id)
                ? <FolderOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                : <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              }
              {renamingFolderId === folder.id ? (
                <input
                  autoFocus
                  value={renamingValue}
                  onChange={e => setRenamingValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleRenameFolder(folder.id)
                    if (e.key === "Escape") setRenamingFolderId(null)
                  }}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 px-2 py-0.5 text-sm border border-indigo-400 rounded outline-none"
                />
              ) : (
                <span className="text-sm font-medium text-gray-800 truncate">{folder.name}</span>
              )}
              <span className="text-xs text-gray-400 flex-shrink-0">{folder.materials.length} file{folder.materials.length !== 1 ? "s" : ""}</span>
            </button>

            <div className="flex items-center gap-1 flex-shrink-0">
              {renamingFolderId === folder.id ? (
                <>
                  <button onClick={() => handleRenameFolder(folder.id)} className="p-1 hover:bg-green-100 rounded text-green-600"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setRenamingFolderId(null)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><X className="w-3.5 h-3.5" /></button>
                </>
              ) : (
                <>
                  <button onClick={() => handleReorder(folder.id, "up")} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded text-gray-400 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleReorder(folder.id, "down")} disabled={idx === folders.length - 1} className="p-1 hover:bg-gray-200 rounded text-gray-400 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setRenamingFolderId(folder.id); setRenamingValue(folder.name) }} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeletingFolderId(folder.id)} className="p-1 hover:bg-red-100 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </>
              )}
            </div>
          </div>

          {/* Delete folder confirm */}
          {deletingFolderId === folder.id && (
            <div className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center justify-between gap-3">
              <span className="text-sm text-red-700">Delete this folder and all its files?</span>
              <div className="flex gap-2">
                <button onClick={() => setDeletingFolderId(null)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleDeleteFolder(folder.id)} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          )}

          {/* Expanded content */}
          {expandedFolders.has(folder.id) && (
            <div className="border-t border-gray-100">
              {/* Materials list */}
              {folder.materials.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {folder.materials.map(material => (
                    <div key={material.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                      <MaterialIcon resourceType={material.resourceType} mimeType={material.mimeType} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">{material.name}</p>
                        {material.description && <p className="text-xs text-gray-500 mt-0.5">{material.description}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatBytes(material.sizeBytes)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!material.isPublished && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Draft</span>
                        )}
                        <button
                          onClick={() => handleTogglePublish(classId, folder.id, material)}
                          title={material.isPublished ? "Hide from students" : "Show to students"}
                          className="p-1 hover:bg-gray-200 rounded text-gray-400"
                        >
                          {material.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-200 rounded text-gray-400">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {deletingMaterialId === material.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteMaterial(folder.id, material.id)} className="p-1 hover:bg-red-100 rounded text-red-600"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeletingMaterialId(null)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingMaterialId(material.id)} className="p-1 hover:bg-red-100 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
                <input
                  type="text"
                  placeholder="File description (optional)"
                  value={uploadDesc[folder.id] || ""}
                  onChange={e => setUploadDesc(prev => ({ ...prev, [folder.id]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    ref={el => { fileInputRefs.current[folder.id] = el }}
                    onChange={e => handleUpload(folder.id, e.target.files)}
                    className="hidden"
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,video/webm,video/quicktime"
                  />
                  <button
                    onClick={() => fileInputRefs.current[folder.id]?.click()}
                    disabled={uploadingFolderId === folder.id}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {uploadingFolderId === folder.id
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                      : <><Upload className="w-4 h-4" /> Upload Files</>
                    }
                  </button>
                  <span className="text-xs text-gray-400">PDF, DOC, images, video · max 50 MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New folder input */}
      {showNewFolder ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Folder name, e.g. Week 1 Notes"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName("") } }}
            className="flex-1 px-3 py-2 text-sm border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleCreateFolder}
            disabled={creatingFolder || !newFolderName.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-50 flex items-center gap-1"
          >
            {creatingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Create
          </button>
          <button onClick={() => { setShowNewFolder(false); setNewFolderName("") }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewFolder(true)}
          className="flex items-center gap-2 w-full px-4 py-2.5 border-2 border-dashed border-gray-200 hover:border-indigo-400 text-gray-500 hover:text-indigo-600 text-sm rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> New Folder
        </button>
      )}
    </div>
  )
}
