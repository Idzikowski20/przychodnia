"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SecurityPopup } from "@/components/SecurityPopup"
import { useActivityTracker } from "@/hooks/useActivityTracker"
import { getRecentAppointmentList, markAppointmentAsCompleted, getDashboardStats, getUpcomingAppointments, getRevenueData, updateAppointment } from "@/lib/actions/appointment.actions"
import { getPatients, updatePatient, deletePatient } from "@/lib/actions/patient.actions"
import { getDoctors, createDoctor, updateDoctor } from "@/lib/actions/doctor.actions"
import { getSchedules, getScheduleSlots, getScheduleSlotsForDate, createSchedule, createScheduleSlot, updateScheduleSlot, deleteScheduleSlot } from "@/lib/actions/schedule.actions"
import { getTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from "@/lib/actions/task.actions"
import { uploadFileToStorage } from "@/lib/upload"
import { StatusBadge } from "@/components/StatusBadge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useToast } from "@/components/ui/toast"

// Predefiniowane gabinety
const PREDEFINED_ROOMS = [
  { id: 1, name: "Gabinet 1", color: "#3B82F6" }, // Niebieski
  { id: 2, name: "Gabinet 2", color: "#10B981" }, // Zielony
  { id: 3, name: "Gabinet 3", color: "#F59E0B" }, // Pomarańczowy
  { id: 4, name: "Gabinet 4", color: "#EF4444" }, // Czerwony
]
import { AppointmentDetails } from "@/components/AppointmentDetails"
import { AppointmentDetailsContent } from "@/components/AppointmentDetailsContent"
import { AppointmentModal } from "@/components/AppointmentModal"
import { AppointmentConfirmationModal } from "@/components/AppointmentConfirmationModal"
import { AppointmentRescheduleModal } from "@/components/AppointmentRescheduleModal"
import { AppointmentNotesModal } from "@/components/AppointmentNotesModal"
import { WeeklyAppointmentsView } from "@/components/WeeklyAppointmentsView"
import { MonthlyAppointmentsView } from "@/components/MonthlyAppointmentsView"
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Brush,
  Calendar,
  Camera,
  CheckCircle,
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
  ChevronUp,
  ChevronDown,
  User,
  Edit3,
  Save,
  X as XIcon,
  Trash2,
  BarChart3,
  PhoneOff,
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

// Odchudzone: usunięto demonstracyjne "apps" (nieużywane)

// Odchudzone: usunięto demonstracyjne "recentFiles" (nieużywane)

// Odchudzone: usunięto demonstracyjne "projects" (nieużywane)

// Odchudzone: usunięto demonstracyjne "tutorials" (nieużywane)

// Odchudzone: usunięto demonstracyjne "communityPosts" (nieużywane)

const sidebarItems = [
  {
    title: "Pulpit",
    icon: <Home />,
    value: "dashboard",
  },
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
    title: "Grafik",
    icon: <User />,
    value: "specialists",
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
    doctorAvatar: "/assets/images/sylwia.jpg",
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
    doctorAvatar: "/assets/images/sylwia.jpg",
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
    doctorAvatar: "/assets/images/sylwia.jpg",
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
    doctorAvatar: "/assets/images/sylwia.jpg",
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
    doctorAvatar: "/assets/images/sylwia.jpg",
    actions: ["Szczegóły"],
  },
]

export function DesignaliCreative() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [modalType, setModalType] = useState<string | null>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  
  // System bezpieczeństwa
  const [showSecurityPopup, setShowSecurityPopup] = useState(false)
  const [sessionMinutes, setSessionMinutes] = useState<number>(10)
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false)
  const { isActive, timeRemaining, formattedTime, resetTimer } = useActivityTracker({
    timeoutMinutes: sessionMinutes,
    onTimeout: () => setShowSecurityPopup(true),
    enabled: true
  })
  const [appointments, setAppointments] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [appointmentsView, setAppointmentsView] = useState<"monthly" | "weekly">("weekly")
  
  // Hook do obsługi dźwięku i animacji tytułu
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const buttonAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isNewAppointment, setIsNewAppointment] = useState(false)
  const [titleAnimation, setTitleAnimation] = useState(false)
  const [lastAppointmentCount, setLastAppointmentCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('lastAppointmentCount') || '0')
    }
    return 0
  })
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('audioEnabled') === 'true'
    }
    return false
  })

  // Funkcja do zapisywania stanu w localStorage
  const setAudioEnabledWithStorage = (enabled: boolean) => {
    setAudioEnabled(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioEnabled', enabled.toString())
    }
  }

  // Funkcja do zapisywania liczby wizyt w localStorage
  const setLastAppointmentCountWithStorage = (count: number) => {
    setLastAppointmentCount(count)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastAppointmentCount', count.toString())
    }
  }

  // Przywróć autoplay po odświeżeniu strony
  useEffect(() => {
    if (audioEnabled && audioRef.current) {
      // Odtwórz cichy dźwięk aby "odblokować" autoplay
      audioRef.current.volume = 0.01
      audioRef.current.play().then(() => {
        audioRef.current!.volume = 1
      }).catch((error) => {
        console.error("❌ Błąd przywracania autoplay:", error)
      })
    }
  }, [audioEnabled])

  // Funkcja do aktywacji dźwięku (wymagana przez przeglądarkę)
  const enableAudio = () => {
    if (audioRef.current) {
      // Odtwórz cichy dźwięk aby "odblokować" autoplay
      audioRef.current.volume = 0.01
      audioRef.current.play().then(() => {
        setAudioEnabledWithStorage(true)
        // Przywróć normalną głośność
        audioRef.current!.volume = 1
      }).catch((error) => {
        console.error("❌ Błąd aktywacji dźwięku:", error)
      })
    }
  }

  // Funkcja do odtwarzania dźwięku
  const playNotificationSound = () => {
    if (!audioEnabled) {
      return
    }
    
    if (audioRef.current) {
      
      // Spróbuj odtworzyć dźwięk
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Dźwięk odtworzony pomyślnie
        }).catch((error) => {
          console.error("❌ Błąd odtwarzania dźwięku:", error)
          console.error("❌ Typ błędu:", error.name)
          console.error("❌ Wiadomość:", error.message)
          
          // Jeśli błąd autoplay, spróbuj ponownie z interakcją
          if (error.name === 'NotAllowedError') {
            // Spróbuj odtworzyć cichy dźwięk aby odblokować autoplay
            audioRef.current!.volume = 0.01
            audioRef.current!.play().then(() => {
              audioRef.current!.volume = 1
              // Spróbuj ponownie odtworzyć główny dźwięk
              audioRef.current!.play().catch(() => {
                // Nadal nie można odtworzyć dźwięku
              })
            }).catch(() => {
              // Nie można odblokować autoplay
            })
          }
        })
      }
    } else {
      console.error("❌ Audio element nie znaleziony!")
    }
  }

  // Funkcja do odtwarzania dźwięku przycisku
  const playButtonSound = () => {
    if (buttonAudioRef.current) {
      buttonAudioRef.current.play().catch((error) => {
        console.error("Błąd odtwarzania dźwięku przycisku:", error)
      })
    }
  }

  // Funkcja do animacji tytułu
  const animateTitle = () => {
    setTitleAnimation(true)
    setTimeout(() => setTitleAnimation(false), 5000) // 5 sekund animacji
  }


  // Monitorowanie nowych wizyt
  useEffect(() => {
    if (appointments?.documents) {
      const currentCount = appointments.documents.length
      
      // Sprawdź czy to pierwsze ładowanie (lastAppointmentCount = 0)
      if (lastAppointmentCount === 0) {
        setLastAppointmentCountWithStorage(currentCount)
        return
      }
      
      if (currentCount > lastAppointmentCount) {
        // Nowa wizyta została dodana
        setIsNewAppointment(true)
        
        // Odtwórz dźwięk zawsze, niezależnie od stanu okna
        playNotificationSound()
        
        // Sprawdź czy okno jest aktywne
        if (document.hasFocus()) {
          // Okno jest aktywne - animuj tytuł
          animateTitle()
          // Zatrzymaj animację po 5 sekundach
          setTimeout(() => setIsNewAppointment(false), 5000)
        } else {
          // Okno nie jest aktywne - ustaw tytuł na "Nowa wizyta"
          document.title = "Nowa wizyta!"
          // Nie zatrzymuj animacji - zostanie zatrzymana gdy użytkownik wróci
        }
      }
      setLastAppointmentCountWithStorage(currentCount)
    }
  }, [appointments])

  // Obsługa powrotu użytkownika do okna
  useEffect(() => {
    const handleFocus = () => {
      if (isNewAppointment && !titleAnimation) {
        // Użytkownik wrócił i jest nowa wizyta - odtwórz dźwięk i animuj tytuł
        playNotificationSound()
        animateTitle()
        // Zatrzymaj animację po 5 sekundach
        setTimeout(() => setIsNewAppointment(false), 5000)
      }
    }

    const handleBlur = () => {
      // Gdy użytkownik opuszcza okno, nie rób nic - tytuł zostanie "Nowa wizyta!"
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [isNewAppointment, titleAnimation])


  // Automatyczne odświeżanie danych co 60 sekund
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [appointmentsData, patientsData, doctorsData] = await Promise.all([
          getRecentAppointmentList().catch(err => {
            console.error("Błąd pobierania wizyt:", err)
            return appointments // Zwróć poprzednie dane
          }),
          getPatients().catch(err => {
            console.error("Błąd pobierania pacjentów:", err)
            return patients || []
          }),
          getDoctors().catch(err => {
            console.error("Błąd pobierania lekarzy:", err)
            return doctors || []
          })
        ])
        
        if (appointmentsData) {
          setAppointments(appointmentsData)
        }
        if (patientsData) {
          setPatients(patientsData)
        }
        if (doctorsData) {
          setDoctors(doctorsData)
        }
      } catch (error) {
        console.error("❌ Błąd odświeżania danych:", error)
      }
    }, 10000) // 10 sekund

    return () => clearInterval(interval)
  }, [appointments, patients, doctors])
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  
  // Dashboard states
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(false)
  
  // Schedule states
  const [schedules, setSchedules] = useState<any[]>([])
  const [scheduleSlots, setScheduleSlots] = useState<any[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [scheduleModalType, setScheduleModalType] = useState<"working" | "vacation" | "sick_leave">("working")
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [monthlyStats, setMonthlyStats] = useState<{[key: string]: any}>({})
  const [modalTimeSlots, setModalTimeSlots] = useState<Array<{
    id: string
    startTime: string
    endTime: string
    type: "commercial" | "nfz"
    appointmentDuration: number
    consultationFee: number
  }>>([])
  const [currentSchedule, setCurrentSchedule] = useState<any>(null)
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "fixed" | "weekly">("weekly")
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [newSpecialist, setNewSpecialist] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    isActive: true,
    avatar: "",
    bio: "",
    workingHours: "{}",
    breakDuration: "15",
    maxAppointmentsPerDay: "20",
    currency: "PLN",
    notes: ""
  })
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  // Nawigacja kalendarza miesięcznego
  const [monthCursor, setMonthCursor] = useState<Date>(new Date())

  const openModal = (visit: any, type: string) => {
    setSelectedVisit(visit)
    setModalType(type)
  }

  const closeModal = () => {
    setSelectedVisit(null)
    setModalType(null)
  }

  // Funkcje systemu bezpieczeństwa
  const handleSecuritySuccess = () => {
    setShowSecurityPopup(false)
    // Resetuj timer - nowa sesja 10 minutowa
    resetTimer()
  }

  const handleSecurityClose = () => {
    // Nie pozwalaj na zamknięcie bez kodu
    return
  }

  // Zmiana tytułu strony
  useEffect(() => {
    if (titleAnimation) {
      const interval = setInterval(() => {
        document.title = document.title === "CarePulse" ? "Nowa wizyta!" : "CarePulse"
      }, 500) // Zmiana co 500ms
      
      return () => {
        clearInterval(interval)
        // Nie resetuj tytułu automatycznie - zostanie zresetowany przez isNewAppointment
      }
    } else if (!isNewAppointment) {
      // Resetuj tytuł tylko gdy nie ma nowej wizyty
      document.title = "CarePulse"
    }
  }, [titleAnimation, isNewAppointment])

  const fetchAppointments = async () => {
    try {
      const appointmentsData = await getRecentAppointmentList()
      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Błąd podczas pobierania wizyt:", error)
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

  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const handleConfirmAppointmentSubmit = async () => {
    try {
      if (!selectedAppointment?.$id) {
        console.error('Brak ID wizyty do potwierdzenia');
        return;
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw";
      
      // Optymistycznie zaznacz jako pending i zaktualizuj status lokalnie
      setPendingIds(prev => new Set(prev).add(selectedAppointment.$id))
      setAppointments((prev: any) => prev ? { ...prev, documents: prev.documents.map((a: any) => a.$id === selectedAppointment.$id ? { ...a, status: ["accepted"] } : a) } : prev)

      // Backend w tle
      updateAppointment({
        appointmentId: selectedAppointment.$id,
        userId: selectedAppointment.userId,
        type: "schedule",
        timeZone,
      }).then(() => {
        // Toast sukcesu po zakończeniu
        toast({
          variant: "default",
          title: "✅ Wizyta potwierdzona",
          description: "Wizyta została pomyślnie potwierdzona i pacjent otrzymał powiadomienie."
        });
      }).catch((error) => {
        // Toast błędu i cofnij optymistyczną zmianę
        console.error('❌ Błąd podczas potwierdzania wizyty:', error);
        setAppointments((prev: any) => prev ? { ...prev, documents: prev.documents.map((a: any) => a.$id === selectedAppointment.$id ? { ...a, status: selectedAppointment.status } : a) } : prev)
        toast({
          variant: "destructive",
          title: "Błąd potwierdzania",
          description: "Nie udało się potwierdzić wizyty. Spróbuj ponownie."
        });
      }).finally(() => {
        setPendingIds(prev => { const n = new Set(prev); n.delete(selectedAppointment.$id); return n })
      })

      // Zamknij modal bez przeładowania
      setShowConfirmationModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('❌ Błąd podczas potwierdzania wizyty:', error);
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas potwierdzania wizyty."
      });
    }
  };

  const handleConfirmAppointment = (visit: any) => {
    setSelectedAppointment(visit);
    setShowConfirmationModal(true);
  };

  const handleRescheduleAppointment = (visit: any) => {
    setSelectedAppointment(visit);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (data: { doctorId: string; newDate: string; reason: string }) => {
    try {
      if (!selectedAppointment?.$id) {
        console.error('Brak ID wizyty do przełożenia');
        return;
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw";
      const newDoctor = doctors.find(d => d.$id === data.doctorId);
      const rescheduleNote = `Przełożenie wizyty: ${data.reason}`;
      
      // Optymistycznie zaktualizuj status lokalnie
      setPendingIds(prev => new Set(prev).add(selectedAppointment.$id))
      setAppointments((prev: any) => prev ? { 
        ...prev, 
        documents: prev.documents.map((a: any) => a.$id === selectedAppointment.$id ? { 
          ...a, 
          status: ["scheduled"], 
          schedule: new Date(data.newDate),
          primaryPhysician: newDoctor?.name || selectedAppointment.primaryPhysician,
          rescheduleNote: rescheduleNote
        } : a) 
      } : prev)

      // Backend w tle
      await updateAppointment({
        appointmentId: selectedAppointment.$id,
        userId: selectedAppointment.userId,
        appointment: {
          primaryPhysician: newDoctor?.name || selectedAppointment.primaryPhysician,
          schedule: new Date(data.newDate),
          status: ["scheduled"],
          rescheduleNote: rescheduleNote
        },
        type: "plan",
        timeZone,
      });

      // Toast sukcesu
      toast({
        variant: "default",
        title: "📅 Wizyta przełożona",
        description: "Wizyta została pomyślnie przełożona."
      });

      setShowRescheduleModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('❌ Błąd podczas przełożenia wizyty:', error);
      // Cofnij optymistyczną zmianę
      setAppointments((prev: any) => prev ? { ...prev, documents: prev.documents.map((a: any) => a.$id === selectedAppointment.$id ? { ...a, status: selectedAppointment.status, schedule: selectedAppointment.schedule, primaryPhysician: selectedAppointment.primaryPhysician, rescheduleNote: selectedAppointment.rescheduleNote } : a) } : prev)
      toast({
        variant: "destructive",
        title: "Błąd przełożenia",
        description: "Nie udało się przełożyć wizyty. Spróbuj ponownie."
      });
    } finally {
      setPendingIds(prev => { const n = new Set(prev); n.delete(selectedAppointment.$id); return n })
    }
  };

  // Schedule functions
  const fetchSchedules = async () => {
    try {
      const schedulesData = await getSchedules()

      setSchedules(schedulesData || [])
      
      // Pobierz sloty dla wszystkich harmonogramów
      const allSlots = []
      for (const schedule of schedulesData || []) {
        const slots = await getScheduleSlots(schedule.$id)

        allSlots.push(...slots)
      }

      setScheduleSlots(allSlots)
    } catch (error) {
      console.error("Błąd podczas pobierania harmonogramów:", error)
    }
  }

  const initializeMonthlySchedule = async () => {
    try {
      const schedulesData = await getSchedules()
      if (!schedulesData || schedulesData.length === 0) return

      const currentMonth = monthCursor
      const monthDates = getMonthDates(currentMonth)
      
      // Sprawdź czy już istnieją sloty dla tego miesiąca
      const hasExistingSlots = scheduleSlots.some(slot => 
        slot.specificDate && 
        monthDates.some(date => 
          new Date(slot.specificDate).toDateString() === date.toDateString()
        )
      )

      // Jeśli już istnieją sloty dla tego miesiąca, nie inicjalizuj ponownie
      if (hasExistingSlots) {

        return
      }


      
      for (const schedule of schedulesData) {
        const doctor = doctors.find(d => d.$id === schedule.doctorId)
        if (!doctor) continue

        for (const date of monthDates) {
          const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
          const weeklySlots = scheduleSlots.filter(slot => 
            slot.scheduleId === schedule.$id && slot.dayOfWeek === dayOfWeek
          )

          // Sprawdź czy już istnieją sloty dla tej daty
          const existingSlots = scheduleSlots.filter(slot => 
            slot.scheduleId === schedule.$id &&
            slot.specificDate && 
            new Date(slot.specificDate).toDateString() === date.toDateString()
          )

          // Jeśli nie ma slotów dla tej daty, ale są sloty tygodniowe, utwórz je
          if (existingSlots.length === 0 && weeklySlots.length > 0) {
            for (const weeklySlot of weeklySlots) {
              const toLocalDateKey = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }

              await createScheduleSlot({
                scheduleId: schedule.$id,
                doctorId: schedule.doctorId,
                specificDate: toLocalDateKey(date),
                startTime: weeklySlot.startTime,
                endTime: weeklySlot.endTime,
                type: weeklySlot.type,
                status: weeklySlot.status,
                roomName: weeklySlot.roomName,
                roomColor: weeklySlot.roomColor
              })
            }
          }
        }
      }

      // Odśwież dane
      await fetchSchedules()

    } catch (error) {
      console.error("Błąd podczas inicjalizacji harmonogramu miesięcznego:", error)
    }
  }

  // Specialist form functions
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedAvatar(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSpecialistInputChange = (field: string, value: string) => {
    setNewSpecialist(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSpecialist = async () => {
    try {
      // Walidacja wymaganych pól
      if (!newSpecialist.name || !newSpecialist.email || !newSpecialist.specialization) {
        toast({ variant: "destructive", title: "Brak danych", description: "Proszę wypełnić wszystkie wymagane pola" })
        return
      }

      // Walidacja formatu emaila - bardzo restrykcyjna dla Appwrite
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newSpecialist.email)) {
        toast({ variant: "destructive", title: "Nieprawidłowy email", description: "Użyj znaków a-z, A-Z, 0-9, ., _, -" })
        return
      }
      
      // Konwersja polskich znaków na ASCII dla Appwrite (opcjonalne)
      let processedEmail = newSpecialist.email;
      const polishToAscii: { [key: string]: string } = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
      };
      
      // Zamień polskie znaki na ASCII
      processedEmail = processedEmail.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (match) => polishToAscii[match] || match);
      



      let avatarUrl = "";
      
      // Wgraj plik do Appwrite Storage jeśli został wybrany
      if (selectedAvatar) {
        try {
          avatarUrl = await uploadFileToStorage(selectedAvatar);
        } catch (uploadError) {
          console.error("Błąd podczas wgrywania zdjęcia:", uploadError);
          toast({ variant: "destructive", title: "Błąd uploadu", description: "Specjalista zostanie dodany bez zdjęcia" })
        }
      }

      // Przygotuj dane do zapisania
      const specialistData = {
        ...newSpecialist,
        name: `${newSpecialist.name.split(' ')[0]} ${newSpecialist.name.split(' ')[1] || ''}`.trim(),
        email: processedEmail, // Użyj przetworzonego emaila bez polskich znaków
        licenseNumber: newSpecialist.licenseNumber || `LIC-${Date.now()}`,
        avatar: avatarUrl,
        appointmentDuration: "30", // Domyślna wartość
        consultationFee: "150" // Domyślna wartość
      }

      // Zapisz specjalistę

      const result = await createDoctor(specialistData)
      
      if (result) {
        // Odśwież listę lekarzy
        await fetchDoctors()
        
        // Zamknij modal i wyczyść formularz
        setShowAddEmployeeModal(false)
        setNewSpecialist({
          name: "",
          email: "",
          phone: "",
          specialization: "",
          licenseNumber: "",
          isActive: true,
          avatar: "",
          bio: "",
          workingHours: "{}",
          breakDuration: "15",
          maxAppointmentsPerDay: "20",
          currency: "PLN",
          notes: ""
        })
        setSelectedAvatar(null)
        setAvatarPreview("")
        
        toast({ variant: "success", title: "Dodano specjalistę" })
      }
    } catch (error: any) {
      console.error("Błąd podczas dodawania specjalisty:", error)
      console.error("Szczegóły błędu:", error.response)
      
      if (error.message && error.message.includes("email")) {
        toast({ variant: "destructive", title: "Błąd", description: "Nieprawidłowy format emaila" })
      } else if (error.response && error.response.message) {
        toast({ variant: "destructive", title: "Błąd", description: String(error.response?.message || "Błąd zapisu") })
      } else {
        toast({ variant: "destructive", title: "Błąd", description: String(error.message || "Nieznany błąd") })
      }
    }
  }

  const getWeekDates = (date: Date) => {
    const week = []
    const input = new Date(date)
    
    // Znajdź poniedziałek tygodnia dla podanej daty
    const monday = new Date(input)
    const day = input.getDay()
    const diff = day === 0 ? -6 : 1 - day // poniedziałek
    monday.setDate(input.getDate() + diff)

    const startOfWeek = monday
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      week.push(d)
    }
    return week
  }

  // Funkcje pomocnicze do podsumowania miesięcznego
  const getMonthlyStats = async (doctorId: string, month: Date) => {
    try {
      const year = month.getFullYear()
      const monthNumber = month.getMonth() + 1
      
      // Importuj funkcję z actions
      const { getMonthlyStats: getStatsFromDB } = await import('../../lib/actions/schedule.actions')
      
      // Pobierz statystyki z bazy danych
      const stats = await getStatsFromDB(doctorId, year, monthNumber)
      
      return {
        totalHours: stats.totalHours || 0,
        vacationDays: stats.vacationDays || 0,
        sickLeaveDays: stats.sickLeaveDays || 0,
        workingDays: stats.workingDays || 0,
        remainingVacationDays: typeof stats.remainingVacationDays === 'number' ? stats.remainingVacationDays : 21
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error)
      return {
        totalHours: 0,
        vacationDays: 0,
        sickLeaveDays: 0,
        workingDays: 0,
        remainingVacationDays: 21
      }
    }
  }

  const getMonthDates = (date: Date) => {
    const month = []
    const year = date.getFullYear()
    const monthIndex = date.getMonth()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, monthIndex, i)
      month.push(d)
    }
    return month
  }

  // Zwraca poniedziałki wszystkich tygodni zawierających się w danym miesiącu
  const getWeeksOfMonth = (date: Date) => {
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7
    const gridStart = new Date(firstOfMonth)
    gridStart.setDate(firstOfMonth.getDate() - mondayOffset)
    const weeks: Date[] = []
    for (let w = 0; w < 6; w++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + w * 7)
      weeks.push(d)
    }
    return weeks
  }

  const formatWeekRange = (date: Date) => {
    const week = getWeekDates(date)
    const start = week[0]
    const end = week[6]
    
    const startStr = start.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
    const endStr = end.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
    
    return `${startStr} - ${endStr}`
  }

  const getDaySlots = (doctorId: string, dayOfWeek: number) => {
    const doctorScheduleIds = schedules.filter(s => s.doctorId === doctorId).map(s => s.$id)
    return scheduleSlots.filter(slot => 
      (slot.doctorId === doctorId || doctorScheduleIds.includes(slot.scheduleId)) &&
      slot.dayOfWeek === dayOfWeek
    )
  }

  const getDaySlotsForDate = (doctorId: string, date: Date) => {
    const doctorScheduleIds = schedules.filter(s => s.doctorId === doctorId).map(s => s.$id)
    if (doctorScheduleIds.length === 0) return []
    const toLocalDateKey = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const normalizeSpecificDate = (value: any): string | null => {
      if (!value) return null
      if (typeof value === 'string') {
        // jeśli już jest w formacie YYYY-MM-DD – zwróć bez zmian
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
        const d = new Date(value)
        if (isNaN(d.getTime())) return null
        return toLocalDateKey(d)
      }
      const d = new Date(value)
      if (isNaN(d.getTime())) return null
      return toLocalDateKey(d)
    }
    const targetKey = toLocalDateKey(date)
    const filtered = scheduleSlots.filter(slot => 
      (slot.doctorId === doctorId || doctorScheduleIds.includes(slot.scheduleId)) &&
      normalizeSpecificDate(slot.specificDate) === targetKey
    )
    // debug
    // console.log('[getDaySlotsForDate]', {doctorId, date: targetKey, found: filtered.length})
    return filtered
  }

  // Funkcja sprawdzająca czy slot jest z przeszłości i czy to urlop/zwolnienie
  const isPastVacationOrSickLeave = (slot: any, date?: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let slotDate: Date
    if (date) {
      slotDate = new Date(date)
    } else if (slot.specificDate) {
      slotDate = new Date(slot.specificDate)
    } else {
      return false // Nie można określić daty
    }
    
    slotDate.setHours(0, 0, 0, 0)
    
    return slotDate < today && (slot.status === 'vacation' || slot.status === 'sick_leave')
  }

  // Funkcja do analizy poprzednich stawek pracownika
  const getDoctorHistoricalRates = (doctorId: string) => {
    const doctorSlots = scheduleSlots.filter(slot => 
      slot.doctorId === doctorId || 
      schedules.find(s => s.$id === slot.scheduleId)?.doctorId === doctorId
    )
    
    // Sortuj sloty według daty utworzenia (najnowsze pierwsze)
    const sortedSlots = doctorSlots.sort((a, b) => {
      const dateA = new Date(a.$createdAt || 0)
      const dateB = new Date(b.$createdAt || 0)
      return dateB.getTime() - dateA.getTime()
    })
    
    const commercialRates: { rate: number, date: Date }[] = []
    const durations: { duration: number, date: Date }[] = []
    const timeRanges: { start: string, end: string, date: Date }[] = []
    
    sortedSlots.forEach(slot => {
      if (slot.roomName) {
        try {
          const roomData = JSON.parse(slot.roomName)
          const slotDate = new Date(slot.$createdAt || 0)
          
          if (roomData.consultationFee !== undefined) {
            if (slot.type === 'commercial') {
              commercialRates.push({ rate: roomData.consultationFee, date: slotDate })
            }
          }
          if (roomData.appointmentDuration) {
            durations.push({ duration: roomData.appointmentDuration, date: slotDate })
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      if (slot.startTime && slot.endTime) {
        const slotDate = new Date(slot.$createdAt || 0)
        timeRanges.push({ start: slot.startTime, end: slot.endTime, date: slotDate })
      }
    })
    
    // Weź najnowsze wartości zamiast średnich
    const latestCommercialRate = commercialRates.length > 0 
      ? commercialRates[0].rate
      : 150
    
    const latestDuration = durations.length > 0
      ? durations[0].duration
      : 60
    
    // Weź najnowszy zakres godzin
    const latestTimeRange = timeRanges.length > 0
      ? timeRanges[0]
      : { start: '08:00', end: '16:00', date: new Date() }
    
    return {
      commercialRate: latestCommercialRate,
      duration: latestDuration,
      startTime: latestTimeRange.start,
      endTime: latestTimeRange.end,
      hasHistory: commercialRates.length > 0 || durations.length > 0 || timeRanges.length > 0
    }
  }

  const openScheduleModalForDate = async (doctor: any, date: Date) => {
    setSelectedDoctor(doctor)
    setSelectedDate(date)
    
    // Sprawdź czy istnieją sloty dla tej daty i pobierz gabinet z pierwszego slotu
    const daySlots = getDaySlotsForDate(doctor.$id, date)
    
    // Sprawdź czy wszystkie sloty to urlopy/zwolnienia z przeszłości
    const allSlotsArePastVacationOrSickLeave = daySlots.length > 0 && 
      daySlots.every(slot => isPastVacationOrSickLeave(slot, date))
    
    if (allSlotsArePastVacationOrSickLeave) {
      // Tylko podgląd - nie otwieraj modala edycji
      toast({
        variant: "destructive",
        title: "Tylko podgląd",
        description: "Nie można edytować urlopów i zwolnień z przeszłości"
      })
      return
    }
    
    if (daySlots.length > 0 && daySlots[0].roomName) {
      let roomName = daySlots[0].roomName;
      try {
        const roomData = JSON.parse(daySlots[0].roomName);
        roomName = roomData.name || daySlots[0].roomName;
      } catch (e) {
        // Keep original roomName if not JSON
      }
      const room = PREDEFINED_ROOMS.find(r => r.name === roomName)
      setSelectedRoom(room ? room.id : null)
    } else {
      setSelectedRoom(null)
    }
    
    // Znajdź lub stwórz harmonogram dla tego lekarza
    let schedule = schedules.find(s => s.doctorId === doctor.$id)
    if (!schedule) {
      const newSchedule = await createSchedule({
        doctorId: doctor.$id,
        weekStart: new Date(),
        weekEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      })
      schedule = newSchedule
      setSchedules(prev => [...prev, schedule])
    }
    
    setCurrentSchedule(schedule)
    
    // Załaduj istniejące sloty dla tej daty
    const existingSlots = getDaySlotsForDate(doctor.$id, date)
    
    if (existingSlots.length > 0) {
      const firstSlot = existingSlots[0]
      if (firstSlot.status === 'vacation') {
        setScheduleModalType('vacation')
        setModalTimeSlots([])
      } else if (firstSlot.status === 'sick_leave') {
        setScheduleModalType('sick_leave')
        setModalTimeSlots([])
      } else {
        setScheduleModalType('working')
        setModalTimeSlots(existingSlots.map(slot => {
          // Parse appointment duration and consultation fee from roomName JSON
          let appointmentDuration = 60; // Default 60 minutes
          let consultationFee = 150; // Default fee
          
          if (slot.roomName) {
            try {
              const roomData = JSON.parse(slot.roomName);
              appointmentDuration = roomData.appointmentDuration || 60;
              consultationFee = roomData.consultationFee || (slot.type === 'nfz' ? 0 : 150);
            } catch (e) {
              // If roomName is not JSON, use default values
              appointmentDuration = 60;
              consultationFee = slot.type === 'nfz' ? 0 : 150;
            }
          }
          
          return {
            id: slot.$id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type,
            appointmentDuration,
            consultationFee
          }
        }))
      }
    } else {
      // Jeśli nie ma slotów dla tej daty, sprawdź czy istnieje harmonogram tygodniowy dla tego dnia
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
      const weeklySlots = getDaySlots(doctor.$id, dayOfWeek)
      
      if (weeklySlots.length > 0) {
        // Użyj harmonogramu tygodniowego jako podstawy
        const firstSlot = weeklySlots[0]
        if (firstSlot.status === 'vacation') {
          setScheduleModalType('vacation')
          setModalTimeSlots([])
        } else if (firstSlot.status === 'sick_leave') {
          setScheduleModalType('sick_leave')
          setModalTimeSlots([])
        } else {
          setScheduleModalType('working')
        setModalTimeSlots(weeklySlots.map(slot => {
          // Parse appointment duration and consultation fee from roomName JSON
          let appointmentDuration = 60; // Default 60 minutes
          let consultationFee = 150; // Default fee
          
          if (slot.roomName) {
            try {
              const roomData = JSON.parse(slot.roomName);
              appointmentDuration = roomData.appointmentDuration || 60;
              consultationFee = roomData.consultationFee || (slot.type === 'nfz' ? 0 : 150);
            } catch (e) {
              // If roomName is not JSON, use default values
              appointmentDuration = 60;
              consultationFee = slot.type === 'nfz' ? 0 : 150;
            }
          }
          
          return {
            id: `temp-${Math.random()}`,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type,
            appointmentDuration,
            consultationFee
          }
        }))
        }
        
        // Ustaw gabinet z harmonogramu tygodniowego
        if (weeklySlots[0].roomName) {
          let roomName = weeklySlots[0].roomName;
          try {
            const roomData = JSON.parse(weeklySlots[0].roomName);
            roomName = roomData.name || weeklySlots[0].roomName;
          } catch (e) {
            // Keep original roomName if not JSON
          }
          const room = PREDEFINED_ROOMS.find(r => r.name === roomName)
          setSelectedRoom(room ? room.id : null)
        }
      } else {
        // Użyj inteligentnego sugerowania na podstawie historii
        const historicalData = getDoctorHistoricalRates(doctor.$id)
        
        setScheduleModalType('working')
        setModalTimeSlots([{
          id: 'new-1',
          startTime: historicalData.startTime,
          endTime: historicalData.endTime,
          type: 'commercial',
          appointmentDuration: historicalData.duration,
          consultationFee: historicalData.commercialRate
        }])
      }
    }
    
    setShowScheduleModal(true)
  }

  const openScheduleModal = async (doctor: any, dayOfWeek: number, specificDate?: Date) => {
    setSelectedDoctor(doctor)
    setSelectedDay(dayOfWeek)
    setSelectedDate(specificDate || null)
    
    // Sprawdź czy istnieją sloty dla tego dnia i pobierz gabinet z pierwszego slotu
    let daySlots
    if (specificDate) {
      daySlots = getDaySlotsForDate(doctor.$id, specificDate)
      
      // Sprawdź czy wszystkie sloty to urlopy/zwolnienia z przeszłości
      const allSlotsArePastVacationOrSickLeave = daySlots.length > 0 && 
        daySlots.every(slot => isPastVacationOrSickLeave(slot, specificDate))
      
      if (allSlotsArePastVacationOrSickLeave) {
        // Tylko podgląd - nie otwieraj modala edycji
        toast({
          variant: "destructive",
          title: "Tylko podgląd",
          description: "Nie można edytować urlopów i zwolnień z przeszłości"
        })
        return
      }
    } else {
      daySlots = getDaySlots(doctor.$id, dayOfWeek)
    }
    
    if (daySlots.length > 0 && daySlots[0].roomName) {
      let roomName = daySlots[0].roomName;
      try {
        const roomData = JSON.parse(daySlots[0].roomName);
        roomName = roomData.name || daySlots[0].roomName;
      } catch (e) {
        // Keep original roomName if not JSON
      }
      const room = PREDEFINED_ROOMS.find(r => r.name === roomName)
      setSelectedRoom(room ? room.id : null)
    } else {
      setSelectedRoom(null)
    }
    
    // Znajdź lub stwórz harmonogram dla tego lekarza
    let schedule = schedules.find(s => s.doctorId === doctor.$id)
    if (!schedule) {
      // Stwórz nowy harmonogram dla tego tygodnia
      const weekStart = new Date(currentWeek)
      weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      try {
        const newSchedule = await createSchedule({
          doctorId: doctor.$id,
          weekStart,
          weekEnd
        })
        schedule = newSchedule
        setSchedules([...schedules, newSchedule])
      } catch (error) {
        console.error("Błąd podczas tworzenia harmonogramu:", error)
        return
      }
    }
    
    setCurrentSchedule(schedule)
    
    // Załaduj istniejące sloty dla tego dnia
    const existingSlots = specificDate ? getDaySlotsForDate(doctor.$id, specificDate) : getDaySlots(doctor.$id, dayOfWeek)
    
    if (existingSlots.length > 0) {
      const firstSlot = existingSlots[0]
      if (firstSlot.status === 'vacation') {
        setScheduleModalType('vacation')
        setModalTimeSlots([])
      } else if (firstSlot.status === 'sick_leave') {
        setScheduleModalType('sick_leave')
        setModalTimeSlots([])
      } else {
        setScheduleModalType('working')
        setModalTimeSlots(existingSlots.map(slot => {
          // Parse appointment duration and consultation fee from roomName JSON
          let appointmentDuration = 60; // Default 60 minutes
          let consultationFee = 150; // Default fee
          
          if (slot.roomName) {
            try {
              const roomData = JSON.parse(slot.roomName);
              appointmentDuration = roomData.appointmentDuration || 60;
              consultationFee = roomData.consultationFee || (slot.type === 'nfz' ? 0 : 150);
            } catch (e) {
              // If roomName is not JSON, use default values
              appointmentDuration = 60;
              consultationFee = slot.type === 'nfz' ? 0 : 150;
            }
          }
          
          return {
            id: slot.$id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type,
            appointmentDuration,
            consultationFee
          }
        }))
      }
    } else {
      // Użyj inteligentnego sugerowania na podstawie historii
      const historicalData = getDoctorHistoricalRates(doctor.$id)
      
      setScheduleModalType('working')
        setModalTimeSlots([{
          id: 'new-1',
        startTime: historicalData.startTime,
        endTime: historicalData.endTime,
          type: 'commercial',
        appointmentDuration: historicalData.duration,
        consultationFee: historicalData.commercialRate
        }])
    }
    
    setShowScheduleModal(true)
  }

  const addTimeSlot = () => {
    const newId = `new-${Date.now()}`
    
    // Użyj inteligentnego sugerowania dla nowego slotu
    const historicalData = selectedDoctor ? getDoctorHistoricalRates(selectedDoctor.$id) : {
      commercialRate: 150,
      duration: 60,
      startTime: '08:00',
      endTime: '16:00',
      hasHistory: false
    }
    
    setModalTimeSlots([...modalTimeSlots, {
      id: newId,
      startTime: historicalData.startTime,
      endTime: historicalData.endTime,
      type: 'commercial',
      appointmentDuration: historicalData.duration,
      consultationFee: historicalData.commercialRate
    }])
  }

  const removeTimeSlot = (slotId: string) => {
    setModalTimeSlots(modalTimeSlots.filter(slot => slot.id !== slotId))
  }

  const updateTimeSlot = (slotId: string, field: string, value: string | number) => {
    setModalTimeSlots(modalTimeSlots.map(slot => {
      if (slot.id === slotId) {
        const updatedSlot = { ...slot, [field]: value }
        // Jeśli zmieniamy typ na NFZ, usuń stawkę (ustaw na 0)
        if (field === 'type' && value === 'nfz') {
          updatedSlot.consultationFee = 0
        }
        // Jeśli zmieniamy typ na komercyjne i stawka to 0, ustaw domyślną
        if (field === 'type' && value === 'commercial' && updatedSlot.consultationFee === 0) {
          updatedSlot.consultationFee = 150
        }
        return updatedSlot
      }
      return slot
    }))
  }

  const { toast } = useToast()

  const saveSchedule = async () => {
    if (!selectedDoctor || (!selectedDay && !selectedDate) || !currentSchedule) {
      console.log("Brak wymaganych danych:", {
        selectedDoctor: selectedDoctor?.name,
        selectedDay,
        selectedDate: selectedDate?.toDateString(),
        currentSchedule: currentSchedule?.$id
      })
      return
    }
    
    // Walidacja wyboru gabinetu (nie wymagana dla urlopu i zwolnienia)
    if (selectedRoom === null && scheduleModalType === 'working') {
      toast({ variant: "destructive", title: "Brak gabinetu", description: "Wybierz gabinet przed zapisem" })
      return
    }

    setIsSavingSchedule(true)
    try {
      console.log("Zapisywanie harmonogramu...", {
        selectedDoctor: selectedDoctor?.name,
        selectedDate: selectedDate?.toDateString(),
        selectedDay,
        scheduleModalType,
        modalTimeSlots: modalTimeSlots.length
      })

      // Usuń istniejące sloty dla tego dnia
      let existingSlots
      if (selectedDate) {
        // Dla widoku miesięcznego - usuń sloty dla konkretnej daty (override)
        const target = new Date(selectedDate).toDateString()
        existingSlots = scheduleSlots.filter(slot => 
          slot.scheduleId === currentSchedule.$id && 
          slot.specificDate && 
          new Date(slot.specificDate).toDateString() === target
        )
        console.log("Usuwanie slotów dla daty:", selectedDate.toDateString(), existingSlots.length)
      } else {
        // Dla widoku tygodniowego - usuń sloty dla dnia tygodnia
        existingSlots = scheduleSlots.filter(slot => 
        slot.scheduleId === currentSchedule.$id && slot.dayOfWeek === selectedDay
      )

      }
      
      for (const slot of existingSlots) {
        await deleteScheduleSlot(slot.$id)
      }

      // Pobierz dane wybranego gabinetu
      const selectedRoomData = PREDEFINED_ROOMS.find(r => r.id === selectedRoom)
      console.log("Dane gabinetu:", {
        selectedRoom,
        selectedRoomData,
        scheduleModalType
      })

      // Dodaj nowe sloty
      console.log("Sprawdzanie typu harmonogramu:", {
        scheduleModalType,
        modalTimeSlotsLength: modalTimeSlots.length,
        modalTimeSlots
      })
      
      if (scheduleModalType === 'working' && modalTimeSlots.length > 0) {

        for (const slot of modalTimeSlots) {
          const toLocalDateKey = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }

          const slotData = {
            scheduleId: currentSchedule.$id,
            doctorId: selectedDoctor.$id,
            dayOfWeek: selectedDate ? undefined : (selectedDay || undefined),
            specificDate: selectedDate ? toLocalDateKey(selectedDate) : undefined,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type,
            status: 'working' as const,
            roomName: JSON.stringify({
              name: selectedRoomData?.name || '',
              appointmentDuration: slot.appointmentDuration || 60,
              consultationFee: slot.consultationFee || (slot.type === 'nfz' ? 0 : 150)
            }),
            roomColor: selectedRoomData?.color || undefined
          }

          await createScheduleSlot(slotData)
        }
      } else if (scheduleModalType === 'vacation') {
        console.log("Tworzenie slotu urlopu", {
          selectedDate: selectedDate?.toDateString(),
          selectedDay,
          currentSchedule: currentSchedule?.$id
        })
        // Walidacja urlopu – brak dostępnych dni
        try {
          const { getYearlyVacationStats } = await import('../../lib/actions/schedule.actions')
          const ys = await getYearlyVacationStats(selectedDoctor.$id, (selectedDate || monthCursor).getFullYear())
          if ((ys?.remainingVacationDays ?? 0) <= 0) {
            toast({ variant: "destructive", title: "Brak wolnych urlopów", description: "Nie można dodać urlopu" })
            setIsSavingSchedule(false)
            return
          }
        } catch (e) {
          console.error('Vacation validation failed:', e)
        }

        const toLocalDateKey = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        const slotData = {
          scheduleId: currentSchedule.$id,
          doctorId: selectedDoctor.$id,
          dayOfWeek: selectedDate ? undefined : (selectedDay || undefined),
          specificDate: selectedDate ? toLocalDateKey(selectedDate) : undefined,
          startTime: '00:00',
          endTime: '23:59',
          type: 'commercial' as const,
          status: 'vacation' as const,
          roomName: selectedRoomData?.name || undefined,
          roomColor: selectedRoomData?.color || undefined
        }

        await createScheduleSlot(slotData)
      } else if (scheduleModalType === 'sick_leave') {
        console.log("Tworzenie slotu zwolnienia", {
          selectedDate: selectedDate?.toDateString(),
          selectedDay,
          currentSchedule: currentSchedule?.$id
        })
        const toLocalDateKey = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        const slotData = {
          scheduleId: currentSchedule.$id,
          doctorId: selectedDoctor.$id,
          dayOfWeek: selectedDate ? undefined : (selectedDay || undefined),
          specificDate: selectedDate ? toLocalDateKey(selectedDate) : undefined,
          startTime: '00:00',
          endTime: '23:59',
          type: 'commercial' as const,
          status: 'sick_leave' as const,
          roomName: selectedRoomData?.name || undefined,
          roomColor: selectedRoomData?.color || undefined
        }

        await createScheduleSlot(slotData)
      } else {

      }


      // Po wszystkich operacjach przelicz statystyki w bazie (miesiąc+rok) i odśwież je w UI
      try {
        const { calculateAndUpdateStats } = await import('../../lib/actions/schedule.actions')
        await calculateAndUpdateStats(selectedDoctor.$id, selectedDate || monthCursor)

      } catch (e) {
        console.error('Recalculate after save failed:', e)
      }

      // Odśwież dane kalendarza oraz podsumowanie dla tego lekarza

      await fetchSchedules()
      await refreshDoctorMonthlyStats(selectedDoctor.$id)

      
      setShowScheduleModal(false)
      toast({ variant: "success", title: "Zapisano", description: "Zmiany w grafiku zostały zapisane" })
    } catch (error) {
      console.error("Błąd podczas zapisywania harmonogramu:", error)
      toast({ variant: "destructive", title: "Błąd", description: "Nie udało się zapisać zmian w grafiku" })
    } finally {
      setIsSavingSchedule(false)
    }
  }

  const deleteSchedule = async () => {
    if (!selectedDoctor || (!selectedDay && !selectedDate) || !currentSchedule) return

    // Sprawdź czy można usunąć sloty (nie można usuwać starszych niż dzisiaj)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Ustaw na początek dnia
    
    if (selectedDate) {
      const slotDate = new Date(selectedDate)
      slotDate.setHours(0, 0, 0, 0)
      
      if (slotDate < today) {
        toast({ 
          variant: "destructive", 
          title: "Nie można usunąć", 
          description: "Nie można usuwać urlopów i zwolnień z przeszłości" 
        })
        return
      }
    }

    try {
      // Usuń wszystkie sloty dla tego dnia
      let existingSlots
      if (selectedDate) {
        // Dla widoku miesięcznego - usuń sloty dla konkretnej daty (override)
        existingSlots = scheduleSlots.filter(slot => 
          slot.scheduleId === currentSchedule.$id && 
          slot.specificDate && 
          new Date(slot.specificDate).toDateString() === selectedDate.toDateString()
        )
      } else {
        // Dla widoku tygodniowego - usuń sloty dla dnia tygodnia
        existingSlots = scheduleSlots.filter(slot => 
        slot.scheduleId === currentSchedule.$id && slot.dayOfWeek === selectedDay
      )
      }
      
      for (const slot of existingSlots) {
        await deleteScheduleSlot(slot.$id)
      }

      // Po usunięciu slotów przelicz statystyki (miesiąc+rok) i odśwież UI
      try {
        const { calculateAndUpdateStats } = await import('../../lib/actions/schedule.actions')
        await calculateAndUpdateStats(selectedDoctor.$id, selectedDate || monthCursor)
      } catch (e) {
        console.error('Recalculate after delete failed:', e)
      }

      // Odśwież dane kalendarza i wiersz podsumowania
      await fetchSchedules()
      await refreshDoctorMonthlyStats(selectedDoctor.$id)
      
      setShowScheduleModal(false)
      
      // Określ typ usuniętego slotu dla odpowiedniego komunikatu
      let slotType = "harmonogram"
      if (existingSlots.length > 0) {
        const firstSlot = existingSlots[0]
        if (firstSlot.status === 'vacation') {
          slotType = "urlop"
        } else if (firstSlot.status === 'sick_leave') {
          slotType = "zwolnienie"
        } else if (firstSlot.status === 'working') {
          slotType = "dzień pracujący"
        }
      }
      
      toast({ 
        variant: "success", 
        title: "Usunięto pomyślnie", 
        description: `${slotType.charAt(0).toUpperCase() + slotType.slice(1)} został usunięty z grafiku` 
      })

    } catch (error) {
      console.error("Błąd podczas usuwania harmonogramu:", error)
      toast({ variant: "destructive", title: "Błąd", description: "Nie udało się usunąć dnia z grafiku" })
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
      const result = await updatePatient(selectedPatient.$id, { [field]: editValue })

      
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

  const handleDeletePatient = async () => {
    if (!selectedPatient) return

    try {

      
      // Usuń pacjenta z bazy danych
      await deletePatient(selectedPatient.$id)
      
      // Usuń z lokalnych list
      setPatients(patients.filter(p => p.$id !== selectedPatient.$id))
      setFilteredPatients(filteredPatients.filter(p => p.$id !== selectedPatient.$id))
      
      // Zamknij modal
      setShowPatientModal(false)
      setSelectedPatient(null)
      

    } catch (error) {
      console.error("Błąd podczas usuwania pacjenta:", error)
      toast({ variant: "destructive", title: "Błąd", description: "Nie udało się usunąć pacjenta" })
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveField(field)
                    } else if (e.key === 'Escape') {
                      cancelEditing()
                    }
                  }}
                  autoFocus
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveField(field)
                    } else if (e.key === 'Escape') {
                      cancelEditing()
                    }
                  }}
                  autoFocus
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              <Button
                size="sm"
                onClick={() => {
                  playButtonSound()
                  saveField(field)
                }}
                className="bg-green-600 hover:bg-green-700 text-white p-1"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  playButtonSound()
                  cancelEditing()
                }}
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
      try {
      await Promise.all([
        fetchAppointments(),
        fetchPatients(),
        fetchDoctors(),
        fetchSchedules()
      ])
        const [s, r, t] = await Promise.all([
          getDashboardStats().catch(() => null),
          getRevenueData().catch(() => []),
          getTasks().catch(() => [])
        ])
        if (s) setDashboardStats(s)
        if (Array.isArray(r)) setRevenueData(r)
        if (Array.isArray(t)) setTasks(t)
      } finally {
      setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  // Wczytaj ustawienia timera z localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_timer_minutes')
      if (saved) {
        const v = parseInt(saved)
        if (!isNaN(v) && v > 0 && v <= 120) setSessionMinutes(v)
      }
    } catch {}
  }, [])

  // Odśwież harmonogramy przy zmianie tygodnia
  useEffect(() => {
    if (schedules.length > 0) {
      fetchSchedules()
    }
  }, [currentWeek])

  // Inicjalizuj harmonogram miesięczny gdy zmienia się miesiąc
  useEffect(() => {
    if (schedules.length > 0 && doctors.length > 0) {
      // Dodaj debounce, aby uniknąć zbyt częstych wywołań
      const timeoutId = setTimeout(() => {
        initializeMonthlySchedule()
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [monthCursor])

  // Ładuj statystyki miesięczne
  useEffect(() => {
    const loadMonthlyStats = async () => {
      if (doctors.length === 0) return

      try {
        // Pobierz statystyki równolegle dla wszystkich lekarzy – duża oszczędność czasu
        const results = await Promise.all(
          doctors.map(async (doctor) => {
            try {
              const doctorStats = await getMonthlyStats(doctor.$id, monthCursor)
              return [doctor.$id, doctorStats] as const
            } catch (error) {
              console.error(`Error loading stats for doctor ${doctor.$id}:`, error)
              return [doctor.$id, {
                totalHours: 0,
                vacationDays: 0,
                sickLeaveDays: 0,
                workingDays: 0,
                remainingVacationDays: 21
              }] as const
            }
          })
        )

        const stats: {[key: string]: any} = {}
        results.forEach(([id, value]) => { stats[id] = value })
        setMonthlyStats(stats)
      } catch (err) {
        console.error('Error loading monthly stats in parallel:', err)
      }
    }

    loadMonthlyStats()
  }, [doctors, monthCursor])

  // Funkcja do odświeżenia statystyk jednego lekarza po zmianie w grafiku
  const refreshDoctorMonthlyStats = async (doctorId: string) => {
    try {
      const stats = await getMonthlyStats(doctorId, monthCursor)
      setMonthlyStats(prev => ({ ...prev, [doctorId]: stats }))
    } catch (e) {
      console.error('Error refreshing stats for doctor', doctorId, e)
    }
  }

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
  const currentAppointments = (appointments?.documents || [])
    .filter((visit: any) => {
      // Pokaż tylko oczekujące/potwierdzone, ukryj odbyte i anulowane
      const statuses = Array.isArray(visit.status)
        ? visit.status
        : (visit.status || '').split(',').map((s: string) => s.trim())
      const isCompleted = visit.isCompleted || statuses.includes('completed')
      const isCancelled = statuses.includes('cancelled')
      const isAwaiting = statuses.includes('awaiting') || statuses.includes('pending')
      const isAccepted = statuses.includes('accepted')
      const isScheduled = statuses.includes('scheduled')
      return !isCompleted && !isCancelled && (isAwaiting || isAccepted || isScheduled)
    })
    .sort((a: any, b: any) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime())
    .slice(startIndex, endIndex)

  const [progress, setProgress] = useState(0)
  const [notifications, setNotifications] = useState(5)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Pulpit dane
  const [stats, setStats] = useState({
    todayAppointments: 0,
    todayScheduled: 0,
    totalAppointments30Days: 0,
    cancelledAppointments30Days: 0,
    completedAppointments30Days: 0,
    newPatients30Days: 0,
  })
  const [revenue, setRevenue] = useState({ totalRevenue: 0, previousRevenue: 0, revenueGrowth: 0, appointmentsCount: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [tasksList, setTasksList] = useState<any[]>([])

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

          {/* Sekcja powiadomień */}
          <div className="border-t p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Powiadomienia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="notification-toggle"
                      checked={audioEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          enableAudio()
                        } else {
                          setAudioEnabledWithStorage(false)
                        }
                      }}
                      className="sr-only"
                    />
                    <label
                      htmlFor="notification-toggle"
                      className={`border rounded-full border-gray-300 flex items-center cursor-pointer w-12 transition-all duration-300 ease-in-out ${
                        audioEnabled ? 'bg-green-500 justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="rounded-full border w-6 h-6 border-gray-300 shadow-inner bg-white shadow transition-all duration-300 ease-in-out"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>Ustawienia</span>
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
            
            {/* Czasomierz bezpieczeństwa w nagłówku */}
            <div className="flex items-center gap-3 mr-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                <span className="text-xs font-medium text-gray-600">
                  {isActive ? 'Aktywny' : 'Nieaktywny'}
                </span>
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      timeRemaining > 180 ? 'bg-green-500' : 
                      timeRemaining > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${((300 - timeRemaining) / 300) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs font-mono text-gray-600 min-w-[35px]">
                  {formattedTime}
                </span>
                <button
                  className="ml-2 p-1 rounded-md hover:bg-gray-100"
                  aria-label="Ustawienia czasomierza"
                  onClick={() => setIsTimerSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            
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
                <TabsContent value="dashboard" className="space-y-8 mt-0">
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="sp-h1 text-gray-900">Pulpit</h1>
                        <p className="sp-desc">Szybki przegląd najważniejszych informacji</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Dzisiaj, {new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</p>
                        <p className="text-sm text-gray-600">8:00 - 16:00</p>
                      </div>
                    </div>
                  </section>

                  {/* Karty statystyk */}
                  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-b from-blue-500/20 to-transparent border border-gray-200  transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6 h-48 flex flex-col justify-between">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-4">
                          <Calendar className="h-6 w-6 text-white" />
                            </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="sp-body text-gray-600 mb-2">Dzisiejsze wizyty</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-3">{dashboardStats?.todayAppointments || 0}</p>
                            <div className="flex items-center text-sm">
                              <span className="text-green-600">+12%</span>
                              <span className="text-gray-500 ml-1">vs wczoraj</span>
                            </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    <Card className="bg-gradient-to-b from-green-500/20 to-transparent border border-gray-200 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6 h-48 flex flex-col justify-between">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-4">
                          <Users className="h-6 w-6 text-white" />
                            </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="sp-body text-gray-600 mb-2">Aktywni pacjenci</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-3">{dashboardStats?.activePatients || 0}</p>
                            <div className="flex items-center text-sm">
                              <span className="text-green-600">+8%</span>
                              <span className="text-gray-500 ml-1">vs miesiąc</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    <Card className="bg-gradient-to-b from-purple-500/20 to-transparent border border-gray-200 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6 h-48 flex flex-col justify-between">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl mb-4">
                          <CreditCard className="h-6 w-6 text-white" />
                            </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="sp-body text-gray-600 mb-2">Przychód (30 dni)</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-3">{dashboardStats?.monthlyRevenue || 0} zł</p>
                            <div className="flex items-center text-sm">
                              <span className="text-green-600">+15%</span>
                              <span className="text-gray-500 ml-1">vs poprzedni</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    <Card className="bg-gradient-to-b from-orange-500/20 to-transparent border border-gray-200 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6 h-48 flex flex-col justify-between">
                        <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-4">
                          <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="sp-body text-gray-600 mb-2">Ukończone zadania</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-3">{tasks.filter(t => t.completed).length}</p>
                            <div className="flex items-center text-sm">
                              <span className="text-green-600">+5</span>
                              <span className="text-gray-500 ml-1">w tym tygodniu</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  </section>

                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lewa strona - 2 kolumny */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Wykres przychodu */}
                      <Card>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="sp-h3">Przychód</CardTitle>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="text-sm">
                                Miesiąc
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                              </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 w-full">
                            {revenueData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis 
                                    dataKey="date" 
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis 
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}zł`}
                                  />
                                  <Tooltip />
                                  <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#3B82F6" 
                                    strokeWidth={3}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full w-full bg-gray-50 rounded-xl flex flex-col items-center justify-center p-8">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Crown className="h-8 w-8 text-white" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Odblokuj w subskrypcji Pro</h3>
                                  <p className="text-gray-600 text-sm mb-4">Uzyskaj dostęp do szczegółowych analiz przychodu i raportów</p>
                                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                                    <Crown className="h-4 w-4 mr-2" />
                                    Upgrade do Pro
                                  </Button>
                                </div>
                            </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Lista zadań */}
                      <Card>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                            <CardTitle className="sp-h3">Twoja lista zadań</CardTitle>
                            <Button size="sm" className="bg-primary hover:bg-midnight-blue text-white">
                              <Plus className="h-4 w-4 mr-1" />
                              Dodaj zadanie
                            </Button>
                              </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {tasks.slice(0, 5).map((task, index) => (
                              <div key={task.$id || index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleTaskCompletion(task.$id)}
                                  className="w-4 h-4 text-cornflower-blue border-gray-300 rounded focus:ring-cornflower-blue"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-xs text-gray-500 truncate">{task.description}</p>
                                  )}
                                  </div>
                                {task.priority && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {task.priority === 'high' ? 'Wysoki' : task.priority === 'medium' ? 'Średni' : 'Niski'}
                                  </span>
                                )}
                                </div>
                            ))}
                            {tasks.length === 0 && (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                                  <Crown className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Odblokuj w subskrypcji Pro</h3>
                                <p className="text-gray-600 text-sm mb-4">Uzyskaj dostęp do zaawansowanego zarządzania zadaniami</p>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                                  <Crown className="h-4 w-4 mr-2" />
                                  Upgrade do Pro
                                </Button>
                                </div>
                            )}
                            </div>
                          </CardContent>
                        </Card>
                    </div>

                    {/* Prawa strona - 1 kolumna (nadchodzące wizyty) */}
                    <div className="lg:col-span-1">
                      <Card className="h-full">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                            <CardTitle className="sp-h3">Nadchodzące wizyty</CardTitle>
                            <Button size="sm" className="bg-primary hover:bg-midnight-blue text-white" onClick={() => setActiveTab("wizyty")}>
                              <Plus className="h-4 w-4 mr-1" />
                              Nowa wizyta
                              </Button>
                            </div>
                          </CardHeader>
                        <CardContent className="flex flex-col h-full">
                          <div className="flex flex-col h-full space-y-4">
                            {/* Kalendarz z listą wizyt */}
                            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                              {appointments?.documents && appointments.documents.length > 0 ? (
                                appointments.documents
                                  .filter((apt: any) => {
                                    const d = new Date(apt.schedule)
                                    const isFuture = d.getTime() >= Date.now()
                                    return isFuture && !isAppointmentCancelled(apt) && !isAppointmentCompleted(apt)
                                  })
                                  .sort((a: any, b: any) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime())
                                  .map((appointment: any, index: number) => {
                                    const appointmentDate = new Date(appointment.schedule);
                                    const isToday = appointmentDate.toDateString() === new Date().toDateString();
                                    const isFirst = index === 0;
                                    
                                    return (
                                      <div key={appointment.$id || index} className="relative">
                                        {/* Karta wizyty */}
                                        <div 
                                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                            isFirst ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-200 hover:border-gray-300'
                                          }`}
                                          onClick={() => setExpandedAppointment(expandedAppointment === appointment.$id ? null : appointment.$id)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                              {/* Avatar pacjenta */}
                                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                                isFirst ? 'bg-primary' : 'bg-gray-400'
                                              }`}>
                                                {(appointment.patient?.name || 'P').charAt(0).toUpperCase()}
                                              </div>
                                              
                                              {/* Informacje o wizycie */}
                                              <div className="flex-1">
                                              <div className="flex items-center space-x-2 mb-1">
                                                  <span className="text-sm font-medium text-gray-900">
                                                    {appointment.patient?.name || 'Pacjent'}
                                                  </span>
                                                </div>
                                              <div className="grid grid-cols-2 gap-3 mt-1 text-sm">
                                                <span className="text-gray-500">
                                                  {appointmentDate.toLocaleDateString('pl-PL')}
                                                </span>
                                                <span className="text-gray-500">
                                                  {appointmentDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                  </span>
                                                </div>
                                                {/* Badge "Dzisiaj" pod datą */}
                                                {isToday && (
                                                  <div className="mt-2">
                                                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                                      Dzisiaj
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* Chevron */}
                                            <div className="flex items-center space-x-2">
                                              <StatusBadge status={appointment.status || 'pending'} />
                                              {expandedAppointment === appointment.$id ? (
                                                <ChevronUp className="h-4 w-4 text-gray-400" />
                                              ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Rozsuwana karta z szczegółami */}
                                          {expandedAppointment === appointment.$id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Pacjent:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {appointment.patient?.name || 'Pacjent'}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Godzina:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {appointmentDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Data:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {appointmentDate.toLocaleDateString('pl-PL')}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="space-y-3">
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Gabinet:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {appointment.roomName || appointment.room || 'Brak'}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Lekarz:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {appointment.primaryPhysician || 'Lekarz'}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-sm text-gray-500">Status:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                      {Array.isArray(appointment.status)
                                                        ? appointment.status.join(', ')
                                                        : (appointment.status || 'awaiting')}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              {appointment.note && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                  <span className="text-sm text-gray-500">Notatka:</span>
                                                  <p className="text-sm text-gray-900 mt-1">{appointment.note}</p>
                                                </div>
                                              )}
                                              
                                              {/* Przyciski akcji */}
                                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex space-x-2">
                                                  <button className="w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors">
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                  </button>
                                                  <button className="w-8 h-8 bg-gray-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors">
                                                    <Users className="h-4 w-4 text-gray-600" />
                                                  </button>
                                                  <button className="w-8 h-8 bg-gray-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors">
                                                    <Edit className="h-4 w-4 text-gray-600" />
                                                  </button>
                                                </div>
                                                {(() => {
                                                  let statuses: string[]
                                                  if (Array.isArray(appointment.status)) {
                                                    statuses = appointment.status
                                                  } else {
                                                    statuses = (appointment.status || '').split(',').map((s: string) => s.trim())
                                                  }
                                                  const hasAwaiting = statuses.includes('awaiting') || statuses.includes('pending')
                                                  const hasAccepted = statuses.includes('accepted')

                                                  if (hasAccepted) {
                                                    return (
                                                      <button
                                                        onClick={async () => {
                                                          try {
                                                            await markAppointmentAsCompleted(appointment.$id)
                                                            fetchAppointments()
                                                          } catch (e) {
                                                            console.error('Mark completed error', e)
                                                          }
                                                        }}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                                                      >
                                                        Oznacz jako odbytą
                                                      </button>
                                                    )
                                                  }
                                                  if (hasAwaiting) {
                                                    return (
                                                      <Button 
                                                        size="sm" 
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={() => {
                                                          setSelectedAppointment(appointment);
                                                          setShowConfirmationModal(true);
                                                        }}
                                                      >
                                                        Potwierdź wizytę
                                                      </Button>
                                                    )
                                                  }
                                                  return null
                                                })()}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                              ) : (
                                <div className="text-center py-12 text-gray-500">
                                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Calendar className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <p className="text-lg font-medium mb-2">Brak nadchodzących wizyt</p>
                                  <p className="text-sm">Kliknij "Nowa wizyta" aby dodać pierwszą wizytę</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Footer z przyciskiem Pokaż wszystkie */}
                            <div className="flex justify-end items-center mt-auto pt-4 border-t border-gray-100">
                              <button className="text-cornflower-blue hover:text-midnight-blue text-sm font-medium mr-2">
                                Pokaż wszystkie
                              </button>
                              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                            
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                </TabsContent>

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
                            <Button className="text-white rounded-2xl px-6">
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
                      {/* Wizyty dzisiaj */}
                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-blue-100 p-3">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Wizyty dzisiaj</div>
                            <div className="text-2xl font-bold text-gray-900">0 / 15</div>
                            <div className="text-sm text-red-500 mt-1">0% Nowe wizyty czekają! 😊</div>
                          </div>
                        </div>
                      </Card>

                      {/* Wszystkie wizyty */}
                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-purple-100 p-3">
                            <FileText className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Wszystkie wizyty <span className="text-gray-500">(30 dni)</span></div>
                            <div className="text-2xl font-bold text-gray-900">66</div>
                            <div className="text-sm text-green-500 mt-1">⬆️ 20% vs poprzednie 30 dni</div>
                          </div>
                        </div>
                      </Card>

                      {/* Odwołane wizyty */}
                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-red-100 p-3">
                            <X className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Odwołane wizyty <span className="text-gray-500">(30 dni)</span></div>
                            <div className="text-2xl font-bold text-gray-900">4</div>
                          </div>
                        </div>
                      </Card>

                      {/* Uzupełnione karty */}
                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-orange-100 p-3">
                            <Edit className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Uzupełnione karty</div>
                            <div className="text-2xl font-bold text-gray-900">28 / 63</div>
                            <div className="text-sm text-red-500 mt-1">44% Dasz radę! 🧑‍💻</div>
                          </div>
                        </div>
                      </Card>

                      {/* Nowi pacjenci */}
                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-green-100 p-3">
                            <Users className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Nowi pacjenci <span className="text-gray-500">(30 dni)</span></div>
                            <div className="text-2xl font-bold text-gray-900">8</div>
                            <div className="text-sm text-green-500 mt-1">⬆️ 33% vs poprzednie 30 dni</div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">
                        {appointmentsView === "weekly" ? "Widok tygodniowy" : "Widok miesięczny"}
                      </h2>
                      <div className="flex items-center gap-2">
                        {/* Przełącznik widoków */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <Button
                            variant={appointmentsView === "monthly" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setAppointmentsView("monthly")}
                            className="rounded-md"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Miesięczny
                          </Button>
                          <Button
                            variant={appointmentsView === "weekly" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setAppointmentsView("weekly")}
                            className="rounded-md"
                          >
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Tygodniowy
                          </Button>
                        </div>
                      </div>
                    </div>

                    {appointmentsView === "weekly" ? (
                      <WeeklyAppointmentsView 
                        appointments={appointments?.documents || []}
                        doctors={doctors}
                        onAppointmentClick={(appointment) => setSelectedVisit(appointment)}
                      />
                    ) : appointmentsView === "monthly" ? (
                      <MonthlyAppointmentsView 
                        appointments={appointments?.documents || []}
                        doctors={doctors}
                        onAppointmentClick={(appointment) => setSelectedVisit(appointment)}
                      />
                    ) : (
                      <Card className="rounded-3xl bg-white border-gray-200 p-6">
                        {/* Pasek nawigacji miesiąca + wybór miesiąca/roku (tylko w trybie miesiąca) */}
                        {calendarExpanded && (
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[160px] text-center  rounded-md">
                              {monthCursor.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={monthCursor.getMonth()}
                              onChange={(e) => setMonthCursor(new Date(monthCursor.getFullYear(), parseInt(e.target.value), 1))}
                              className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                            >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(2000, i, 1).toLocaleDateString('pl-PL', { month: 'long' })}</option>
                              ))}
                            </select>
                            <select
                              value={monthCursor.getFullYear()}
                              onChange={(e) => setMonthCursor(new Date(parseInt(e.target.value), monthCursor.getMonth(), 1))}
                              className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                            >
                              {Array.from({ length: 11 }, (_, i) => 2019 + i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                      {calendarExpanded ? (
                        // Pełny kalendarz
                        <div className="space-y-4">
                          {/* Pasek dni tygodnia spójny z widokiem tygodniowym */}
                          <div className="bg-gray-100 rounded-lg grid grid-cols-7 gap-4 mb-4">
                            {(() => {
                              const labels = ["Pn","Wt","Śr","Cz","Pt","Sb","Nd"]
                              const todayIdx = (new Date().getDay() + 6) % 7
                              return labels.map((d, i) => (
                                <div key={d} className={`text-center text-sm font-medium py-2 rounded-[20px] ${i === todayIdx ? 'bg-primary text-white' : 'text-gray-900'}`}>{d}</div>
                              ))
                            })()}
                          </div>
                          <div className="grid grid-cols-7 gap-4">
                            {/* Generuj siatkę tygodni na wybrany miesiąc z wizytami */}
                            {(() => {
                              const weeks = getWeeksOfMonth(monthCursor)
                              const todayStr = new Date().toDateString()
                              return weeks.flatMap((weekStart, idx) => {
                                return Array.from({ length: 7 }, (_, di) => {
                                  const cellDate = new Date(weekStart)
                                  cellDate.setDate(weekStart.getDate() + di)
                                  const isCurrentMonth = cellDate.getMonth() === monthCursor.getMonth()
                                  const isToday = cellDate.toDateString() === todayStr
                                  const dayNumber = cellDate.getDate()

                                  // Wizyty dla danej daty
                                  const dayAppointments = (appointments?.documents || []).filter((apt: any) => {
                                    const d = new Date(apt.schedule)
                                    return d.getFullYear() === cellDate.getFullYear() && d.getMonth() === cellDate.getMonth() && d.getDate() === cellDate.getDate()
                                  }).slice(0, 3) // pokaż max 3
                              
                              return (
                                    <div key={`${idx}-${di}`} className={`h-32 p-2 rounded-[12px] flex flex-col ${isToday ? 'border-2 border-primary bg-white' : isCurrentMonth ? 'bg-gray-100' : 'bg-gray-150'}`}>
                                      <div className={`text-lg font-medium mb-2 flex-shrink-0 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>{dayNumber}</div>
                                      <div className="space-y-2 flex-1 overflow-hidden">
                                        {dayAppointments.map((apt: any, i2: number) => {
                                          const d = new Date(apt.schedule)
                                          const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
                                          const isCancelled = isAppointmentCancelled(apt)
                                          const isCompleted = isAppointmentCompleted(apt)
                                          const color = apt.roomColor ? getColorValue(apt.roomColor) : getAppointmentColor(apt)
                                          const initials = (apt.primaryPhysician || '??').split(' ').map((n: string) => n[0]).join('')
                                          
                                          // Wyprowadź numer gabinetu na podstawie roomName lub roomColor
                                          let roomNumber: string | null = null
                                          if (apt.roomName) {
                                            try {
                                              const roomData = JSON.parse(apt.roomName)
                                              const name = roomData?.name || String(apt.roomName)
                                              roomNumber = String(name).replace(/^Gabinet\s*/i, '')
                                            } catch {
                                              roomNumber = String(apt.roomName).replace(/^Gabinet\s*/i, '')
                                            }
                                          } else if (apt.roomColor) {
                                            const match = PREDEFINED_ROOMS.find(r => r.color.toLowerCase() === String(apt.roomColor).toLowerCase())
                                            if (match?.name) {
                                              roomNumber = String(match.name).replace(/^Gabinet\s*/i, '')
                                            }
                                          }
                                          
                                          // Debug: sprawdź dane wizyty


                                      return (
                                        <div 
                                              key={i2}
                                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:shadow-md transition bg-white border ${ (isCancelled || isCompleted) ? 'opacity-70 line-through' : '' }`}
                                              onClick={() => setSelectedVisit(apt)}
                                            >
                                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                              {(() => {
                                                const doctor = doctors.find(doc => doc.name === apt.primaryPhysician);
                                                return doctor?.avatar ? (
                                                  <img src={doctor.avatar} alt={apt.primaryPhysician} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                                ) : (
                                                  <div className="w-6 h-6 rounded-full bg-gray-200 text-[11px] text-gray-700 flex items-center justify-center flex-shrink-0">{initials}</div>
                                                );
                                              })()}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-sm">
                                                  <span className="font-semibold text-gray-900">{time}</span>
                                                 {roomNumber && (
                                                   <div className="flex items-center gap-1 ml-1">
                                                     <div
                                                       className="w-2 h-2 rounded-full border border-white"
                                                       style={{ backgroundColor: apt.roomColor || '#3B82F6' }}
                                                     />
                                                     <span className="text-xs">
                                                       {(() => {
                                                         try {
                                                           const roomData = JSON.parse(apt.roomName);
                                                           return roomData.name ? roomData.name.replace('Gabinet ', '') : 'Gabinet';
                                                         } catch (e) {
                                                           // Fallback for old format
                                                           return apt.roomName.replace('Gabinet ', '');
                                                         }
                                                       })()}
                                                     </span>
                                                   </div>
                                                 )}
                                                  <span className="text-gray-500">•</span>
                                                  <span className="truncate text-gray-900">{apt.patient?.name || 'Pacjent'}</span>
                                              </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                                                  <span className="truncate">{apt.primaryPhysician || ''}</span>
                                                 {/* Usunięto duplikat etykiety gabinetu w wierszu poniżej czasu */}
                                          </div>
                                        </div>
                                            </div>
                                          )
                                    })}
                                  </div>
                                </div>
                                  )
                                })
                              })
                            })()}
                          </div>
                        </div>
                      ) : (
                        // Widok tygodniowy (domyślny)
                        <>
                      {/* Calendar Header */}
                      <div className="bg-gray-100 rounded-lg grid grid-cols-7 gap-4 mb-4">
                        {(() => {
                          const labels = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"] // poniedziałek jako pierwszy
                          const todayIdxMondayFirst = (new Date().getDay() + 6) % 7 // 0=Pn ... 6=Nd
                          return labels.map((day, i) => (
                            <div
                              key={day}
                              className={`text-center text-sm font-medium py-2 rounded-[20px] ${
                                i === todayIdxMondayFirst ? 'bg-primary text-white' : 'text-gray-900'
                              }`}
                            >
                              {day}
                            </div>
                          ))
                        })()}
                        </div>

                      {/* Calendar Days + szybki wybór tygodnia */}
                      <div className="grid grid-cols-7 gap-4">
                        {getWeekDates(currentWeek).map((day, i) => {
                          const dayAppointments = appointments?.documents
                            ?.filter((apt: any) => {
                              const d = new Date(apt.schedule);
                              return (
                                d.getFullYear() === day.getFullYear() &&
                                d.getMonth() === day.getMonth() &&
                                d.getDate() === day.getDate()
                              );
                            }) || [];
                          const isToday = day.toDateString() === new Date().toDateString();
                              return (
                            <div key={i} className={`h-32 p-2 rounded-[20px] flex flex-col ${isToday ? 'border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'}`}>
                              <div className={`text-lg font-medium mb-2 flex-shrink-0 ${isToday ? 'text-blue-900 font-bold' : 'text-gray-900'}`}>
                                {day.getDate()}
                                {isToday && (
                                  <span className="text-xs text-blue-600 font-medium ml-1">Dziś</span>
                                )}
                              </div>
                          <div className="space-y-1 flex-1 overflow-hidden">
                                {dayAppointments.map((appointment: any, index: number) => {
                              const date = new Date(appointment.schedule);
                              const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                              const isCancelled = isAppointmentCancelled(appointment);
                              const isCompleted = isAppointmentCompleted(appointment);
                                  const color = appointment.roomColor ? appointment.roomColor : getAppointmentColor(appointment);
                                  const doctor = doctors.find(doc => doc.name === appointment.primaryPhysician);
                                  const initials = (doctor?.name || '??').split(' ').map((n: string) => n[0]).join('');
                                  const roomLabel = appointment.roomName ? (() => {
                                    try {
                                      const roomData = JSON.parse(appointment.roomName);
                                      return roomData.name ? String(roomData.name).replace(/^Gabinet\s*/i, '') : '';
                                    } catch (e) {
                                      return String(appointment.roomName).replace(/^Gabinet\s*/i, '');
                                    }
                                  })() : '';
                                  
                              return (
                                <div 
                                  key={index}
                                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:shadow-md transition bg-white border ${ (isCancelled || isCompleted) ? 'opacity-70 line-through' : '' }`}
                                      onClick={() => setSelectedVisit(appointment)}
                                    >
                                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                      {(() => {
                                        const doctor = doctors.find(doc => doc.name === appointment.primaryPhysician);
                                        return doctor?.avatar ? (
                                          <img src={doctor.avatar} alt={appointment.primaryPhysician} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-gray-200 text-[11px] text-gray-700 flex items-center justify-center flex-shrink-0">{initials}</div>
                                        );
                                      })()}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="font-semibold text-gray-900">{time}</span>
                                          <span className="text-gray-500">•</span>
                                          <span className="truncate text-gray-900">{appointment.patient?.name || 'Pacjent'}</span>
                            </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                                          <span className="truncate">{appointment.primaryPhysician || ''}</span>
                                          {roomLabel && (
                                            <span className="px-1.5 py-0.5 rounded-full border text-[10px] text-gray-700 bg-white" style={{borderColor: color}}>
                                              {roomLabel}
                                            </span>
                                    )}
                            </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                              {/* Usunięto przycisk przejścia do tygodnia */}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                      </Card>
                    )}
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Wizyty</h2>
                      <Button className="bg-primary text-white border-0 rounded-2xl">
                        <Plus className="mr-2 h-4 w-4" />
                        Umów pacjenta
                      </Button>
                    </div>

                    <div className="rounded-3xl border bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b ">
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
                                key={visit.$id}
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
                                    {visit.roomName ? (() => {
                                      try {
                                        const roomData = JSON.parse(visit.roomName);
                                        return roomData.name ? roomData.name.replace(/^Gabinet\s*/i, '') : 'Brak';
                                      } catch (e) {
                                        return visit.roomName.replace(/^Gabinet\s*/i, '');
                                      }
                                    })() : 'Brak'}
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
                                    {(() => {
                                      const doctor = doctors.find(doc => doc.name === visit.primaryPhysician);
                                      return doctor?.avatar ? (
                                        <img
                                          src={doctor.avatar}
                                          alt={visit.primaryPhysician}
                                          className="w-8 h-8 rounded-full mr-2"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                          <span className="text-gray-600 text-xs font-medium">
                                            {visit.primaryPhysician?.split(' ').map((n: string) => n[0]).join('') || '??'}
                                          </span>
                                        </div>
                                      );
                                    })()}
                                    <span className="text-gray-900">{visit.primaryPhysician || 'Brak danych'}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-1">
                                    <AppointmentDetails
                                      appointment={visit}
                                      userId={visit.userId}
                                      patientId={visit.patient?.$id || visit.userId}
                                    />
                                    
                                    {(() => {
                                      let statuses: string[];
                                      if (Array.isArray(visit.status)) {
                                        statuses = visit.status;
                                      } else {
                                                  statuses = (visit.status || '').includes(',') ? visit.status.split(',').map((s: string) => s.trim()) : [visit.status || 'awaiting'];
                                                }

                                                const hasAwaiting = statuses.includes('awaiting') || statuses.includes('pending');
                                                const hasAccepted = statuses.includes('accepted');
                                                const hasCancelled = statuses.includes('cancelled');
                                                const isCompleted = visit.isCompleted || statuses.includes('completed');
                                      
                                      const handleMarkAsCompleted = async () => {
                                        try {
                                          // Optymistycznie
                                          setPendingIds(prev => new Set(prev).add(visit.$id))
                                          setAppointments((prev: any) => prev ? { ...prev, documents: prev.documents.map((a: any) => a.$id === visit.$id ? { ...a, status: ["completed"], isCompleted: true } : a) } : prev)

                                          await markAppointmentAsCompleted(visit.$id);
                                          
                                          // Toast sukcesu
                                          toast({
                                            variant: "default",
                                            title: "✅ Wizyta oznaczona jako odbytej",
                                            description: "Wizyta została pomyślnie oznaczona jako odbytej."
                                          });
                                        } catch (error) {
                                          console.error('Błąd podczas oznaczania wizyty jako odbytej:', error);
                                          // Cofnij optymistyczną zmianę
                                          setAppointments((prev: any) => prev ? { ...prev, documents: prev.documents.map((a: any) => a.$id === visit.$id ? { ...a, status: visit.status, isCompleted: visit.isCompleted } : a) } : prev)
                                          toast({
                                            variant: "destructive",
                                            title: "Błąd oznaczania",
                                            description: "Nie udało się oznaczyć wizyty jako odbytej. Spróbuj ponownie."
                                          });
                                        } finally {
                                          setPendingIds(prev => { const n = new Set(prev); n.delete(visit.$id); return n })
                                        }
                                      };


                                      
                                      if (isCompleted) {
                                        return (
                                          <>
                                            <AppointmentNotesModal appointment={visit} />
                                            <AppointmentModal
                                              patientId={visit.patient?.$id || visit.userId}
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

                                      return (
                                        <>
                                          {hasAwaiting && (
                                            <Button
                                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                              onClick={() => handleConfirmAppointment(visit)}
                                              disabled={pendingIds.has(visit.$id)}
                                            >
                                              {pendingIds.has(visit.$id) ? (
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                  Potwierdzanie...
                                                </div>
                                              ) : (
                                                "Potwierdź wizytę"
                                              )}
                                            </Button>
                                          )}
                                          {hasAccepted && (
                                                      <>
                                            <Button
                                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                                              onClick={() => handleRescheduleAppointment(visit)}
                                              disabled={pendingIds.has(visit.$id)}
                                            >
                                              {pendingIds.has(visit.$id) ? (
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                  Przełożenie...
                                                </div>
                                              ) : (
                                                "Przełóż wizytę"
                                              )}
                                            </Button>
                                            <button
                                              onClick={handleMarkAsCompleted}
                                              disabled={pendingIds.has(visit.$id)}
                                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {pendingIds.has(visit.$id) ? (
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                  Oznaczanie...
                                                </div>
                                              ) : (
                                                "Oznacz jako odbytą"
                                              )}
                                            </button>
                                                      </>
                                          )}
                                          {!hasCancelled && (
                                            <AppointmentModal
                                              patientId={visit.patient?.$id || visit.userId}
                                              userId={visit.userId}
                                              appointment={visit}
                                              type="cancel"
                                              title="Anuluj wizytę"
                                              description="Czy na pewno chcesz anulować swoją wizytę?"
                                              isAdminModal={true}
                                              onUpdated={({ id }) => {
                                                // Optymistycznie usuń/anuluj w UI
                                                setAppointments((prev: any) => prev ? { ...prev, documents: prev.documents.map((a: any) => a.$id === id ? { ...a, status: ["cancelled"] } : a) } : prev)
                                              }}
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

                      <div className="flex items-center justify-between p-4 border-t">
                        <div className="text-sm text-gray-600">
                          Strona {currentPage} z {totalPages} ({totalItems} wizyt)
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                          <Button 
                            variant="outline" 
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
                        <Button className="text-white rounded-xl">
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
                                      <Button variant="outline" className="rounded-lg px-3 py-1 text-sm font-medium flex items-center gap-1">
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
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Godziny pracy</h1>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-2"
                      onClick={() => setShowAddEmployeeModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj specjalistę
                    </Button>
                            </div>

                  {/* Weekly View Title */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Widok tygodniowy</h2>
                            </div>

                  {/* Search and Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Szukaj pracowników"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                            </div>
                    
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newWeek = new Date(currentWeek)
                            newWeek.setDate(currentWeek.getDate() - 7)
                            setCurrentWeek(newWeek)
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      <div className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[140px] text-center bg-white  rounded-md">
                          {formatWeekRange(currentWeek)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newWeek = new Date(currentWeek)
                            newWeek.setDate(currentWeek.getDate() + 7)
                            setCurrentWeek(newWeek)
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        </div>
                      </div>

                  {/* Schedule Table */}
                  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                              Pracownik
                            </th>
                            {getWeekDates(currentWeek).map((day, index) => {
                              const isToday = day.toDateString() === new Date().toDateString();
                              return (
                                <th key={index} className={`px-4 py-4 text-center text-sm font-medium border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-100 text-blue-900 border-blue-300' : 'text-gray-900'}`}>
                                  <div>
                                    <div className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                                      {['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Ndz'][index]}
                                    </div>
                                    <div className={`text-sm font-semibold ${isToday ? 'text-blue-900' : ''}`}>
                                      {day.getDate()}.{String(day.getMonth() + 1).padStart(2, '0')}
                                      {isToday && (
                                        <span className="text-xs text-blue-600 font-medium ml-1">Dziś</span>
                                      )}
                                    </div>
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {doctors.map((doctor) => (
                            <tr key={doctor.$id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 border-r border-gray-200">
                                <div className="flex items-center gap-3">
                                  {doctor.avatar ? (
                                    <img
                                      src={doctor.avatar}
                                      alt={doctor.name}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-600">
                                        {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                                      </span>
                                    </div>
                                  )}
                        <div>
                                    <div className="font-medium text-gray-900">{doctor.name}</div>
                                    <div className="text-sm text-gray-500">{doctor.specialization}</div>
                        </div>
                      </div>
                              </td>
                              {getWeekDates(currentWeek).map((day, dayIndex) => {
                                // Użyj slotów dla konkretnej daty, jeśli istnieją, w przeciwnym razie użyj slotów tygodniowych
                                const specificDateSlots = getDaySlotsForDate(doctor.$id, day)
                                const dayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1 // Sunday = 0, Monday = 1, etc.
                                const weeklySlots = getDaySlots(doctor.$id, dayOfWeek)
                                const isToday = day.toDateString() === new Date().toDateString();
                                
                                // Priorytet: sloty dla konkretnej daty, potem sloty tygodniowe
                                const slots = specificDateSlots.length > 0 ? specificDateSlots : weeklySlots
                                
                                return (
                                  <td key={dayIndex} className={`px-4 py-4 text-center border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}>
                                    <div className="space-y-1">
                                      {slots.length > 0 ? (
                                        slots.map((slot, slotIndex) => (
                                          <div
                                            key={slotIndex}
                                            className={`text-xs px-2 py-1 ${slot.status === 'vacation' || slot.status === 'sick_leave' ? 'rounded' : 'rounded-2xl'} cursor-pointer flex items-center gap-1 ${
                                              slot.status === 'vacation' 
                                                ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                                                : slot.status === 'sick_leave'
                                                ? 'bg-red-100 text-red-600 border border-red-200'
                                                : 'text-gray-900'
                                            }`}
                                            onClick={() => openScheduleModal(doctor, dayOfWeek, day)}
                                          >
                                            {slot.status === 'vacation' ? (
                                              <div className={`flex items-center gap-1.5 p-1.5 transition-colors text-orange-700 ${isPastVacationOrSickLeave(slot, day) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                                <span className="text-xs font-medium">Urlop</span>
                                                {isPastVacationOrSickLeave(slot, day || undefined) && (
                                                  <span className="text-xs text-orange-500 ml-1"></span>
                                                )}
                                              </div>
                                            ) : slot.status === 'sick_leave' ? (
                                              <div className={`flex items-center gap-1.5 p-1.5 transition-colors hover:bg-red-200 bg-red-100 text-red-600 ${isPastVacationOrSickLeave(slot, day) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                                <span className="text-xs font-medium">Zwolnienie</span>
                                                {isPastVacationOrSickLeave(slot, day || undefined) && (
                                                  <span className="text-xs text-red-500 ml-1"></span>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs font-semibold text-gray-900">{slot.startTime} - {slot.endTime}</span>
                                                  {slot.roomName && (
                                                    <div className="flex items-center gap-1 ml-1">
                                                      <div
                                                        className="w-2 h-2 rounded-full border border-white"
                                                        style={{ backgroundColor: slot.roomColor || '#3B82F6' }}
                                                      />
                                                      <span className="text-xs">
                                                        {(() => {
                                                          try {
                                                            const roomData = JSON.parse(slot.roomName);
                                                            return roomData.name ? roomData.name.replace('Gabinet ', '') : 'Gabinet';
                                                          } catch (e) {
                                                            // Fallback for old format
                                                            return slot.roomName.replace('Gabinet ', '');
                                                          }
                                                        })()}
                                                      </span>
                        </div>
                                                  )}
                        </div>
                                                <div className="text-xs text-left">
                                                  <span className={slot.type === 'nfz' ? 'text-blue-600 font-medium' : 'text-gray-500'}>{slot.type === 'nfz' ? 'NFZ' : 'Komercyjne'}</span>
                        </div>
                        </div>
                                            )}
                        </div>
                                        ))
                                      ) : (
                                        <div
                                          className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 flex items-center justify-center"
                                          onClick={() => openScheduleModal(doctor, dayOfWeek, day)}
                                        >
                                          +
                        </div>
                                      )}
                        </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                  </div>

                  {/* Podsumowanie miesięczne */}
                 <div className="mt-8">
                   <div className="flex items-center justify-between mb-6">
                     <h2 className="text-2xl font-bold text-gray-900">Podsumowanie miesięczne</h2>
                     <div className="flex items-center gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={async () => {
                           try {
                             const { initializeAllStats } = await import('../../lib/actions/schedule.actions')
                             await initializeAllStats()
                             toast({ variant: "success", title: "Zainicjalizowano statystyki" })
                             window.location.reload()
                           } catch (error) {
                             console.error('Error initializing stats:', error)
                              toast({ variant: "destructive", title: "Błąd", description: "Inicjalizacja statystyk nie powiodła się" })
                           }
                         }}
                       >
                         Inicjalizuj statystyki
                       </Button>
                       <Button
                         variant="outline"
                         disabled
                         size="sm">
                         Exportuj dane
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           const newMonth = new Date(monthCursor)
                           newMonth.setMonth(monthCursor.getMonth() - 1)
                           setMonthCursor(newMonth)
                         }}
                       >
                         <ChevronLeft className="h-4 w-4" />
                       </Button>
                       <div className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[160px] text-center bg-white  rounded-md">
                         {monthCursor.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           const newMonth = new Date(monthCursor)
                           newMonth.setMonth(monthCursor.getMonth() + 1)
                           setMonthCursor(newMonth)
                         }}
                       >
                         <ChevronRight className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>

                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                                Pracownik
                              </th>
                              <th className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                                Godziny pracy<br />
                                <span className="text-xs text-gray-500 font-normal">(z miesiąca)</span>
                              </th>
                              <th className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                                Dni urlopowe<br />
                                <span className="text-xs text-gray-500 font-normal">(z roku)</span>
                              </th>
                              <th className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                                Zwolnienia<br />
                                <span className="text-xs text-gray-500 font-normal">(z roku)</span>
                              </th>
                              <th className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                                Pozostałe urlopy<br />
                                <span className="text-xs text-gray-500 font-normal">(z roku)</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {doctors.map((doctor) => {
                              const stats = monthlyStats[doctor.$id] || {
                                totalHours: 0,
                                vacationDays: 0,
                                sickLeaveDays: 0,
                                workingDays: 0,
                                remainingVacationDays: 21
                              }
                              return (
                                <tr key={doctor.$id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 border-r border-gray-200">
                                    <div className="flex items-center gap-3">
                                      {doctor.avatar ? (
                                        <img
                                          src={doctor.avatar}
                                          alt={doctor.name}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-xs font-medium text-gray-600">
                                            {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium text-gray-900">{doctor.name}</div>
                                        <div className="text-sm text-gray-500">{doctor.specialization}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center border-r border-gray-200">
                                    <div className="text-sm font-medium text-gray-900">
                                      {stats.totalHours}h
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {stats.workingDays} dni
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center border-r border-gray-200">
                                    <div className="text-sm font-medium text-orange-600">
                                      {stats.vacationDays} dni
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center border-r border-gray-200">
                                    <div className="text-sm font-medium text-red-600">
                                      {stats.sickLeaveDays} dni
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <div className="text-sm font-medium text-green-600">
                                      {stats.remainingVacationDays} dni
                                    </div>
                                    {typeof stats.totalVacationDays === 'number' && (
                                    <div className="text-xs text-gray-500">
                                        z {stats.totalVacationDays} dostępnych
                                    </div>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      </div>
                  </div>

                  {/* Miesięczny grafik specjalistów */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Grafik miesięczny</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMonth = new Date(monthCursor)
                            newMonth.setMonth(monthCursor.getMonth() - 1)
                            setMonthCursor(newMonth)
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[160px] text-center bg-white  rounded-md">
                          {monthCursor.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMonth = new Date(monthCursor)
                            newMonth.setMonth(monthCursor.getMonth() + 1)
                            setMonthCursor(newMonth)
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                      {/* Nagłówki dni tygodnia */}
                      <div className="bg-gray-50 grid grid-cols-7 gap-px">
                        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day) => (
                          <div key={day} className="p-3 text-center text-sm font-medium text-gray-900">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Siatka kalendarza */}
                      <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {(() => {
                          const monthDates = getMonthDates(monthCursor)
                          const firstDay = monthDates[0]
                          const startDay = (firstDay.getDay() + 6) % 7 // Poniedziałek = 0
                          const totalCells = Math.ceil((startDay + monthDates.length) / 7) * 7
                          
                          return Array.from({ length: totalCells }, (_, index) => {
                            const dayIndex = index - startDay
                            const isCurrentMonth = dayIndex >= 0 && dayIndex < monthDates.length
                            const day = isCurrentMonth ? monthDates[dayIndex] : null
                            
                            if (!isCurrentMonth) {
                              return (
                                <div key={index} className="h-full bg-gray-100"></div>
                              )
                            }

                            const dayOfWeek = day ? (day.getDay() === 0 ? 7 : day.getDay()) : 1 // Monday = 1, Sunday = 7
                            const isToday = day ? day.toDateString() === new Date().toDateString() : false
                            
                            return (
                              <div 
                                key={index} 
                                className={`h-full p-3 border-r border-b border-gray-100 ${isToday ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200' : 'bg-white'}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-sm font-medium ${isToday ? 'text-blue-900 font-bold' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {day ? day.getDate() : ''}
                                  </span>
                                  {isToday && (
                                    <span className="text-xs text-blue-600 font-medium">Dziś</span>
                                  )}
                                </div>
                                
                                <div className="space-y-1.5">
                                  {doctors.map((doctor) => {
                                    const slots = day ? getDaySlotsForDate(doctor.$id, day) : []
                                    
                                    if (slots.length === 0) {
                                      return (
                                        <div 
                                          key={doctor.$id} 
                                          className="flex items-center gap-1.5 p-1.5 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                                          onClick={() => day && openScheduleModalForDate(doctor, day)}
                                        >
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
                                          <span className="text-xs text-gray-400">+</span>
                                        </div>
                                      )
                                    }
                                    
                                    
                                    return slots.map((slot, slotIndex) => {
                                      if (slot.status === 'sick_leave') {
                                        return (
                                          <div 
                                            key={slotIndex} 
                                            className={`flex items-center gap-1.5 p-1.5 rounded transition-colors hover:bg-red-200 bg-red-100 text-red-600 border border-red-200 ${isPastVacationOrSickLeave(slot, day || undefined) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                            onClick={() => {
                                              if (day) {
                                                if (isPastVacationOrSickLeave(slot, day || undefined)) {
                                                  toast({
                                                    variant: "destructive",
                                                    title: "Tylko podgląd",
                                                    description: "Nie można edytować urlopów i zwolnień z przeszłości"
                                                  })
                                                } else {
                                                  openScheduleModalForDate(doctor, day)
                                                }
                                              }
                                            }}
                                          >
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
                                            <span className="text-xs font-medium">Zwolnienie</span>
                                            {isPastVacationOrSickLeave(slot, day || undefined) && (
                                              <span className="text-xs text-red-500 ml-1"></span>
                                            )}
                                          </div>
                                        )
                                      }
                                      
                                      if (slot.status === 'vacation') {
                                        return (
                                          <div 
                                            key={slotIndex} 
                                            className={`flex items-center gap-1.5 p-1.5 rounded transition-colors hover:bg-orange-200 bg-orange-100 text-orange-700 border border-orange-200 ${isPastVacationOrSickLeave(slot, day || undefined) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                            onClick={() => {
                                              if (day) {
                                                if (isPastVacationOrSickLeave(slot, day || undefined)) {
                                                  toast({
                                                    variant: "destructive",
                                                    title: "Tylko podgląd",
                                                    description: "Nie można edytować urlopów i zwolnień z przeszłości"
                                                  })
                                                } else {
                                                  openScheduleModalForDate(doctor, day)
                                                }
                                              }
                                            }}
                                          >
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
                                            <span className="text-xs font-medium">Urlop</span>
                                            {isPastVacationOrSickLeave(slot, day || undefined) && (
                                              <span className="text-xs text-orange-500 ml-1"></span>
                                            )}
                                          </div>
                                        )
                                      }
                                      
                                      return (
                                        <div 
                                          key={slotIndex} 
                                          className="flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors hover:bg-blue-50"
                                          onClick={() => day && openScheduleModalForDate(doctor, day)}
                                        >
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
                                          <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs font-medium text-gray-900 truncate">
                                                {slot.startTime}-{slot.endTime}
                                              </span>
                                              {slot.roomColor && (
                                                <div
                                                  className="w-2 h-2 rounded-full border border-white"
                                                  style={{ backgroundColor: slot.roomColor }}
                                                />
                                              )}
                                              <span className="text-xs">
                                                {(() => {
                                                  try {
                                                    const roomData = JSON.parse(slot.roomName);
                                                    return roomData.name ? roomData.name.replace('Gabinet ', '') : 'Gabinet';
                                                  } catch (e) {
                                                    // Fallback for old format
                                                    return slot.roomName.replace('Gabinet ', '');
                                                  }
                                                })()}
                                              </span>
                                            </div>
                                            <span className={`text-xs truncate ${slot.type === 'nfz' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                              {slot.type === 'nfz' ? 'NFZ' : 'Komercyjne'}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    })
                                  })}
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                      </div>
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
                            src="/assets/images/sylwia.jpg"
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
                            src="/assets/images/sylwia.jpg"
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

                {/* Usunięto ciężkie sekcje Apps/Files/Projects/Learn aby odchudzić stronę */}

                

                

                
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>
      </div>

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
                <Button 
                  variant="outline" 
                  className="rounded-2xl flex-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  onClick={() => {
                    playButtonSound()
                    if (confirm(`Czy na pewno chcesz usunąć pacjenta ${selectedPatient.name}?\n\nTa operacja jest nieodwracalna!`)) {
                      handleDeletePatient()
                    }
                  }}
                >
                  Usuń pacjenta
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Edit Modal */}
      {showScheduleModal && selectedDoctor && (selectedDay !== null || selectedDate !== null) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Edytuj godziny pracy</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedDoctor.name} - {
                      selectedDate 
                        ? selectedDate.toLocaleDateString('pl-PL', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })
                        : selectedDay !== null 
                          ? ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'][selectedDay]
                          : ''
                    }
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowScheduleModal(false)} 
                  className="rounded-full"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Room Selection - tylko dla pracy */}
              {scheduleModalType === 'working' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Wybierz gabinet</label>
                <div className="grid grid-cols-2 gap-3">
                  {PREDEFINED_ROOMS.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRoom === room.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: room.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">{room.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={scheduleModalType === "working" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScheduleModalType("working")}
                  className={scheduleModalType === "working" ? "bg-purple-100 text-purple-700" : ""}
                >
                  Dzień pracujący
                </Button>
                <Button
                  variant={scheduleModalType === "sick_leave" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScheduleModalType("sick_leave")}
                  className={scheduleModalType === "sick_leave" ? "bg-purple-100 text-purple-700" : ""}
                >
                  Zwolnienie
                </Button>
                <Button
                  variant={scheduleModalType === "vacation" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScheduleModalType("vacation")}
                  className={scheduleModalType === "vacation" ? "bg-purple-100 text-purple-700" : ""}
                >
                  Urlop
                </Button>
              </div>

              {/* Time Slots */}
              <div className="space-y-4 mb-6">
                {scheduleModalType === "working" ? (
                  <>
                    {/* Working Day Slots */}
                    <div className="space-y-3">
                      {modalTimeSlots.map((slot) => (
                        <div key={slot.id} className="space-y-4 p-4 border border-gray-200 rounded-2xl">
                          {/* Górna linia - godziny i typ wizyty */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Od:</span>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Do:</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTimeSlot(slot.id, 'type', 'commercial')}
                                className={slot.type === 'commercial' ? "bg-purple-100 text-purple-700 border-purple-200" : ""}
                              >
                                Komercyjne
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTimeSlot(slot.id, 'type', 'nfz')}
                                className={slot.type === 'nfz' ? "bg-purple-100 text-purple-700 border-purple-200" : ""}
                              >
                                NFZ
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 ml-auto"
                              onClick={() => removeTimeSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Dolna linia - czas wizyty i stawka */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Czas wizyty:</span>
                              <input
                                type="number"
                                min="15"
                                max="120"
                                step="15"
                                value={slot.appointmentDuration || 60}
                                onChange={(e) => updateTimeSlot(slot.id, 'appointmentDuration', parseInt(e.target.value))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                              />
                              <span className="text-sm text-gray-600">min</span>
                            </div>
                            
                            {slot.type === 'commercial' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Stawka:</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={slot.consultationFee || 150}
                                  onChange={(e) => updateTimeSlot(slot.id, 'consultationFee', parseInt(e.target.value))}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <span className="text-sm text-gray-600">PLN</span>
                                {selectedDoctor && getDoctorHistoricalRates(selectedDoctor.$id).hasHistory && slot.id.startsWith('new-') && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    Sugerowane
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {slot.type === 'nfz' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">NFZ:</span>
                                <span className="text-sm text-gray-600">Za darmo</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                      onClick={addTimeSlot}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj kolejne godziny
                    </Button>
                  </>
                ) : (
                  /* Vacation/Sick Leave */
                  <div className="p-6 border border-gray-200 rounded-2xl text-center">
                    <p className="text-gray-600">
                      {scheduleModalType === "vacation" ? "Dzień urlopu" : "Dzień zwolnienia"}
                    </p>
                  </div>
      )}
    </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  onClick={() => {
                    playButtonSound()
                    deleteSchedule()
                  }}
                  disabled={selectedDate ? new Date(selectedDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) : false}
                >
                  Usuń
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    playButtonSound()
                    setShowScheduleModal(false)
                  }}
                >
                  Anuluj
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    playButtonSound()
                    saveSchedule()
                  }}
                  disabled={isSavingSchedule}
                >
                  {isSavingSchedule ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Dodaj specjalistę</h2>
                  <p className="text-gray-600 mt-1">Dodaj nowego pracownika do systemu</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddEmployeeModal(false)} 
                  className="rounded-full"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-2xl"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Dodaj zdjęcie
                  </Button>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imię i Nazwisko</label>
                  <input
                    type="text"
                    value={newSpecialist.name}
                    onChange={(e) => handleSpecialistInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Wprowadź imię i nazwisko"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stanowisko</label>
                  <select 
                    value={newSpecialist.specialization}
                    onChange={(e) => handleSpecialistInputChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Wybierz stanowisko</option>
                    <option value="psycholog">Psycholog</option>
                    <option value="psychiatra">Psychiatra</option>
                    <option value="terapeuta">Terapeuta</option>
                    <option value="lekarz">Lekarz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newSpecialist.email}
                    onChange={(e) => handleSpecialistInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={newSpecialist.phone}
                    onChange={(e) => handleSpecialistInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+48 123 456 789"
                  />
                </div>


                <div>
                  <p className="text-sm text-gray-600">
                    Możesz ustawić indywidualny czas wizyty i stawkę dla każdego dnia. NFZ jest zawsze za darmo.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    playButtonSound()
                    setShowAddEmployeeModal(false)
                  }}
                >
                  Anuluj
                </Button>
                <Button
                  onClick={() => {
                    playButtonSound()
                    handleAddSpecialist()
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Dodaj specjalistę
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal szczegółów wizyty */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Szczegóły wizyty</h2>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
    </div>
              <AppointmentDetailsContent
                appointment={selectedVisit}
                userId={selectedVisit.userId}
                patientId={selectedVisit.patient?.$id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Element audio do odtwarzania dźwięku */}
      <audio 
        ref={audioRef} 
        preload="auto"
        controls={false}
        style={{ display: 'none' }}
        onLoadStart={() => console.log("🔊 Rozpoczęto ładowanie audio")}
        onLoadedData={() => console.log("🔊 Audio załadowane pomyślnie")}
        onCanPlay={() => console.log("🔊 Audio gotowe do odtworzenia")}
        onError={(e) => console.error("❌ Błąd ładowania audio:", e)}
        onPlay={() => console.log("🔊 Audio rozpoczęło odtwarzanie")}
        onEnded={() => console.log("🔊 Audio zakończyło odtwarzanie")}
      >
        <source src="/assets/sounds/nowa-wizyta.mp3" type="audio/mpeg" />
        <source src="/assets/sounds/nowa-wizyta.mp3" type="audio/mp3" />
        Twoja przeglądarka nie obsługuje elementu audio.
      </audio>


      {/* Element audio do dźwięku przycisków */}
      <audio 
        ref={buttonAudioRef} 
        preload="auto"
        controls={false}
        style={{ display: 'none' }}
        onError={(e) => console.error("Błąd ładowania dźwięku przycisku:", e)}
      >
        <source src="/assets/sounds/button.mp3" type="audio/mpeg" />
        <source src="/assets/sounds/button.mp3" type="audio/mp3" />
        Twoja przeglądarka nie obsługuje elementu audio.
      </audio>


      {/* Powiadomienie o nowej wizycie */}
      {isNewAppointment && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">Nowa wizyta! Potwierdź ją w panelu</span>
        </motion.div>
      )}

      {/* System bezpieczeństwa */}
      <SecurityPopup
        isOpen={showSecurityPopup}
        onClose={handleSecurityClose}
        onSuccess={handleSecuritySuccess}
      />

      {/* Modal potwierdzenia wizyty */}
      {selectedAppointment && (
        <AppointmentConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          appointment={selectedAppointment}
          doctors={doctors}
          doctorWorkingHours={{}}
          schedules={schedules}
          scheduleSlots={scheduleSlots}
          onConfirm={handleConfirmAppointmentSubmit}
        />
      )}

      {/* Modal przełożenia wizyty */}
      {selectedAppointment && (
        <AppointmentRescheduleModal
          open={showRescheduleModal}
          onOpenChange={setShowRescheduleModal}
          appointment={selectedAppointment}
          doctors={doctors}
          doctorWorkingHours={{}}
          schedules={schedules}
          scheduleSlots={scheduleSlots}
          onReschedule={handleRescheduleSubmit}
        />
      )}
    </div>
  );
};
