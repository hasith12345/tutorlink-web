"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, ClassFolder, ClassMaterial } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  ArrowLeft, FolderOpen, Folder, FileText, Image, Video,
  Download, ChevronDown, ChevronRight, BookOpen,
} from "lucide-react"

function formatBytes(bytes?: number | null) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MaterialIcon({ resourceType }: { resourceType: string }) {
  if (resourceType === "image") return <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
  if (resourceType === "video") return <Video className="w-4 h-4 text-purple-500 flex-shrink-0" />
  return <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
}

export default function StudentMaterialsPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string

  const [folders, setFolders] = useState<ClassFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [className, setClassName] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [foldersRes, enrollmentsRes] = await Promise.all([
          api.getClassFolders(classId),
          api.getStudentEnrollments(),
        ])
        setFolders(foldersRes.folders)

        const enrollment = enrollmentsRes.enrollments.find(e => e.class.id === classId)
        if (enrollment) setClassName(enrollment.class.subject)

        // Auto-expand folders that have materials
        const withMaterials = foldersRes.folders.filter(f => f.materials.length > 0).map(f => f.id)
        setExpandedFolders(new Set(withMaterials))
      } catch (e: any) {
        setError(e.message || "Failed to load materials")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [classId])

  function toggleExpand(folderId: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.has(folderId) ? next.delete(folderId) : next.add(folderId)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Materials</h1>
            {className && <p className="text-sm text-gray-500">{className}</p>}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">No materials yet</p>
            <p className="text-gray-400 text-sm">Your tutor hasn't uploaded any materials for this class yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {folders.map(folder => (
              <div key={folder.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleExpand(folder.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {expandedFolders.has(folder.id)
                    ? <FolderOpen className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    : <Folder className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  }
                  <span className="flex-1 font-semibold text-gray-800">{folder.name}</span>
                  <span className="text-sm text-gray-400">{folder.materials.length} file{folder.materials.length !== 1 ? "s" : ""}</span>
                  {expandedFolders.has(folder.id)
                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                    : <ChevronRight className="w-4 h-4 text-gray-400" />
                  }
                </button>

                {expandedFolders.has(folder.id) && (
                  <div className="border-t border-gray-100">
                    {folder.materials.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-gray-400">No files in this folder yet</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {folder.materials.map((material: ClassMaterial) => (
                          <div key={material.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                            <MaterialIcon resourceType={material.resourceType} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{material.name}</p>
                              {material.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{material.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">{formatBytes(material.sizeBytes)}</p>
                            </div>
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-medium rounded-lg transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Open
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
