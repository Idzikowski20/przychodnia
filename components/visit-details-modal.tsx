"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Calendar, User, Phone, Mail, MapPin, Briefcase, Heart } from "lucide-react"

// Funkcja do odtwarzania dźwięku przycisku
const playButtonSound = () => {
  const audio = new Audio("/assets/sounds/button.mp3");
  audio.play().catch((error) => {
    console.error("Błąd odtwarzania dźwięku przycisku:", error);
  });
};

interface VisitDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  visit: {
    id: number
    patient: string
    status: string
    statusColor: string
    office: string
    date: string
    time: string
    doctor: string
    doctorAvatar: string
    rescheduleNote?: string
  }
}

export function VisitDetailsModal({ isOpen, onClose, visit }: VisitDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-2xl font-semibold">Szczegóły wizyty</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-8">
          {/* Visit Information */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Informacje o wizycie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <Badge className={`${visit.statusColor} rounded-full px-3 py-1`}>{visit.status}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data i godzina</label>
                <div className="mt-1 text-gray-900 font-medium">
                  {visit.date} {visit.time}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Lekarz</label>
                <div className="mt-1 flex items-center">
                  <img
                    src={visit.doctorAvatar || "/placeholder.svg"}
                    alt={visit.doctor}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-gray-900 font-medium">{visit.doctor}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gabinet</label>
                <div className="mt-1 flex items-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                    •
                  </div>
                  <span className="text-gray-900 font-medium">{visit.office}</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Powód wizyty</label>
                <div className="mt-1 text-gray-900">Konsultacja psychologiczna</div>
              </div>

              {visit.rescheduleNote && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Notatka przełożenia</label>
                  <div className="mt-1 text-blue-600 bg-blue-50 p-3 rounded-md">{visit.rescheduleNote}</div>
                </div>
              )}
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Dane osobowe pacjenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Imię i nazwisko</label>
                <div className="mt-1 text-gray-900 font-medium">{visit.patient}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="mt-1 text-gray-900 flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  {visit.patient === "Aleksandra Górecka" ? "ola.gor109@gmail.com" : "patryk.idzikowski@interia.pl"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Numer telefonu</label>
                <div className="mt-1 text-gray-900 flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  {visit.patient === "Aleksandra Górecka" ? "+48511067638" : "+48663164074"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data urodzenia</label>
                <div className="mt-1 text-gray-900">
                  {visit.patient === "Aleksandra Górecka" ? "19 kwietnia 2000" : "15 marca 1995"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Płeć</label>
                <div className="mt-1 text-gray-900">
                  {visit.patient === "Aleksandra Górecka" ? "Kobieta" : "Mężczyzna"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Zawód</label>
                <div className="mt-1 text-gray-900 flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500" />
                  Pracownik
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Adres</label>
                <div className="mt-1 text-gray-900 flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  Wesoła 48 Rybie
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Heart className="mr-2 h-5 w-5 text-green-600" />
              Informacje medyczne
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Ubezpieczyciel</label>
                <div className="mt-1 text-gray-900">NFZ</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Numer polisy</label>
                <div className="mt-1 text-gray-900">-</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Alergie</label>
                <div className="mt-1 text-gray-900">Orzechy</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Aktualnie przyjmowane leki</label>
                <div className="mt-1 text-gray-900">żadne</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Historia medyczna rodziny</label>
                <div className="mt-1 text-gray-900">żadne</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Przebyte choroby</label>
                <div className="mt-1 text-gray-900">żadne</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-green-200">
              <h4 className="font-medium text-gray-900 mb-2">Zgody i prywatność</h4>
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Zgoda na politykę prywatności
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-orange-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Kontakt awaryjny</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Imię i nazwisko</label>
                <div className="mt-1 text-gray-900">-</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Numer telefonu</label>
                <div className="mt-1 text-gray-900">-</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" className="rounded-xl bg-transparent">
              Notatka
            </Button>
            <Button onClick={() => {
              playButtonSound();
              // Tutaj można dodać logikę umawiania ponownie
            }} className="bg-green-600 hover:bg-green-700 text-white rounded-xl">Umów ponownie</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
