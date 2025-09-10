"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions"
import { getPatients, updatePatient } from "@/lib/actions/patient.actions"
import { getDoctors } from "@/lib/actions/doctor.actions"
import { StatusBadge } from "@/components/StatusBadge"
import { AppointmentDetails } from "@/components/AppointmentDetails"
import { AppointmentModal } from "@/components/AppointmentModal"
import { AppointmentNotesModal } from "@/components/AppointmentNotesModal"
import { markAppointmentAsCompleted } from "@/lib/actions/appointment.actions"
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Brush,
  Calendar,
  Camera,
  ChevronDown,
  Cloud,
  Code,
  CreditCard,
  Crown,
  CuboidIcon,
  Download,
  Edit,
  FileText,
  Filter,
  Heart,
  Home,
  ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  Menu,
  MessageSquare,
  Palette,
  PanelLeft,
  Play,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Trash,
  TrendingUp,
  Users,
  Video,
  Wand2,
  Clock,
  Eye,
  Archive,
  ArrowUpDown,
  MoreHorizontal,
  Type,
  X,
  Check,
  Timer,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  Edit3,
  Save,
  X as XIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Sample data for apps
const apps = [
  {
    name: "PixelMaster",
    icon: <ImageIcon className="text-violet-500" />,
    description: "Advanced image editing and composition",
    category: "Creative",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "VectorPro",
    icon: <Brush className="text-orange-500" />,
    description: "Professional vector graphics creation",
    category: "Creative",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "VideoStudio",
    icon: <Video className="text-pink-500" />,
    description: "Cinematic video editing and production",
    category: "Video",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "MotionFX",
    icon: <Sparkles className="text-blue-500" />,
    description: "Stunning visual effects and animations",
    category: "Video",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "PageCraft",
    icon: <Layers className="text-red-500" />,
    description: "Professional page design and layout",
    category: "Creative",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "UXFlow",
    icon: <LayoutGrid className="text-fuchsia-500" />,
    description: "Intuitive user experience design",
    category: "Design",
    recent: false,
    new: true,
    progress: 85,
  },
  {
    name: "PhotoLab",
    icon: <Camera className="text-teal-500" />,
    description: "Advanced photo editing and organization",
    category: "Photography",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "DocMaster",
    icon: <FileText className="text-red-600" />,
    description: "Document editing and management",
    category: "Document",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "WebCanvas",
    icon: <Code className="text-emerald-500" />,
    description: "Web design and development",
    category: "Web",
    recent: false,
    new: true,
    progress: 70,
  },
  {
    name: "3DStudio",
    icon: <CuboidIcon className="text-indigo-500" />,
    description: "3D modeling and rendering",
    category: "3D",
    recent: false,
    new: true,
    progress: 60,
  },
  {
    name: "FontForge",
    icon: <Type className="text-amber-500" />,
    description: "Typography and font creation",
    category: "Typography",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "ColorPalette",
    icon: <Palette className="text-purple-500" />,
    description: "Color scheme creation and management",
    category: "Design",
    recent: false,
    new: false,
    progress: 100,
  },
]

// Sample data for recent files
const recentFiles = [
  {
    name: "Brand Redesign.pxm",
    app: "PixelMaster",
    modified: "2 hours ago",
    icon: <ImageIcon className="text-violet-500" />,
    shared: true,
    size: "24.5 MB",
    collaborators: 3,
  },
  {
    name: "Company Logo.vec",
    app: "VectorPro",
    modified: "Yesterday",
    icon: <Brush className="text-orange-500" />,
    shared: true,
    size: "8.2 MB",
    collaborators: 2,
  },
  {
    name: "Product Launch Video.vid",
    app: "VideoStudio",
    modified: "3 days ago",
    icon: <Video className="text-pink-500" />,
    shared: false,
    size: "1.2 GB",
    collaborators: 0,
  },
  {
    name: "UI Animation.mfx",
    app: "MotionFX",
    modified: "Last week",
    icon: <Sparkles className="text-blue-500" />,
    shared: true,
    size: "345 MB",
    collaborators: 4,
  },
  {
    name: "Magazine Layout.pgc",
    app: "PageCraft",
    modified: "2 weeks ago",
    icon: <Layers className="text-red-500" />,
    shared: false,
    size: "42.8 MB",
    collaborators: 0,
  },
  {
    name: "Mobile App Design.uxf",
    app: "UXFlow",
    modified: "3 weeks ago",
    icon: <LayoutGrid className="text-fuchsia-500" />,
    shared: true,
    size: "18.3 MB",
    collaborators: 5,
  },
  {
    name: "Product Photography.phl",
    app: "PhotoLab",
    modified: "Last month",
    icon: <Camera className="text-teal-500" />,
    shared: false,
    size: "156 MB",
    collaborators: 0,
  },
  {
    name: "Product Photography.phl",
    app: "PhotoLab",
    modified: "Last month",
    icon: <Camera className="text-teal-500" />,
    shared: false,
    size: "156 MB",
    collaborators: 0,
  },
]

// Sample data for projects
const projects = [
  {
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    progress: 75,
    dueDate: "June 15, 2025",
    members: 4,
    files: 23,
  },
  {
    name: "Mobile App Launch",
    description: "Design and assets for new mobile application",
    progress: 60,
    dueDate: "July 30, 2025",
    members: 6,
    files: 42,
  },
  {
    name: "Brand Identity",
    description: "New brand guidelines and assets",
    progress: 90,
    dueDate: "May 25, 2025",
    members: 3,
    files: 18,
  },
  {
    name: "Marketing Campaign",
    description: "Summer promotion materials",
    progress: 40,
    dueDate: "August 10, 2025",
    members: 5,
    files: 31,
  },
]

// Sample data for tutorials
const tutorials = [
  {
    title: "Mastering Digital Illustration",
    description: "Learn advanced techniques for creating stunning digital art",
    duration: "1h 45m",
    level: "Advanced",
    instructor: "Sarah Chen",
    category: "Illustration",
    views: "24K",
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Essential principles for creating intuitive user interfaces",
    duration: "2h 20m",
    level: "Intermediate",
    instructor: "Michael Rodriguez",
    category: "Design",
    views: "56K",
  },
  {
    title: "Video Editing Masterclass",
    description: "Professional techniques for cinematic video editing",
    duration: "3h 10m",
    level: "Advanced",
    instructor: "James Wilson",
    category: "Video",
    views: "32K",
  },
  {
    title: "Typography Essentials",
    description: "Create beautiful and effective typography for any project",
    duration: "1h 30m",
    level: "Beginner",
    instructor: "Emma Thompson",
    category: "Typography",
    views: "18K",
  },
  {
    title: "Color Theory for Designers",
    description: "Understanding color relationships and psychology",
    duration: "2h 05m",
    level: "Intermediate",
    instructor: "David Kim",
    category: "Design",
    views: "41K",
  },
]

// Sample data for community posts
const communityPosts = [
  {
    title: "Minimalist Logo Design",
    author: "Alex Morgan",
    likes: 342,
    comments: 28,
    image: "/placeholder.svg?height=300&width=400",
    time: "2 days ago",
  },
  {
    title: "3D Character Concept",
    author: "Priya Sharma",
    likes: 518,
    comments: 47,
    image: "/placeholder.svg?height=300&width=400",
    time: "1 week ago",
  },
  {
    title: "UI Dashboard Redesign",
    author: "Thomas Wright",
    likes: 276,
    comments: 32,
    image: "/placeholder.svg?height=300&width=400",
    time: "3 days ago",
  },
  {
    title: "Product Photography Setup",
    author: "Olivia Chen",
    likes: 189,
    comments: 15,
    image: "/placeholder.svg?height=300&width=400",
    time: "5 days ago",
  },
]

const sidebarItems = [
  {
    title: "Wizyty",
    icon: <Calendar />,
    value: "wizyty",
  },
  {
    title: "Pacjenci",
    icon: <Users />,
    value: "patients",
  },
  {
    title: "Specjaliści",
    icon: <User />,
    value: "specialists",
  },
  {
    title: "Biuro",
    icon: <Home />,
    value: "office",
  },
  {
    title: "Płatności",
    icon: <CreditCard />,
    value: "payments",
  },
]

const visitsData = [
  {
    id: 1,
    patient: "Aleksandra Górecka",
    status: "Potwierdzona",
    statusColor: "bg-blue-100 text-blue-800",
    office: "2B",
    date: "13/09/2025",
    time: "17:45",
    doctor: "Dr. Sylwia Klejnowska",
    doctorAvatar: "/placeholder.svg?height=32&width=32",
    actions: ["Szczegóły", "Przełóż", "Odbyta", "Anuluj"],
  },
  {
    id: 2,
    patient: "Patryk Idzikowski",
    status: "Oczekująca",
    statusColor: "bg-orange-100 text-orange-800",
    office: "2B",
    date: "15/09/2025",
    time: "12:30",
    doctor: "Dr. Sylwia Klejnowska",
    doctorAvatar: "/placeholder.svg?height=32&width=32",
    actions: ["Szczegóły", "Potwierdź", "Anuluj"],
  },
  {
    id: 3,
    patient: "Patryk Idzikowski",
    status: "Odbyta",
    statusColor: "bg-green-100 text-green-800",
    office: "2B",
    date: "15/09/2025",
    time: "08:00",
    doctor: "Dr. Sylwia Klejnowska",
    doctorAvatar: "/placeholder.svg?height=32&width=32",
    actions: ["Szczegóły", "Notatka", "Umów Ponownie"],
  },
  {
    id: 4,
    patient: "Patryk Idzikowski",
    status: "Przełożona",
    statusColor: "bg-blue-100 text-blue-800",
    office: "2B",
    date: "12/09/2025",
    time: "08:15",
    doctor: "Dr. Sylwia Klejnowska",
    doctorAvatar: "/placeholder.svg?height=32&width=32",
    actions: ["Szczegóły", "Przełóż", "Odbyta", "Anuluj"],
  },
  {
    id: 5,
    patient: "Patryk Idzikowski",
    status: "Anulowana",
    statusColor: "bg-red-100 text-red-800",
    office: "2B",
    date: "12/09/2025",
    time: "14:00",
    doctor: "Dr. Sylwia Klejnowska",
    doctorAvatar: "/placeholder.svg?height=32&width=32",
    actions: ["Szczegóły"],
  },
]

export function DesignaliCreative() {
  const [activeTab, setActiveTab] = useState("wizyty")
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [modalType, setModalType] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const openModal = (visit: any, type: string) => {
    setSelectedVisit(visit)
    setModalType(type)
  }

  const closeModal = () => {
    setSelectedVisit(null)
    setModalType(null)
  }

  const fetchAppointments = async () => {
    try {
      const appointmentsData = await getRecentAppointmentList()
      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Błąd podczas pobierania wizyt:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const patientsData = await getPatients()
      setPatients(patientsData || [])
      setFilteredPatients(patientsData || [])
    } catch (error) {
      console.error("Błąd podczas pobierania pacjentów:", error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const doctorsData = await getDoctors()
      setDoctors(doctorsData || [])
    } catch (error) {
      console.error("Błąd podczas pobierania lekarzy:", error)
    }
  }

  // Funkcja wyszukiwania
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredPatients(patients)
      return
    }

    const filtered = patients.filter((patient: any) => {
      const searchLower = query.toLowerCase()
      return (
        patient.name?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(query) ||
        patient.email?.toLowerCase().includes(searchLower)
      )
    })
    setFilteredPatients(filtered)
  }

  // Funkcja do pobrania lekarza dla pacjenta
  const getPatientDoctor = (patient: any) => {
    return doctors.find((doctor: any) => doctor.name === patient.primaryPhysician)
  }

  // Funkcja do pobrania ostatniej wizyty
  const getLastAppointment = (patient: any) => {
    if (!appointments?.documents) return null
    const patientAppointments = appointments.documents.filter(
      (apt: any) => apt.patient?.$id === patient.$id
    )
    if (patientAppointments.length === 0) return null
    
    // Sortuj po dacie i weź najnowszą
    const sortedAppointments = patientAppointments.sort(
      (a: any, b: any) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime()
    )
    return sortedAppointments[0]
  }

  // Funkcja do pobrania najbliższej wizyty
  const getNextAppointment = (patient: any) => {
    if (!appointments?.documents) return null
    const now = new Date()
    const patientAppointments = appointments.documents.filter(
      (apt: any) => apt.patient?.$id === patient.$id && new Date(apt.schedule) > now
    )
    if (patientAppointments.length === 0) return null
    
    // Sortuj po dacie i weź najbliższą
    const sortedAppointments = patientAppointments.sort(
      (a: any, b: any) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
    )
    return sortedAppointments[0]
  }

  // Funkcje do obsługi edycji
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue || "")
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValue("")
  }

  const saveField = async (field: string) => {
    if (!selectedPatient) return

    try {
      // Aktualizuj pacjenta w bazie danych
      await updatePatient(selectedPatient.$id, { [field]: editValue })
      
      // Aktualizuj lokalny stan
      setSelectedPatient({
        ...selectedPatient,
        [field]: editValue
      })
      
      // Aktualizuj też listę pacjentów
      setPatients(patients.map(p => 
        p.$id === selectedPatient.$id 
          ? { ...p, [field]: editValue }
          : p
      ))
      setFilteredPatients(filteredPatients.map(p => 
        p.$id === selectedPatient.$id 
          ? { ...p, [field]: editValue }
          : p
      ))

      setEditingField(null)
      setEditValue("")
    } catch (error) {
      console.error("Błąd podczas aktualizacji pacjenta:", error)
    }
  }

  // Komponent do wyświetlania pola z możliwością edycji
  const EditableField = ({ 
    field, 
    label, 
    value, 
    type = "text",
    options = null 
  }: {
    field: string
    label: string
    value: string
    type?: string
    options?: { value: string; label: string }[] | null
  }) => {
    const isEditing = editingField === field

    return (
      <div>
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <div className="mt-1 flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              {type === "select" && options ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              <Button
                size="sm"
                onClick={() => saveField(field)}
                className="bg-green-600 hover:bg-green-700 text-white p-1"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                className="p-1"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-900 flex-1">{value || '-'}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => startEditing(field, value)}
                className="p-1 hover:bg-gray-100"
              >
                <Edit3 className="h-4 w-4 text-gray-500" />
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      await Promise.all([
        fetchAppointments(),
        fetchPatients(),
        fetchDoctors()
      ])
      setLoading(false)
    }
    fetchAllData()
  }, [])

  // Funkcja do generowania kalendarza na podstawie danych z API
  const generateCalendarData = () => {
    if (!appointments?.documents) return {}
    
    // Grupuj wizyty według daty
    const appointmentsByDate = appointments.documents.reduce((acc: any, appointment: any) => {
      const date = new Date(appointment.schedule).getDate()
      if (!acc[date]) acc[date] = []
      acc[date].push(appointment)
      return acc
    }, {})

    return appointmentsByDate
  }

  // Mapowanie nazw kolorów na wartości hex
  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      green: '#10b981',
      blue: '#3b82f6',
      purple: '#8b5cf6',
      red: '#ef4444',
      yellow: '#f59e0b',
      pink: '#ec4899',
      indigo: '#6366f1',
      teal: '#14b8a6'
    };
    return colorMap[colorName] || '#10b981';
  };

  // Kolory gabinetów dla wizyt
  const getAppointmentColor = (appointment: any) => {
    // Jeśli wizyta ma przypisany kolor gabinetu, użyj go
    if (appointment.roomColor) {
      return getColorValue(appointment.roomColor);
    }
    
    // Fallback na kolory statusów (dla wizyt bez przypisanego gabinetu)
    let statuses: string[];
    if (Array.isArray(appointment.status)) {
      statuses = appointment.status;
    } else {
      statuses = appointment.status.includes(',') ? appointment.status.split(',').map((s: string) => s.trim()) : [appointment.status];
    }
    if (statuses.length === 0) {
      statuses = ["awaiting"];
    }

    // Sprawdź statusy w odpowiedniej kolejności (kolory zgodne z StatusBadge)
    if (statuses.includes("cancelled")) return "#ef4444";
    if (appointment.isCompleted || statuses.includes("completed")) return "#059669";
    if (statuses.includes("scheduled")) return "#10b981";
    if (statuses.includes("accepted")) return "#3b82f6";
    return "#f59e0b";
  };

  // Sprawdź czy wizyta jest anulowana
  const isAppointmentCancelled = (appointment: any) => {
    let statuses: string[];
    if (Array.isArray(appointment.status)) {
      statuses = appointment.status;
    } else {
      statuses = appointment.status.includes(',') ? appointment.status.split(',').map((s: string) => s.trim()) : [appointment.status];
    }
    return statuses.includes("cancelled");
  };

  // Sprawdź czy wizyta się odbyła
  const isAppointmentCompleted = (appointment: any) => {
    return appointment.isCompleted || (Array.isArray(appointment.status) ? appointment.status.includes("completed") : appointment.status.includes("completed"));
  };

  const calendarData = generateCalendarData()

  // Paginacja
  const totalItems = appointments?.documents?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = appointments?.documents?.slice(startIndex, endIndex) || []

  const [progress, setProgress] = useState(0)
  const [notifications, setNotifications] = useState(5)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Simulate progress loading
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Ładowanie...</div>
      </div>
    )
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Wand2 className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">Designali</h2>
                <p className="text-xs text-muted-foreground">Creative Suite</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(item.value || "home")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === (item.value || "home")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>Ustawienia</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>John Doe</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Pro
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Wand2 className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">Designali</h2>
                <p className="text-xs text-muted-foreground">Creative Suite</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(item.value || "home")}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === (item.value || "home")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>Ustawienia</span>
              </button>
              <button className="bg-red-700 hover:bg-red-600 text-white rounded-2xl text-center flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <span>Wyloguj</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold"></h1>
            <div className="flex items-center gap-3">

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl"
                    disabled
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Messages</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled className="rounded-2xl relative">
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {notifications}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="wizyty" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="wizyty" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 mb-8"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-2xl bg-blue-100 p-3">
                              <Heart className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                              <h1 className="text-3xl font-bold text-gray-900">Witaj w Poradni Psychologicznej</h1>
                              <p className="text-gray-600 mt-1">
                                Profesjonalna opieka psychologiczna dla Twojego zdrowia psychicznego
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6">
                              Umów wizytę
                            </Button>
                            <Button variant="outline" className="rounded-2xl px-6 bg-transparent">
                              Zobacz kalendarz
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
                    >
                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-orange-100 p-3">
                            <Calendar className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{appointments?.scheduledCount || 0}</div>
                            <div className="text-sm text-gray-600">Przełożone wizyty</div>
                          </div>
                        </div>
                      </Card>

                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-green-100 p-3">
                            <Check className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{appointments?.acceptedCount || 0}</div>
                            <div className="text-sm text-gray-600">Potwierdzone wizyty</div>
                          </div>
                        </div>
                      </Card>

                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-blue-100 p-3">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{appointments?.completedCount || 0}</div>
                            <div className="text-sm text-gray-600">Odbyte wizyty</div>
                          </div>
                        </div>
                      </Card>

                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-indigo-100 p-3">
                            <Timer className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{appointments?.awaitingCount || 0}</div>
                            <div className="text-sm text-gray-600">Oczekujące wizyty</div>
                          </div>
                        </div>
                      </Card>

                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-red-100 p-3">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{appointments?.cancelledCount || 0}</div>
                            <div className="text-sm text-gray-600">Anulowane wizyty</div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Ten tydzień</h2>
                      <Button 
                        variant="ghost" 
                        className="rounded-2xl flex items-center gap-2"
                        onClick={() => setCalendarExpanded(!calendarExpanded)}
                      >
                        {calendarExpanded ? "Zwiń" : "Rozwiń"}
                        <ChevronDown className={`h-4 w-4 transition-transform ${calendarExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>

                    <Card className="rounded-3xl bg-white border-gray-200 p-6">
                      {calendarExpanded ? (
                        // Pełny kalendarz
                        <div className="space-y-4">
                          <div className="grid grid-cols-7 gap-4 mb-4">
                            {["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"].map((day) => (
                              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-4">
                            {/* Generuj dni miesiąca */}
                            {Array.from({ length: 35 }, (_, i) => {
                              const dayNumber = i - 6; // Zacznij od -6 aby pokazać poprzedni miesiąc
                              const currentDate = new Date();
                              const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                              const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                              const startDate = new Date(firstDay);
                              startDate.setDate(startDate.getDate() + dayNumber);
                              
                              const isCurrentMonth = startDate.getMonth() === currentDate.getMonth();
                              const isToday = startDate.toDateString() === currentDate.toDateString();
                              const dayOfMonth = startDate.getDate();
                              
                              return (
                                <div 
                                  key={i}
                                  className={`min-h-[120px] p-2 ${
                                    isToday ? 'border-2 border-blue-400 rounded-lg bg-blue-50' : ''
                                  }`}
                                >
                                  <div className={`text-lg font-medium mb-2 ${
                                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                  }`}>
                                    {dayOfMonth}
                                  </div>
                                  <div className="space-y-1">
                                    {calendarData[dayOfMonth]?.map((appointment: any, index: number) => {
                                      const date = new Date(appointment.schedule);
                                      const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                                      const isCancelled = isAppointmentCancelled(appointment);
                                      const isCompleted = isAppointmentCompleted(appointment);
                                      return (
                                        <div 
                                          key={index}
                                          className={`text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                            (isCancelled || isCompleted) ? 'line-through opacity-75 brightness-75' : ''
                                          }`}
                                          style={{ backgroundColor: getAppointmentColor(appointment) }}
                                        >
                                          <div className="font-medium flex items-center gap-1">
                                            {time}
                                            {isCompleted && (
                                              <div className="size-3 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                                <svg className="size-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                              </div>
                                            )}
                                            {isCancelled && (
                                              <div className="size-3 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                                <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                  <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <div className="truncate">{appointment.patient?.name || 'Brak danych'}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Widok tygodniowy (domyślny)
                        <>
                      {/* Calendar Header */}
                      <div className="grid grid-cols-7 gap-4 mb-4">
                        {["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"].map((day) => (
                          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-4">
                        {/* Day 7 */}
                        <div className="min-h-[120px] p-2">
                          <div className="text-lg font-medium text-gray-900 mb-2">7</div>
                        </div>

                        {/* Day 8 */}
                        <div className="min-h-[120px] p-2">
                          <div className="text-lg font-medium text-gray-900 mb-2">8</div>
                          <div className="space-y-1">
                            {calendarData[8]?.map((appointment: any, index: number) => {
                              const date = new Date(appointment.schedule);
                              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                              const isCancelled = isAppointmentCancelled(appointment);
                              const isCompleted = isAppointmentCompleted(appointment);
                              return (
                                <div 
                                  key={index}
                                  className={`text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                    (isCancelled || isCompleted) ? 'line-through opacity-75 brightness-75' : ''
                                  }`}
                                  style={{ backgroundColor: getAppointmentColor(appointment) }}
                                >
                                  <div className="font-medium flex items-center gap-1">
                                    {time}
                                    {isCompleted && (
                                      <div className="size-3 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                            </div>
                                    )}
                                    {isCancelled && (
                                      <div className="size-3 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="opacity-90 flex items-center gap-1">
                                    <span className="truncate flex-1">{appointment.patient?.name || 'Brak danych'}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {appointment.doctorAvatar && (
                                        <div className="size-4 rounded-full overflow-hidden border border-white/30">
                                          <img
                                            src={appointment.doctorAvatar}
                                            alt={appointment.primaryPhysician}
                                            className="size-full object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Day 9 */}
                        <div className="min-h-[120px] p-2">
                          <div className="text-lg font-medium text-gray-900 mb-2">9</div>
                          <div className="space-y-1">
                            {calendarData[9]?.map((appointment: any, index: number) => {
                              const date = new Date(appointment.schedule);
                              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                              const isCancelled = isAppointmentCancelled(appointment);
                              const isCompleted = isAppointmentCompleted(appointment);
                              return (
                                <div 
                                  key={index}
                                  className={`text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                    (isCancelled || isCompleted) ? 'line-through opacity-75 brightness-75' : ''
                                  }`}
                                  style={{ backgroundColor: getAppointmentColor(appointment) }}
                                >
                                  <div className="font-medium flex items-center gap-1">
                                    {time}
                                    {isCompleted && (
                                      <div className="size-3 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                            </div>
                                    )}
                                    {isCancelled && (
                                      <div className="size-3 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                        </svg>
                            </div>
                                    )}
                                  </div>
                                  <div className="opacity-90 flex items-center gap-1">
                                    <span className="truncate flex-1">{appointment.patient?.name || 'Brak danych'}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {appointment.doctorAvatar && (
                                        <div className="size-4 rounded-full overflow-hidden border border-white/30">
                                          <img
                                            src={appointment.doctorAvatar}
                                            alt={appointment.primaryPhysician}
                                            className="size-full object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Day 10 - Today (highlighted) */}
                        <div className="min-h-[120px] p-2 border-2 border-blue-400 rounded-lg bg-blue-50">
                          <div className="text-lg font-medium text-gray-900 mb-2">10</div>
                          <div className="space-y-1">
                            {calendarData[10]?.map((appointment: any, index: number) => {
                              const date = new Date(appointment.schedule);
                              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                              const isCancelled = isAppointmentCancelled(appointment);
                              const isCompleted = isAppointmentCompleted(appointment);
                              return (
                                <div 
                                  key={index}
                                  className={`text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                    (isCancelled || isCompleted) ? 'line-through opacity-75 brightness-75' : ''
                                  }`}
                                  style={{ backgroundColor: getAppointmentColor(appointment) }}
                                >
                                  <div className="font-medium flex items-center gap-1">
                                    {time}
                                    {isCompleted && (
                                      <div className="size-3 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                            </div>
                                    )}
                                    {isCancelled && (
                                      <div className="size-3 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                        </svg>
                            </div>
                                    )}
                                  </div>
                                  <div className="opacity-90 flex items-center gap-1">
                                    <span className="truncate flex-1">{appointment.patient?.name || 'Brak danych'}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {appointment.doctorAvatar && (
                                        <div className="size-4 rounded-full overflow-hidden border border-white/30">
                                          <img
                                            src={appointment.doctorAvatar}
                                            alt={appointment.primaryPhysician}
                                            className="size-full object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Day 11 */}
                        <div className="min-h-[120px] p-2">
                          <div className="text-lg font-medium text-gray-900 mb-2">11</div>
                          <div className="space-y-1">
                            {calendarData[11]?.map((appointment: any, index: number) => {
                              const date = new Date(appointment.schedule);
                              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                              const isCancelled = isAppointmentCancelled(appointment);
                              const isCompleted = isAppointmentCompleted(appointment);
                              return (
                                <div 
                                  key={index}
                                  className={`text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                    (isCancelled || isCompleted) ? 'line-through opacity-75 brightness-75' : ''
                                  }`}
                                  style={{ backgroundColor: getAppointmentColor(appointment) }}
                                >
                                  <div className="font-medium flex items-center gap-1">
                                    {time}
                                    {isCompleted && (
                                      <div className="size-3 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                            </div>
                                    )}
                                    {isCancelled && (
                                      <div className="size-3 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="opacity-90 flex items-center gap-1">
                                    <span className="truncate flex-1">{appointment.patient?.name || 'Brak danych'}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {appointment.doctorAvatar && (
                                        <div className="size-4 rounded-full overflow-hidden border border-white/30">
                                          <img
                                            src={appointment.doctorAvatar}
                                            alt={appointment.primaryPhysician}
                                            className="size-full object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Day 12 */}
                        <div className="min-h-[120px] p-2">
                          <div className="text-lg font-medium text-gray-900 mb-2">12</div>
                          <div className="space-y-1">
                            {calendarData[12]?.map((appointment: any, index: number) => {
                              const date = new Date(appointment.schedule);
                              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                              const isCancelled = isAppointmentCancelled(appointment);
                              const isCompleted = isAppointmentCompleted(appointment);
                              return (
                                <div 
                                  key={index}
                                  className={`text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                    (isCancelled || isCompleted) ? 'line-through opacity-75 brightness-75' : ''
                                  }`}
                                  style={{ backgroundColor: getAppointmentColor(appointment) }}
                                >
                                  <div className="font-medium flex items-center gap-1">
                                    {time}
                                    {isCompleted && (
                                      <div className="size-3 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                            </div>
                                    )}
                                    {isCancelled && (
                                      <div className="size-3 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                        </svg>
                            </div>
                                    )}
                            </div>
                                  <div className="opacity-90 flex items-center gap-1">
                                    <span className="truncate flex-1">{appointment.patient?.name || 'Brak danych'}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {appointment.doctorAvatar && (
                                        <div className="size-4 rounded-full overflow-hidden border border-white/30">
                                          <img
                                            src={appointment.doctorAvatar}
                                            alt={appointment.primaryPhysician}
                                            className="size-full object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Day 13 */}
                        <div className="min-h-[120px] p-2">
                          <div className="text-lg font-medium text-gray-900 mb-2">13</div>
                          <div className="space-y-1">
                            {calendarData[13]?.map((appointment: any, index: number) => {
                              const date = new Date(appointment.schedule);
                              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                              const isCancelled = isAppointmentCancelled(appointment);
                              const isCompleted = isAppointmentCompleted(appointment);
                              return (
                                <div 
                                  key={index}
                                  className={`text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                    (isCancelled || isCompleted) ? 'line-through opacity-75 brightness-75' : ''
                                  }`}
                                  style={{ backgroundColor: getAppointmentColor(appointment) }}
                                >
                                  <div className="font-medium flex items-center gap-1">
                                    {time}
                                    {isCompleted && (
                                      <div className="size-3 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                            </div>
                                    )}
                                    {isCancelled && (
                                      <div className="size-3 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                        <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                        </svg>
                          </div>
                                    )}
                        </div>
                                  <div className="opacity-90 flex items-center gap-1">
                                    <span className="truncate flex-1">{appointment.patient?.name || 'Brak danych'}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {appointment.doctorAvatar && (
                                        <div className="size-4 rounded-full overflow-hidden border border-white/30">
                                          <img
                                            src={appointment.doctorAvatar}
                                            alt={appointment.primaryPhysician}
                                            className="size-full object-cover"
                                          />
                      </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                          </div>
                        </>
                      )}
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Wizyty</h2>
                      <Button className="bg-green-600 hover:bg-green-600 text-white border-0 rounded-2xl">
                        <Plus className="mr-2 h-4 w-4" />
                        Umów pacjenta
                      </Button>
                    </div>

                    <div className="rounded-3xl border bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50/50">
                              <th className="text-left p-4 font-medium text-gray-600">#</th>
                              <th className="text-left p-4 font-medium text-gray-600">Pacjent</th>
                              <th className="text-left p-4 font-medium text-gray-600">Status</th>
                              <th className="text-left p-4 font-medium text-gray-600">Gabinet</th>
                              <th className="text-left p-4 font-medium text-gray-600">Wizyta</th>
                              <th className="text-left p-4 font-medium text-gray-600">Lekarz</th>
                              <th className="text-left p-4 font-medium text-gray-600">Akcje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentAppointments.map((visit: any, index: number) => (
                              <motion.tr
                                key={visit.id}
                                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                className="border-b last:border-b-0"
                              >
                                <td className="p-4 text-gray-600">{startIndex + index + 1}</td>
                                <td className="p-4">
                                  <div className="font-medium text-gray-900">{visit.patient?.name || 'Brak danych'}</div>
                                </td>
                                <td className="p-4">
                                  <StatusBadge status={visit.status} />
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                                      •
                                    </div>
                                    {visit.roomName ? visit.roomName.replace(/^Gabinet\s*/i, '') : 'Brak'}
                                  </div>
                                </td>
                                <td className="p-4">
                                  {(() => {
                                    const date = new Date(visit.schedule);
                                    const formattedDate = `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                                    return (
                                      <>
                                        <div className="text-gray-900">{formattedDate}</div>
                                        <div className="text-sm text-gray-500">{formattedTime}</div>
                                      </>
                                    );
                                  })()}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center">
                                    {visit.doctorAvatar ? (
                                    <img
                                        src={visit.doctorAvatar}
                                        alt={visit.primaryPhysician}
                                      className="w-8 h-8 rounded-full mr-2"
                                    />
                                    ) : (
                                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                        <span className="text-gray-600 text-xs font-medium">
                                          {visit.primaryPhysician?.split(' ').map((n: string) => n[0]).join('') || '??'}
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-gray-900">{visit.primaryPhysician || 'Brak danych'}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-1">
                                    <AppointmentDetails
                                      appointment={visit}
                                      userId={visit.userId}
                                      patientId={visit.patient.$id}
                                    />
                                    
                                    {(() => {
                                      // Backward compatibility: obsługa zarówno array jak i string
                                      let statuses: string[];
                                      
                                      if (Array.isArray(visit.status)) {
                                        statuses = visit.status;
                                      } else {
                                        statuses = visit.status.includes(',') ? visit.status.split(',').map((s: string) => s.trim()) : [visit.status];
                                      }
                                      
                                      // Jeśli array jest pusty, traktuj jako "awaiting"
                                      if (statuses.length === 0) {
                                        statuses = ["awaiting"];
                                      }
                                      
                                      const hasAwaiting = statuses.includes("awaiting") || statuses.includes("pending");
                                      const hasAccepted = statuses.includes("accepted");
                                      const hasCancelled = statuses.includes("cancelled");
                                      const isCompleted = visit.isCompleted || false;
                                      
                                      // Sprawdź czy wizyta może być oznaczona jako odbyta
                                      const canMarkAsCompleted = hasAccepted && !hasCancelled && !isCompleted;
                                      
                                      const handleMarkAsCompleted = async () => {
                                        try {
                                          await markAppointmentAsCompleted(visit.$id);
                                          // Odśwież dane po oznaczeniu jako odbyta
                                          fetchAppointments();
                                        } catch (error) {
                                          console.error("Błąd podczas oznaczania wizyty jako odbytej:", error);
                                        }
                                      };
                                      
                                      // Jeśli wizyta się odbyła, pokaż tylko akcje dla odbytych wizyt
                                      if (isCompleted) {
                                        return (
                                          <>
                                            <AppointmentNotesModal appointment={visit} />
                                            <AppointmentModal
                                              patientId={visit.patient.$id}
                                              userId={visit.userId}
                                              appointment={visit}
                                              type="create"
                                              title="Umów ponownie"
                                              description="Umów nową wizytę dla tego pacjenta."
                                              isAdminModal={true}
                                            />
                                          </>
                                        );
                                      }

                                      // Dla nieodbytych wizyt - standardowe akcje
                                      return (
                                        <>
                                          {hasAwaiting && (
                                            <AppointmentModal
                                              patientId={visit.patient.$id}
                                              userId={visit.userId}
                                              appointment={visit}
                                              type="schedule"
                                              title="Potwierdź wizytę"
                                              description="Proszę potwierdzić następujące szczegóły, aby potwierdzić wizytę."
                                              isAdminModal={true}
                                            />
                                          )}
                                          {hasAccepted && (
                                            <AppointmentModal
                                              patientId={visit.patient.$id}
                                              userId={visit.userId}
                                              appointment={visit}
                                              type="plan"
                                              title="Przełóż wizytę"
                                              description="Proszę ustawić konkretną datę i godzinę wizyty."
                                              isAdminModal={true}
                                            />
                                          )}
                                          {canMarkAsCompleted && (
                                            <button
                                              onClick={handleMarkAsCompleted}
                                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
                                            >
                                              Odbyta
                                            </button>
                                          )}
                                          {!hasCancelled && (
                                            <AppointmentModal
                                              patientId={visit.patient.$id}
                                              userId={visit.userId}
                                              appointment={visit}
                                              type="cancel"
                                              title="Anuluj wizytę"
                                              description="Czy na pewno chcesz anulować swoją wizytę?"
                                              isAdminModal={true}
                                            />
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
                        <div className="text-sm text-gray-600">
                          Strona {currentPage} z {totalPages} ({totalItems} wizyt)
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="patients" className="space-y-8 mt-0">
                  {/* Header */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Pacjenci</h1>
                    
                    {/* Search and Actions */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          placeholder="Wpisz imię, nazwisko, telefon, PESEL" 
                          className="pl-10 rounded-xl border-gray-200 bg-gray-50"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
                          Pokaż filtry
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                          Dodaj pacjenta
                      </Button>
                    </div>
                  </div>
                      </div>

                  {/* Patients Table */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600">
                        <div>Imię i nazwisko</div>
                        <div>Telefon</div>
                        <div>Ostatnia wizyta</div>
                        <div>Najbliższa wizyta</div>
                        <div>Specjalista</div>
                          <div></div>
                        </div>
                            </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {filteredPatients.map((patient: any) => {
                        const doctor = getPatientDoctor(patient)
                        const lastAppointment = getLastAppointment(patient)
                        const nextAppointment = getNextAppointment(patient)
                        
                        // Format daty
                        const formatDate = (date: Date) => {
                          return new Date(date).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        }
                        
                        const formatDateTime = (date: Date) => {
                          return new Date(date).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }

                        return (
                          <div key={patient.$id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="grid grid-cols-6 gap-4 items-center">
                            <div>
                                <div className="font-semibold text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-500">{patient.phone}</div>
                            </div>
                              <div className="text-gray-500">{patient.phone || "-"}</div>
                              <div className="text-gray-500">
                                {lastAppointment ? formatDate(lastAppointment.schedule) : "-"}
                          </div>
                          <div>
                                {nextAppointment ? (
                                  <div className="text-gray-900">{formatDateTime(nextAppointment.schedule)}</div>
                                ) : (
                                  <AppointmentModal
                                    patientId={patient.$id}
                                    userId={patient.userId}
                                    type="create"
                                    title="Umów wizytę"
                                    description={`Umów nową wizytę dla ${patient.name}`}
                                    isAdminModal={true}
                                    trigger={
                                      <Button className="bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg px-3 py-1 text-sm font-medium flex items-center gap-1">
                                        <Plus className="h-3 w-3" />
                                        Umów
                                      </Button>
                                    }
                                  />
                                )}
                            </div>
                            <div>
                                {doctor ? (
                                  <div className="flex items-center gap-2">
                                    {doctor.avatar ? (
                                      <img
                                        src={doctor.avatar}
                                        alt={doctor.name}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">
                                          {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                                        </span>
                            </div>
                                    )}
                                    <span className="text-sm text-gray-600">{doctor.name}</span>
                          </div>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                          </div>
                              <div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
                                  onClick={() => {
                                    setSelectedPatient(patient)
                                    setShowPatientModal(true)
                                  }}
                                >
                                  Karta pacjenta
                            </Button>
                          </div>
                        </div>
                      </div>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specialists" className="space-y-8 mt-0">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Lista specjalistów</h1>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-3xl bg-white border-gray-200 p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <img
                          src="/professional-woman-doctor.png"
                          alt="Sylwia Klejnowska"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Sylwia Klejnowska</h3>
                          <p className="text-gray-600">Psycholog</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gabinet:</span>
                          <span className="font-medium text-gray-900">2B</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900">sylwia.klejnowska@gmail.com</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telefon:</span>
                          <span className="font-medium text-gray-900">+48663164074</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dostępność:</span>
                          <span className="font-medium text-green-600">Dostępny</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Opłata:</span>
                          <span className="font-medium text-gray-900">150 PLN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wizyta:</span>
                          <span className="font-medium text-gray-900">30 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-green-600">Aktywny</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button className="bg-blue-600 hover:bg-blue-600 text-white rounded-2xl flex-1">Edytuj</Button>
                        <Button className="bg-green-600 hover:bg-green-600 text-white rounded-2xl flex-1">
                          Harmonogram
                        </Button>
                      </div>
                    </Card>

                    <Card className="rounded-3xl bg-gray-50 border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Dodaj specjalistę</h3>
                      <p className="text-gray-600 text-center mb-4">Dodaj nowego specjalistę do swojej poradni</p>
                      <Button className="bg-blue-600 hover:bg-blue-600 text-white rounded-2xl">
                        Dodaj specjalistę
                      </Button>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="office" className="space-y-8 mt-0">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Biuro wirtualne</h1>
                    <p className="text-gray-600">Widok z ptaka - zarządzaj gabinetami i specjalistami</p>

                    <div className="flex items-center justify-center gap-6 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">Wolny</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-600">Zajęty</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-gray-900">2B</h3>
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Zajęty
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 font-medium mb-2">Specjalista:</p>
                        <div className="flex items-center gap-3">
                          <img
                            src="/professional-woman-doctor.png"
                            alt="Sylwia Klejnowska"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="text-gray-900 font-medium">Sylwia Klejnowska</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full rounded-2xl bg-transparent">
                        Zmień
                      </Button>
                    </Card>

                    <Card className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-gray-900">2A</h3>
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Zajęty
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 font-medium mb-2">Specjalista:</p>
                        <div className="flex items-center gap-3">
                          <img
                            src="/professional-woman-doctor.png"
                            alt="Sylwia Klejnowska"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="text-gray-900 font-medium">Sylwia Klejnowska</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full rounded-2xl bg-transparent">
                        Zmień
                      </Button>
                    </Card>

                    <Card className="rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-gray-900">1B</h3>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Wolny
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 font-medium mb-2">Brak przypisanego specjalisty</p>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-600 text-white rounded-2xl">Przypisz</Button>
                    </Card>

                    <Card className="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-gray-900">1A</h3>
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Wolny
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 font-medium mb-2">Brak przypisanego specjalisty</p>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-600 text-white rounded-2xl">Przypisz</Button>
                    </Card>
                  </div>

                  <div className="text-center text-gray-500 text-sm mt-8">
                    <p>Kliknij ikonę ołówka aby edytować nazwę gabinetu</p>
                    <p>Kliknij kolor aby zmienić kolor gabinetu</p>
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="space-y-8 mt-0">
                  <div className="text-center py-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Płatności</h1>
                    <p className="text-gray-600">Sekcja płatności będzie dostępna wkrótce</p>
                  </div>
                </TabsContent>

                <TabsContent value="apps" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Creative Apps Collection</h2>
                          <p className="max-w-[600px] text-white/80">
                            Discover our full suite of professional design and creative applications.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-red-700 hover:bg-white/90">
                          <Download className="mr-2 h-4 w-4" />
                          Install Desktop App
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      All Categories
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      Creative
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      Video
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      Web
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      3D
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search apps..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">New Releases</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {apps
                        .filter((app) => app.new)
                        .map((app) => (
                          <motion.div key={app.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                            <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                    {app.icon}
                                  </div>
                                  <Badge className="rounded-xl bg-amber-500">New</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <CardTitle className="text-lg">{app.name}</CardTitle>
                                <CardDescription>{app.description}</CardDescription>
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Installation</span>
                                    <span>{app.progress}%</span>
                                  </div>
                                  <Progress value={app.progress} className="h-2 mt-1 rounded-xl" />
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="secondary" className="w-full rounded-2xl">
                                  {app.progress < 100 ? "Continue Install" : "Open"}
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">All Apps</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {apps.map((app) => (
                        <motion.div key={app.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="overflow-hidden rounded-3xl border hover:border-primary/50 transition-all duration-300">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                  {app.icon}
                                </div>
                                <Badge variant="outline" className="rounded-xl">
                                  {app.category}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <CardTitle className="text-lg">{app.name}</CardTitle>
                              <CardDescription>{app.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                              <Button variant="secondary" className="flex-1 rounded-2xl">
                                {app.progress < 100 ? "Install" : "Open"}
                              </Button>
                              <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
                                <Star className="h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="files" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Your Creative Files</h2>
                          <p className="max-w-[600px] text-white/80">
                            Access, manage, and share all your design files in one place.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button className="rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30">
                            <Cloud className="mr-2 h-4 w-4" />
                            Cloud Storage
                          </Button>
                          <Button className="rounded-2xl bg-white text-blue-700 hover:bg-white/90">
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Files
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <FileText className="mr-2 h-4 w-4" />
                      All Files
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Clock className="mr-2 h-4 w-4" />
                      Recent
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Users className="mr-2 h-4 w-4" />
                      Shared
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Star className="mr-2 h-4 w-4" />
                      Favorites
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Trash className="mr-2 h-4 w-4" />
                      Trash
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search files..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">All Files</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                          <PanelLeft className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          Sort
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-3xl border overflow-hidden">
                      <div className="bg-muted/50 p-3 hidden md:grid md:grid-cols-12 text-sm font-medium">
                        <div className="col-span-6">Name</div>
                        <div className="col-span-2">App</div>
                        <div className="col-span-2">Size</div>
                        <div className="col-span-2">Modified</div>
                      </div>
                      <div className="divide-y">
                        {recentFiles.map((file) => (
                          <motion.div
                            key={file.name}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            className="p-3 md:grid md:grid-cols-12 items-center flex flex-col md:flex-row gap-3 md:gap-0"
                          >
                            <div className="col-span-6 flex items-center gap-3 w-full md:w-auto">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                                {file.icon}
                              </div>
                              <div>
                                <p className="font-medium">{file.name}</p>
                                {file.shared && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Users className="mr-1 h-3 w-3" />
                                    Shared with {file.collaborators} people
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-span-2 text-sm md:text-base">{file.app}</div>
                            <div className="col-span-2 text-sm md:text-base">{file.size}</div>
                            <div className="col-span-2 flex items-center justify-between w-full md:w-auto">
                              <span className="text-sm md:text-base">{file.modified}</span>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="projects" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Project Management</h2>
                          <p className="max-w-[600px] text-white/80">
                            Organize your creative work into projects and collaborate with your team.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                          <Plus className="mr-2 h-4 w-4" />
                          New Project
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Layers className="mr-2 h-4 w-4" />
                      All Projects
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Clock className="mr-2 h-4 w-4" />
                      Recent
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Users className="mr-2 h-4 w-4" />
                      Shared
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Archive className="mr-2 h-4 w-4" />
                      Archived
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search projects..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Active Projects</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {projects.map((project) => (
                        <motion.div key={project.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="overflow-hidden rounded-3xl border hover:border-primary/50 transition-all duration-300">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle>{project.name}</CardTitle>
                                <Badge variant="outline" className="rounded-xl">
                                  Due {project.dueDate}
                                </Badge>
                              </div>
                              <CardDescription>{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2 rounded-xl" />
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Users className="mr-1 h-4 w-4" />
                                  {project.members} members
                                </div>
                                <div className="flex items-center">
                                  <FileText className="mr-1 h-4 w-4" />
                                  {project.files} files
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                              <Button variant="secondary" className="flex-1 rounded-2xl">
                                Open Project
                              </Button>
                              <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                      <motion.div whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                        <Card className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed p-8 hover:border-primary/50 transition-all duration-300">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Plus className="h-6 w-6" />
                          </div>
                          <h3 className="text-lg font-medium">Create New Project</h3>
                          <p className="mb-4 text-center text-sm text-muted-foreground">
                            Start a new creative project from scratch or use a template
                          </p>
                          <Button className="rounded-2xl">New Project</Button>
                        </Card>
                      </motion.div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Project Templates</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                          <h3 className="text-lg font-medium">Brand Identity</h3>
                          <p className="text-sm text-white/80">Complete brand design package</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            Popular
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            Use Template
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-amber-500 to-red-600 p-6 text-white">
                          <h3 className="text-lg font-medium">Marketing Campaign</h3>
                          <p className="text-sm text-white/80">Multi-channel marketing assets</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            New
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            Use Template
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white">
                          <h3 className="text-lg font-medium">Website Redesign</h3>
                          <p className="text-sm text-white/80">Complete website design workflow</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            Featured
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            Use Template
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white">
                          <h3 className="text-lg font-medium">Product Launch</h3>
                          <p className="text-sm text-white/80">Product launch campaign assets</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            Popular
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            Use Template
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="learn" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Learn & Grow</h2>
                          <p className="max-w-[600px] text-white/80">
                            Expand your creative skills with tutorials, courses, and resources.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-emerald-700 hover:bg-white/90">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Play className="mr-2 h-4 w-4" />
                      All Tutorials
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Courses
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Tips & Tricks
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Trending
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Saved
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search tutorials..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Featured Tutorials</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {tutorials.slice(0, 3).map((tutorial) => (
                        <motion.div key={tutorial.title} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="overflow-hidden rounded-3xl">
                            <div className="aspect-video overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Button size="icon" variant="secondary" className="h-14 w-14 rounded-full">
                                  <Play className="h-6 w-6" />
                                </Button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                                <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">
                                  {tutorial.category}
                                </Badge>
                                <h3 className="mt-2 text-lg font-medium">{tutorial.title}</h3>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>{tutorial.instructor.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{tutorial.instructor}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {tutorial.duration}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between border-t p-4">
                              <Badge variant="outline" className="rounded-xl">
                                {tutorial.level}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {tutorial.views} views
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Popular Courses</h2>
                      <Button variant="ghost" className="rounded-2xl">
                        View All
                      </Button>
                    </div>
                    <div className="rounded-3xl border overflow-hidden">
                      <div className="divide-y">
                        {tutorials.slice(3, 5).map((tutorial) => (
                          <motion.div
                            key={tutorial.title}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 flex flex-col md:flex-row gap-3"
                          >
                            <div className="flex-shrink-0">
                              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{tutorial.title}</h3>
                              <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                <Badge variant="outline" className="rounded-xl">
                                  {tutorial.level}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {tutorial.duration}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Eye className="h-3 w-3" />
                                  {tutorial.views} views
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="sm" className="rounded-xl">
                                Watch Now
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Learning Paths</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge className="rounded-xl bg-blue-500">Beginner</Badge>
                            <Award className="h-5 w-5 text-amber-500" />
                          </div>
                          <CardTitle className="mt-2">UI/UX Design Fundamentals</CardTitle>
                          <CardDescription>Master the basics of user interface and experience design</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>8 courses • 24 hours</span>
                              <span>4.8 ★</span>
                            </div>
                            <Progress value={30} className="h-2 rounded-xl" />
                            <p className="text-xs text-muted-foreground">30% completed</p>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="secondary" className="w-full rounded-2xl">
                            Continue Learning
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge className="rounded-xl bg-amber-500">Intermediate</Badge>
                            <Award className="h-5 w-5 text-amber-500" />
                          </div>
                          <CardTitle className="mt-2">Digital Illustration Mastery</CardTitle>
                          <CardDescription>Create stunning digital artwork and illustrations</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>12 courses • 36 hours</span>
                              <span>4.9 ★</span>
                            </div>
                            <Progress value={0} className="h-2 rounded-xl" />
                            <p className="text-xs text-muted-foreground">Not started</p>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="secondary" className="w-full rounded-2xl">
                            Start Learning
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge className="rounded-xl bg-red-500">Advanced</Badge>
                            <Award className="h-5 w-5 text-amber-500" />
                          </div>
                          <CardTitle className="mt-2">Motion Graphics & Animation</CardTitle>
                          <CardDescription>Create professional motion graphics and animations</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>10 courses • 30 hours</span>
                              <span>4.7 ★</span>
                            </div>
                            <Progress value={0} className="h-2 rounded-xl" />
                            <p className="text-xs text-muted-foreground">Not started</p>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="secondary" className="w-full rounded-2xl">
                            Start Learning
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </section>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>

      {/* Patient Card Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Szczegóły wizyty</h2>
                  <p className="text-gray-600 mt-1">Pełne informacje o wizycie i pacjencie</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Visit Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Informacje o wizycie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1 flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                        Potwierdzona
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 rounded-full px-3 py-1">
                        Odbyta
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data i godzina</label>
                    <p className="mt-1 text-gray-900 font-medium">sobota, 13 września 2025 12:45</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lekarz</label>
                    <div className="mt-1 flex items-center">
                      <img
                        src="/placeholder.svg?height=32&width=32"
                        alt="Dr. Sylwia Klejnowska"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-gray-900 font-medium">Sylwia Klejnowska</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Powód wizyty</label>
                    <p className="mt-1 text-gray-900">--</p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Dane osobowe pacjenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Imię i nazwisko</label>
                    <p className="mt-1 text-gray-900 font-medium">{selectedVisit.patient}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1 text-gray-900">ola.gor109@gmail.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Numer telefonu</label>
                    <p className="mt-1 text-gray-900">+48511067638</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data urodzenia</label>
                    <p className="mt-1 text-gray-900">19 kwietnia 2000</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Płeć</label>
                    <p className="mt-1 text-gray-900">Kobieta</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Adres</label>
                    <p className="mt-1 text-gray-900">Wesoła 48 Rybie</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Zawód</label>
                    <p className="mt-1 text-gray-900">Pracownik</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Prowadzący</label>
                    <p className="mt-1 text-gray-900">Sylwia Klejnowska</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Informacje medyczne</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ubezpieczyciel</label>
                      <p className="mt-1 text-gray-900">NFZ</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Numer polisy</label>
                      <p className="mt-1 text-gray-900">--</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alergie</label>
                    <p className="mt-1 text-green-600">Brak</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Orzechy</label>
                    <p className="mt-1 text-gray-900">żadne</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Aktualnie przyjmowane leki</label>
                    <p className="mt-1 text-gray-900">żadne</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Historia medyczna rodziny</label>
                    <p className="mt-1 text-gray-900">żadne</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Przebyte choroby</label>
                    <p className="mt-1 text-gray-900">żadne</p>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Zgody i prywatność</h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-900">Zgoda na politykę prywatności</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="bg-yellow-600 hover:bg-yellow-600 text-white rounded-2xl flex-1">
                  Notatka
                </Button>
                <Button className="bg-green-600 hover:bg-green-600 text-white rounded-2xl flex-1">
                  Umów ponownie
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {modalType === "reschedule" && selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Przełóż Wizytę</h2>
                  <p className="text-gray-600 mt-1">Proszę ustawić konkretną datę i godzinę wizyty.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Doctor Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Lekarz</label>
                  <div className="p-3 border rounded-2xl bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src="/placeholder.svg?height=32&width=32"
                        alt="Sylwia Klejnowska"
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Sylwia Klejnowska</p>
                        <p className="text-sm text-gray-600">Psycholog</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Date and Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Data i godzina</label>
                  <div className="p-3 border rounded-2xl bg-white flex items-center justify-between">
                    <span className="text-gray-900">15/09/2025 - 12:30</span>
                    <X className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Visit Reason */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Powód wizyty</label>
                  <textarea
                    placeholder="Witam"
                    className="w-full p-3 border rounded-2xl bg-white resize-none h-20"
                  />
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Preferowane godziny</label>
                  <textarea
                    placeholder="Preferuję popołudniowe wizyty, jeśli to możliwe"
                    className="w-full p-3 border rounded-2xl bg-white resize-none h-20"
                  />
                </div>

                {/* Action Button */}
                <Button className="w-full bg-green-600 hover:bg-green-600 text-white rounded-2xl py-3 mt-6">
                  Przełóż wizytę
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {modalType === "cancel" && selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Anuluj Wizytę</h2>
                  <p className="text-gray-600 mt-1">Czy na pewno chcesz anulować swoją wizytę?</p>
    </div>
                <Button variant="ghost" size="sm" onClick={closeModal} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Powód anulowania</label>
                  <textarea
                    placeholder="Pilne spotkanie"
                    className="w-full p-3 border rounded-2xl bg-white resize-none h-24"
                  />
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-600 text-white rounded-2xl py-3 mt-6">
                  Anuluj wizytę
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Card Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Karta pacjenta</h2>
                  <p className="text-gray-600 mt-1">Pełne informacje o pacjencie</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPatientModal(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dane osobowe</h3>
                  <div className="space-y-3">
                    <EditableField
                      field="name"
                      label="Imię i nazwisko"
                      value={selectedPatient.name}
                    />
                    <EditableField
                      field="email"
                      label="Email"
                      value={selectedPatient.email}
                      type="email"
                    />
                    <EditableField
                      field="phone"
                      label="Telefon"
                      value={selectedPatient.phone}
                      type="tel"
                    />
                    <EditableField
                      field="birthDate"
                      label="Data urodzenia"
                      value={selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('pl-PL') : ''}
                      type="date"
                    />
                    <EditableField
                      field="gender"
                      label="Płeć"
                      value={selectedPatient.gender || ''}
                      type="select"
                      options={[
                        { value: 'male', label: 'Mężczyzna' },
                        { value: 'female', label: 'Kobieta' },
                        { value: 'other', label: 'Inne' }
                      ]}
                    />
                    <EditableField
                      field="address"
                      label="Adres"
                      value={selectedPatient.address || ''}
                    />
                    <EditableField
                      field="occupation"
                      label="Zawód"
                      value={selectedPatient.occupation || ''}
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informacje medyczne</h3>
                  <div className="space-y-3">
                    <EditableField
                      field="primaryPhysician"
                      label="Lekarz prowadzący"
                      value={selectedPatient.primaryPhysician || ''}
                      type="select"
                      options={doctors.map((doctor: any) => ({
                        value: doctor.name,
                        label: doctor.name
                      }))}
                    />
                    <EditableField
                      field="insuranceProvider"
                      label="Ubezpieczyciel"
                      value={selectedPatient.insuranceProvider || ''}
                      type="select"
                      options={[
                        { value: 'NFZ', label: 'NFZ' },
                        { value: 'Luxmed', label: 'Luxmed' },
                        { value: 'Medicover', label: 'Medicover' },
                        { value: 'Enel-Med', label: 'Enel-Med' },
                        { value: 'Prywatnie', label: 'Prywatnie' }
                      ]}
                    />
                    <EditableField
                      field="insurancePolicyNumber"
                      label="Numer polisy"
                      value={selectedPatient.insurancePolicyNumber || ''}
                    />
                    <EditableField
                      field="allergies"
                      label="Alergie"
                      value={selectedPatient.allergies || ''}
                    />
                    <EditableField
                      field="currentMedication"
                      label="Aktualnie przyjmowane leki"
                      value={selectedPatient.currentMedication || ''}
                    />
                    <EditableField
                      field="familyMedicalHistory"
                      label="Historia medyczna rodziny"
                      value={selectedPatient.familyMedicalHistory || ''}
                    />
                    <EditableField
                      field="pastMedicalHistory"
                      label="Przebyte choroby"
                      value={selectedPatient.pastMedicalHistory || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt awaryjny</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    field="emergencyContactName"
                    label="Imię i nazwisko"
                    value={selectedPatient.emergencyContactName || ''}
                  />
                  <EditableField
                    field="emergencyContactNumber"
                    label="Numer telefonu"
                    value={selectedPatient.emergencyContactNumber || ''}
                    type="tel"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <AppointmentModal
                  patientId={selectedPatient.$id}
                  userId={selectedPatient.userId}
                  type="create"
                  title="Umów wizytę"
                  description={`Umów nową wizytę dla ${selectedPatient.name}`}
                  isAdminModal={true}
                  trigger={
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex-1">
                      Umów wizytę
                    </Button>
                  }
                />
                <Button variant="outline" className="rounded-2xl flex-1">
                  Edytuj dane
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
};

