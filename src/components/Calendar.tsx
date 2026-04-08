"use client";

import { useState, useMemo } from "react";

interface CalendarProps {
  onSelect: (consultant: string, date: string, time: string) => void;
}

type Consultant = "Juan Mansilha" | "Rodrigo Lopes";

// Juan: terça dia todo, sexta dia todo, sábado 8h-11h, outros dias semana após 20h
// Rodrigo: todos os dias após 20h, sábado 8h-11h

function getAvailableSlots(
  consultant: Consultant,
  date: Date
): string[] {
  const day = date.getDay(); // 0=domingo, 1=segunda... 6=sábado

  if (day === 0) return []; // Domingo - ninguém

  if (consultant === "Juan Mansilha") {
    if (day === 2 || day === 5) {
      // Terça ou sexta - dia todo
      return [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
      ];
    }
    if (day === 6) {
      // Sábado 8h-11h
      return ["08:00", "09:00", "10:00"];
    }
    // Outros dias da semana (seg, qua, qui) após 20h
    return ["20:00", "20:30", "21:00", "21:30"];
  }

  if (consultant === "Rodrigo Lopes") {
    if (day === 6) {
      // Sábado 8h-11h
      return ["08:00", "09:00", "10:00"];
    }
    // Todos os dias da semana após 20h
    return ["20:00", "20:30", "21:00", "21:30"];
  }

  return [];
}

export default function Calendar({ onSelect }: CalendarProps) {
  const [selectedConsultant, setSelectedConsultant] =
    useState<Consultant | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const consultants: { name: Consultant; desc: string }[] = [
    { name: "Juan Mansilha", desc: "Estratégia & Performance" },
    { name: "Rodrigo Lopes", desc: "Sócio Fundador" },
  ];

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));

    return days;
  }, [currentMonth]);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const availableSlots = useMemo(() => {
    if (!selectedConsultant || !selectedDate) return [];
    return getAvailableSlots(selectedConsultant, selectedDate);
  }, [selectedConsultant, selectedDate]);

  const isDateAvailable = (date: Date) => {
    if (date < today) return false;
    if (!selectedConsultant) return false;
    return getAvailableSlots(selectedConsultant, date).length > 0;
  };

  const handleConfirm = () => {
    if (selectedConsultant && selectedDate && selectedTime) {
      const formattedDate = `${selectedDate.getDate().toString().padStart(2, "0")}/${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}/${selectedDate.getFullYear()}`;
      onSelect(selectedConsultant, formattedDate, selectedTime);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in-up">
      {/* Step 1: Choose consultant */}
      <div>
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-3 block">
          1. Escolha o consultor
        </span>
        <div className="grid grid-cols-2 gap-3">
          {consultants.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setSelectedConsultant(c.name);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                selectedConsultant === c.name
                  ? "border-white/30 bg-white/10"
                  : "border-white/5 hover:border-white/15 hover:bg-white/5"
              }`}
            >
              {/* Mini avatar */}
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                <span className="text-xs font-bold text-white/40">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{c.name}</p>
              <p className="text-[10px] font-light text-white/30">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Calendar */}
      {selectedConsultant && (
        <div className="animate-fade-in">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-3 block">
            2. Escolha a data
          </span>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-white">
              {monthNames[currentMonth.getMonth()]}{" "}
              {currentMonth.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((d) => (
              <div
                key={d}
                className="text-center text-[9px] font-semibold tracking-[0.1em] uppercase text-white/20 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date, i) => {
              if (!date) return <div key={i} />;
              const available = isDateAvailable(date);
              const isSelected =
                selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === today.toDateString();

              return (
                <button
                  key={i}
                  disabled={!available}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  className={`calendar-day ${
                    available
                      ? "calendar-day-available"
                      : "calendar-day-disabled"
                  } ${isSelected ? "calendar-day-selected" : ""} ${
                    isToday ? "calendar-day-today" : ""
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Time slots */}
      {selectedDate && availableSlots.length > 0 && (
        <div className="animate-fade-in">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-3 block">
            3. Escolha o horário
          </span>
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  selectedTime === time
                    ? "bg-white text-black border-white"
                    : "border-white/10 text-white/60 hover:border-white/25 hover:bg-white/5"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm button */}
      {selectedConsultant && selectedDate && selectedTime && (
        <div className="animate-fade-in">
          <button onClick={handleConfirm} className="cta-button w-full justify-center">
            CONFIRMAR AGENDAMENTO
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
