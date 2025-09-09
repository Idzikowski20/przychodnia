"use client";

import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";

import { getDoctors } from "@/lib/actions/doctor.actions";
import { getRooms, updateRoom, createRoom, removeDuplicateRooms } from "@/lib/actions/room.actions";
import { Room } from "@/types/appwrite.types";

type RoomWithStatus = Room & {
  isOccupied: boolean;
  currentAppointment?: {
    patientName: string;
    time: string;
  };
};

type OfficeViewProps = {
  appointments?: any[];
  onRoomChange?: () => void;
};

export const OfficeView = ({ appointments = [], onRoomChange }: OfficeViewProps) => {
  const [rooms, setRooms] = useState<RoomWithStatus[]>([]);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [assigningRoom, setAssigningRoom] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const hasInitialized = useRef(false);

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

  useEffect(() => {
    const fetchData = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      
      try {
        const [doctorsData, roomsData] = await Promise.all([
          getDoctors(),
          getRooms()
        ]);
        
        setDoctors(doctorsData);
        
        // Sprawdź czy gabinety już istnieją w bazie
        if (roomsData.length === 0) {
          console.log("Tworzenie domyślnych gabinetów...");
          const defaultRooms = [
            { name: "Gabinet 1A", color: "purple" },
            { name: "Gabinet 1B", color: "green" },
            { name: "Gabinet 2A", color: "yellow" },
            { name: "Gabinet 2B", color: "red" },
          ];
          
          // Utwórz domyślne gabinety w bazie
          for (const room of defaultRooms) {
            await createRoom(room);
          }
          
          // Pobierz ponownie gabinety
          const updatedRooms = await getRooms();
          setRooms(updatedRooms.map((room: any) => ({ ...room, isOccupied: false })));
        } else {
          console.log("Znaleziono gabinety w bazie:", roomsData.length);
          // Usuń duplikaty na podstawie nazwy
          const uniqueRooms = roomsData.filter((room: any, index: number, self: any[]) => 
            index === self.findIndex((r: any) => r.name === room.name)
          );
          console.log("Po usunięciu duplikatów:", uniqueRooms.length);
          setRooms(uniqueRooms.map((room: any) => ({ ...room, isOccupied: false })));
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
        hasInitialized.current = false; // Reset w przypadku błędu
      }
    };

    fetchData();
  }, []);

  // Sprawdź które gabinety są zajęte na podstawie aktualnych wizyt
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const updatedRooms = rooms.map((room: any) => {
      // Znajdź wizytę w tym gabinecie w aktualnej godzinie
      const currentAppointment = appointments.find((appointment: any) => {
        const appointmentTime = new Date(appointment.schedule);
        const appointmentHour = appointmentTime.getHours();
        
        // Sprawdź czy wizyta jest w tym samym gabinecie i w aktualnej godzinie
        return appointment.roomName === room.name && 
               appointmentHour === currentHour &&
               appointmentTime.toDateString() === now.toDateString();
      });

      return {
        ...room,
        isOccupied: !!currentAppointment,
        currentAppointment: currentAppointment ? {
          patientName: currentAppointment.patient.name,
          time: new Date(currentAppointment.schedule).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
        } : undefined
      };
    });

    setRooms(updatedRooms);
  }, [appointments]);

  const handleEditStart = (roomId: string, currentName: string) => {
    setEditingRoom(roomId);
    setEditingName(currentName);
  };

  const handleEditSave = async () => {
    if (editingRoom && editingName.trim()) {
      try {
        await updateRoom({
          roomId: editingRoom,
          room: { name: editingName.trim() }
        });
        
        // Odśwież listę gabinetów i usuń duplikaty
        const updatedRooms = await getRooms();
        const uniqueRooms = updatedRooms.filter((room: any, index: number, self: any[]) => 
          index === self.findIndex((r: any) => r.name === room.name)
        );
        setRooms(uniqueRooms.map((room: any) => ({ ...room, isOccupied: false })));
      } catch (error) {
        console.error("Błąd podczas aktualizacji nazwy gabinetu:", error);
      }
    }
    setEditingRoom(null);
    setEditingName("");
  };

  const handleEditCancel = () => {
    setEditingRoom(null);
    setEditingName("");
  };

  const handleAssignSpecialist = async (roomId: string, specialistName: string) => {
    try {
      await updateRoom({
        roomId,
        room: { assignedSpecialist: specialistName }
      });
      
      // Odśwież listę gabinetów i usuń duplikaty
      const updatedRooms = await getRooms();
      const uniqueRooms = updatedRooms.filter((room: any, index: number, self: any[]) => 
        index === self.findIndex((r: any) => r.name === room.name)
      );
      setRooms(uniqueRooms.map((room: any) => ({ ...room, isOccupied: false })));
    } catch (error) {
      console.error("Błąd podczas przypisywania specjalisty:", error);
    }
    setAssigningRoom(null);
    setSelectedSpecialist(null);
  };

  const handleSpecialistSelect = (specialistName: string) => {
    setSelectedSpecialist(specialistName);
  };

  const handleConfirmAssignment = async () => {
    if (assigningRoom && selectedSpecialist) {
      await handleAssignSpecialist(assigningRoom, selectedSpecialist);
    }
  };

  const handleColorChange = async (roomId: string, color: string) => {
    try {
      await updateRoom({
        roomId,
        room: { color }
      });
      
      // Odśwież listę gabinetów i usuń duplikaty
      const updatedRooms = await getRooms();
      const uniqueRooms = updatedRooms.filter((room: any, index: number, self: any[]) => 
        index === self.findIndex((r: any) => r.name === room.name)
      );
      setRooms(uniqueRooms.map((room: any) => ({ ...room, isOccupied: false })));
      setEditingColor(null);
      
      // Powiadom rodzica o zmianie (odśwież wizyty)
      if (onRoomChange) {
        onRoomChange();
      }
    } catch (error) {
      console.error("Błąd podczas zmiany koloru gabinetu:", error);
    }
  };


  const handleRemoveDuplicates = async () => {
    try {
      const result = await removeDuplicateRooms();
      if (result && result.success) {
        console.log(`Usunięto ${result.removedCount} duplikatów`);
        // Odśwież listę gabinetów
        const updatedRooms = await getRooms();
        setRooms(updatedRooms.map((room: any) => ({ ...room, isOccupied: false })));
        alert(`Usunięto ${result.removedCount} duplikatów gabinetów!`);
      }
    } catch (error) {
      console.error("Błąd podczas usuwania duplikatów:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Biuro wirtualne</h2>
        <p className="text-white/70">Widok z ptaka - zarządzaj gabinetami i specjalistami</p>
      </div>

      {/* Legenda */}
      <div className="flex justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-400"></div>
          <span className="text-white text-sm">Wolny</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-400"></div>
          <span className="text-white text-sm">Zajęty</span>
        </div>
      </div>

      {/* Przycisk usuwania duplikatów */}
      {rooms.length > 4 && (
        <div className="text-center mb-6">
          <button
            onClick={handleRemoveDuplicates}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            🗑️ Usuń duplikaty gabinetów ({rooms.length - 4} duplikatów)
          </button>
        </div>
      )}

      {/* Gabinety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {rooms.map((room) => (
          <div
            key={room.$id}
            className="relative p-6 rounded-xl border-2 transition-all duration-300"
            style={{
              backgroundColor: room.assignedSpecialist 
                ? `${getColorValue(room.color || 'red')}33` 
                : `${getColorValue(room.color || 'green')}33`,
              borderColor: getColorValue(room.color || (room.assignedSpecialist ? 'red' : 'green'))
            }}
          >
            {/* Nazwa gabinetu z edycją */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {editingRoom === room.$id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                    />
                    <button
                      onClick={handleEditSave}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingColor(room.$id)}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                        title="Zmień kolor"
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: getColorValue(room.color || 'green') }}
                        ></div>
                      </button>
                      <button
                        onClick={() => handleEditStart(room.$id, room.name)}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status gabinetu */}
            <div className="mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                room.assignedSpecialist 
                  ? 'bg-red-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                <div className="w-2 h-2 rounded-full bg-white"></div>
                {room.assignedSpecialist ? 'Zajęty' : 'Wolny'}
              </div>
            </div>

            {/* Aktualna wizyta */}
            {room.isOccupied && room.currentAppointment && (
              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                <p className="text-white text-sm">
                  <span className="font-medium">Pacjent:</span> {room.currentAppointment.patientName}
                </p>
                <p className="text-white text-sm">
                  <span className="font-medium">Godzina:</span> {room.currentAppointment.time}
                </p>
              </div>
            )}

            {/* Przypisany specjalista */}
            <div className="mb-4">
              {room.assignedSpecialist ? (
                <div>
                  <p className="text-white/70 text-sm mb-2">Specjalista:</p>
                  
                  {/* Avatar i nazwa specjalisty */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar specjalisty */}
                    {(() => {
                      const assignedDoctor = doctors.find((doctor: any) => doctor.name === room.assignedSpecialist);
                      return assignedDoctor?.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
                          <img
                            src={assignedDoctor.avatar}
                            alt={room.assignedSpecialist}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {room.assignedSpecialist.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                      );
                    })()}
                    
                    {/* Nazwa specjalisty */}
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{room.assignedSpecialist}</p>
                    </div>
                  </div>
                  
                  {/* Przycisk zmiany */}
                  <button
                    onClick={() => setAssigningRoom(room.$id)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                  >
                    Zmień
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-white/70 text-sm mb-2">Brak przypisanego specjalisty</p>
                  <button
                    onClick={() => setAssigningRoom(room.$id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Przypisz
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal wyboru koloru */}
      {editingColor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">Wybierz kolor gabinetu</h3>
            
            {/* Paleta kolorów */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {['green', 'blue', 'purple', 'red', 'yellow', 'pink', 'indigo', 'teal'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(editingColor, color)}
                  className="w-12 h-12 rounded-full border-2 border-white/30 hover:border-white transition-colors"
                  style={{ backgroundColor: getColorValue(color) }}
                  title={color}
                />
              ))}
            </div>
            
            {/* Przycisk anulowania */}
            <button
              onClick={() => setEditingColor(null)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Modal wyboru specjalisty */}
      {assigningRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">Wybierz specjalistę</h3>
            
            {/* Awatary specjalistów */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {doctors.map((doctor: any) => (
                <div
                  key={doctor.$id}
                  onClick={() => handleSpecialistSelect(doctor.name)}
                  className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedSpecialist === doctor.name 
                      ? 'bg-green-500/20 border-2 border-green-500' 
                      : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50'
                  }`}
                >
                  {/* Avatar */}
                  {doctor.avatar ? (
                    <div className={`w-12 h-12 rounded-full overflow-hidden mb-2 ${
                      selectedSpecialist === doctor.name ? 'ring-2 ring-green-500' : ''
                    }`}>
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 ${
                      selectedSpecialist === doctor.name ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      {doctor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  
                  {/* Imię */}
                  <span className={`text-sm text-center ${
                    selectedSpecialist === doctor.name ? 'text-green-400 font-medium' : 'text-gray-300'
                  }`}>
                    {doctor.name}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Przyciski akcji */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAssignment}
                disabled={!selectedSpecialist}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                  selectedSpecialist 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Potwierdź
              </button>
              <button
                onClick={() => {
                  setAssigningRoom(null);
                  setSelectedSpecialist(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informacje */}
      <div className="text-center text-white/50 text-sm">
        <p>Kliknij ikonę ołówka aby edytować nazwę gabinetu</p>
        <p>Kliknij kolor aby zmienić kolor gabinetu</p>
        <p>Użyj przycisku &quot;Przypisz&quot; aby przypisać specjalistę do gabinetu</p>
      </div>
    </div>
  );
};