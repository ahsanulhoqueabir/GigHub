import { Modal } from "@/components/ui/Modal";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface DatePickerProps {
  label?: string;
  value?: string; // Expecting "YYYY-MM-DD" format
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  error?: string | null;
  minDate?: Date;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select deadline date",
  error,
  minDate = new Date(),
}: DatePickerProps) {
  const [visible, setVisible] = useState(false);

  // Calendar navigation state
  const initialDate = value ? new Date(value) : new Date();
  const validInitial = isNaN(initialDate.getTime()) ? new Date() : initialDate;
  const [currentYear, setCurrentYear] = useState(validInitial.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(validInitial.getMonth());

  const handleOpen = () => {
    const d = value ? new Date(value) : new Date();
    const valid = isNaN(d.getTime()) ? new Date() : d;
    setCurrentYear(valid.getFullYear());
    setCurrentMonth(valid.getMonth());
    setVisible(true);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectPresetDays = (daysFromNow: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    onChange(toYMD(target));
    setVisible(false);
  };

  // Build calendar matrix for current month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const todayStr = toYMD(new Date());
  const minStr = minDate ? toYMD(minDate) : "";

  const calendarDays: Array<{
    day: number;
    dateStr: string;
    isPast: boolean;
  } | null> = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isPast = minStr ? dateStr < minStr : false;
    calendarDays.push({ day: d, dateStr, isPast });
  }

  return (
    <View>
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      ) : null}

      <View className="relative">
        <Pressable
          onPress={handleOpen}
          className={`flex-row items-center justify-between rounded-xl border px-4 py-3 bg-white dark:bg-gray-900 ${
            error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <View className="flex-row items-center gap-2.5">
            <Ionicons
              name="calendar-outline"
              size={18}
              color={value ? COLORS.primary : "#9CA3AF"}
            />
            <Text
              className={`text-base ${
                value
                  ? "font-medium text-gray-900 dark:text-gray-100"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {value ? formatDateDisplay(value) : placeholder}
            </Text>
          </View>

          {value ? (
            <Pressable
              hitSlop={8}
              onPress={() => onChange(undefined)}
              className="p-1"
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : (
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          )}
        </Pressable>
      </View>

      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}

      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title={label ?? "Select Date"}
      >
        <View className="gap-4 py-2">
          {/* Quick Presets */}
          <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Quick Presets
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => selectPresetDays(1)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800 active:opacity-70"
            >
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Tomorrow
              </Text>
            </Pressable>
            <Pressable
              onPress={() => selectPresetDays(3)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800 active:opacity-70"
            >
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                In 3 Days
              </Text>
            </Pressable>
            <Pressable
              onPress={() => selectPresetDays(7)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800 active:opacity-70"
            >
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                In 1 Week
              </Text>
            </Pressable>
            <Pressable
              onPress={() => selectPresetDays(30)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800 active:opacity-70"
            >
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                In 1 Month
              </Text>
            </Pressable>
          </View>

          {/* Month Navigation */}
          <View className="flex-row items-center justify-between pt-2">
            <Pressable
              onPress={handlePrevMonth}
              className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Ionicons name="chevron-back" size={16} color="#4B5563" />
            </Pressable>
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            <Pressable
              onPress={handleNextMonth}
              className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </Pressable>
          </View>

          {/* Weekday Headers */}
          <View className="flex-row justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
            {WEEK_DAYS.map((wd) => (
              <Text
                key={wd}
                className="w-10 text-center text-xs font-semibold text-gray-400"
              >
                {wd}
              </Text>
            ))}
          </View>

          {/* Calendar Day Grid */}
          <View className="flex-row flex-wrap">
            {calendarDays.map((item, idx) => {
              if (!item) {
                return (
                  <View key={`empty-${idx}`} className="h-10 w-[14.28%]" />
                );
              }

              const isSelected = value === item.dateStr;
              const isToday = todayStr === item.dateStr;

              return (
                <Pressable
                  key={item.dateStr}
                  disabled={item.isPast}
                  onPress={() => {
                    onChange(item.dateStr);
                    setVisible(false);
                  }}
                  className="h-10 w-[14.28%] items-center justify-center"
                >
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-primary"
                        : isToday
                          ? "border border-primary"
                          : ""
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected
                          ? "text-white"
                          : item.isPast
                            ? "text-gray-300 dark:text-gray-700"
                            : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {item.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
