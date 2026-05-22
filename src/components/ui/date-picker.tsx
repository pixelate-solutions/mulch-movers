"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDisplayDate, parseDateValue } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  availableDates?: string[];
  placeholder?: string;
  minDate?: string;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function toDate(value: string) {
  if (!value) {
    return new Date();
  }

  return parseDateValue(value);
}

function toValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function DatePicker({
  value,
  onChange,
  availableDates,
  placeholder = "Pick a date",
  minDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(() => toDate(value));
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({
    left: 0,
    top: 0,
  });
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );
  const days = getCalendarDays(monthDate);
  const hasRestrictedDates = Boolean(availableDates?.length);

  function moveMonth(direction: -1 | 1) {
    setMonthDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function updateCalendarPosition() {
      const rect = wrapperRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setCalendarPosition({
        left: Math.min(rect.left, window.innerWidth - 336),
        top: rect.bottom + 8,
      });
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        wrapperRef.current?.contains(event.target as Node) ||
        calendarRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      setIsOpen(false);
    }

    updateCalendarPosition();
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", updateCalendarPosition);
    window.addEventListener("scroll", updateCalendarPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", updateCalendarPosition);
      window.removeEventListener("scroll", updateCalendarPosition, true);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full justify-start rounded-2xl bg-white/80 px-4 text-left text-base font-semibold"
        onClick={() => setIsOpen((current) => !current)}
      >
        <CalendarDays className="size-4 text-emerald-700" />
        {value ? formatDisplayDate(value) : placeholder}
      </Button>
      {isOpen &&
        createPortal(
          <div
            ref={calendarRef}
            className="fixed z-[9999] w-80 rounded-3xl border border-emerald-900/10 bg-white p-4 shadow-2xl shadow-emerald-950/15"
            style={{
              left: calendarPosition.left,
              top: calendarPosition.top,
            }}
          >
          <div className="mb-4 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <p className="font-black text-emerald-950">
              {monthFormatter.format(monthDate)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-emerald-950/45">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((date) => {
              const dateValue = toValue(date);
              const isCurrentMonth = date.getMonth() === monthDate.getMonth();
              const isSelected = dateValue === value;
              const isDisabled =
                (hasRestrictedDates && !availableDateSet.has(dateValue)) ||
                (minDate !== undefined && dateValue <= minDate);

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(dateValue);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition",
                    isCurrentMonth ? "text-emerald-950" : "text-emerald-950/25",
                    isSelected && "bg-emerald-600 text-white",
                    !isSelected &&
                      !isDisabled &&
                      "hover:cursor-pointer hover:bg-emerald-50",
                    isDisabled && "cursor-not-allowed opacity-25",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
