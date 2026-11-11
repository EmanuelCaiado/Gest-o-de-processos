import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Users2,
  PackageCheck,
  Send,
  CheckSquare,
  Clock,
  User,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CalendarEventItem } from '../utils/metrics';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    calendarEvents,
    clients,
    updateCalendarEvent,
    updateTask,
    setIsNewEventModalOpen,
    setSelectedTaskId,
  } = useData();

  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'dia'>('mes');

  // Month navigation: November 2026 as base
  const [currentDate, setCurrentDate] = useState(new Date('2026-11-11T12:00:00Z'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 10 is November

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'mes') next.setMonth(month - 1);
    else if (viewMode === 'semana') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'mes') next.setMonth(month + 1);
    else if (viewMode === 'semana') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-11-11T12:00:00Z'));
  };

  // Combine events and tasks with due dates into a single unified event stream
  const allEvents: {
    id: string;
    title: string;
    clientName: string;
    type: 'gravacao' | 'reuniao' | 'entrega' | 'publicacao' | 'tarefa';
    date: string;
    time: string;
    responsibleName: string;
    isTask: boolean;
    taskId?: string;
    originalEvent?: CalendarEventItem;
    originalTask?: (typeof tasks)[number];
  }[] = [
    ...calendarEvents.map((evt) => ({
      id: evt.id,
      title: evt.title,
      clientName: evt.clientName || 'Geral',
      type: evt.type,
      date: evt.date,
      time: evt.startTime || '',
      responsibleName: evt.responsibleName,
      isTask: false,
      taskId: undefined,
      originalEvent: evt,
      originalTask: undefined,
    })),
    ...tasks
      .filter((t) => t.dueDate && t.status !== 'concluida')
      .map((t) => ({
        id: `task_evt_${t.id}`,
        title: `[Tarefa] ${t.title}`,
        clientName: t.clientName,
        type: 'tarefa' as const,
        date: t.dueDate,
        time: 'Prazo',
        responsibleName: t.responsibleName,
        isTask: true,
        taskId: t.id,
        originalEvent: undefined,
        originalTask: t,
      })),
  ];

  // Helper for Month View days grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter((e) => e.date === dateStr);
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'gravacao':
        return 'bg-[#3B1020] text-white border-[#3B1020]';
      case 'reuniao':
        return 'bg-blue-600 text-white border-blue-600';
      case 'entrega':
        return 'bg-emerald-600 text-white border-emerald-600';
      case 'publicacao':
        return 'bg-amber-600 text-white border-amber-600';
      default:
        return 'bg-[#F4E9ED] text-[#651D32] border-[#E8DFE3]';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-[#EFE8EB] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation & Month Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-[#EFE8EB] hover:bg-[#F8F8F8] text-[#777777] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg border border-[#EFE8EB] hover:bg-[#F8F8F8] text-xs font-semibold text-[#202020] cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-[#EFE8EB] hover:bg-[#F8F8F8] text-[#777777] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-extrabold text-[#202020] tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <span className="text-[11px] font-medium text-[#777777] bg-[#F8F8F8] px-2 py-0.5 rounded">
            Fuso: America/Sao_Paulo
          </span>
        </div>

        {/* View Mode & Add Event */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#F8F8F8] p-1 rounded-lg border border-[#EFE8EB] flex items-center space-x-1 text-xs">
            {(['mes', 'semana', 'dia'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded font-medium capitalize transition cursor-pointer ${
                  viewMode === m ? 'bg-white text-[#202020] shadow-xs' : 'text-[#777777]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewEventModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#651D32] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#521627] transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agendar Evento</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#777777] px-1">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B1020]" />
          <span>Gravação</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Reunião</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Entrega</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <span>Publicação</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#651D32]" />
          <span>Tarefa Operacional</span>
        </span>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-xl border border-[#EFE8EB] shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-[#EFE8EB] bg-[#FDFBFC] text-center text-xs font-bold text-[#777777] uppercase py-2.5">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#EFE8EB]">
            {/* Blank slots */}
            {blanksArray.map((_, i) => (
              <div key={`blank_${i}`} className="min-h-[115px] bg-[#FAFAFA]/50 p-2" />
            ))}

            {/* Actual Month Days */}
            {daysArray.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday =
                year === 2026 && month === 10 && day === 11; // 11 de Novembro

              return (
                <div
                  key={`day_${day}`}
                  className={`min-h-[115px] p-2 transition hover:bg-[#FDFBFC] flex flex-col justify-between ${
                    isToday ? 'bg-[#F4E9ED]/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#651D32] text-white'
                          : 'text-[#202020]'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-[#777777] font-medium">
                        {dayEvents.length} {dayEvents.length === 1 ? 'item' : 'itens'}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          if (evt.isTask && evt.taskId) {
                            setSelectedTaskId(evt.taskId);
                          }
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-semibold truncate border transition cursor-pointer shadow-2xs ${getEventBadgeClass(
                          evt.type
                        )}`}
                        title={`${evt.title} (${evt.clientName} - Resp: ${evt.responsibleName})`}
                      >
                        <div className="truncate font-semibold">{evt.title}</div>
                        <div className="text-[9px] opacity-85 truncate">
                          {evt.clientName} {evt.time ? `• ${evt.time}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEMANA / DIA VIEW (Agenda List) */}
      {(viewMode === 'semana' || viewMode === 'dia') && (
        <div className="bg-white rounded-xl border border-[#EFE8EB] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#202020] border-b border-[#F4E9ED] pb-3">
            Atividades Agendadas da {viewMode === 'semana' ? 'Semana' : 'Data'}
          </h3>

          <div className="space-y-3">
            {allEvents
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl border border-[#EFE8EB] hover:border-[#651D32]/40 transition flex items-center justify-between bg-white shadow-xs"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getEventBadgeClass(
                        evt.type
                      )}`}
                    >
                      {evt.type === 'gravacao' && <Video className="w-5 h-5" />}
                      {evt.type === 'reuniao' && <Users2 className="w-5 h-5" />}
                      {evt.type === 'entrega' && <PackageCheck className="w-5 h-5" />}
                      {evt.type === 'publicacao' && <Send className="w-5 h-5" />}
                      {evt.type === 'tarefa' && <CheckSquare className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#651D32]">
                          {evt.type}
                        </span>
                        <span>•</span>
                        <span className="text-xs font-semibold text-[#202020]">{evt.clientName}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#202020] mt-0.5">{evt.title}</h4>
                      <p className="text-xs text-[#777777] mt-0.5">
                        Responsável: {evt.responsibleName} {evt.time ? `• Horário: ${evt.time}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="date"
                      value={evt.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        if (evt.isTask && evt.originalTask) {
                          updateTask({ ...evt.originalTask, dueDate: newDate });
                        } else if (evt.originalEvent) {
                          updateCalendarEvent({ ...evt.originalEvent, date: newDate });
                        }
                      }}
                      className="text-xs border border-[#EFE8EB] rounded px-2 py-1 bg-[#F8F8F8] font-medium text-[#202020] cursor-pointer"
                    />
                  </div>
                </div>
              ))}

            {allEvents.length === 0 && (
              <div className="text-center py-10 bg-[#FAF8F9] rounded-xl border border-dashed border-[#E8DFE3] text-xs text-[#777777] space-y-2">
                <CalendarIcon className="w-8 h-8 text-[#651D32] mx-auto opacity-60" />
                <p className="font-medium text-[#202020]">Nenhum evento ou tarefa agendada para o período</p>
                <p className="text-[11px] text-[#777777]">Use o botão "+ Agendar Evento" para agendar gravações, reuniões, entregas ou prazos operacionais.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
