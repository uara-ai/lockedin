"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";

export interface ContributionData {
  date: string;
  count: number;
  level: number;
}

export interface ContributionGraphProps {
  data?: ContributionData[];
  year?: number;
  className?: string;
  showLegend?: boolean;
  showTooltips?: boolean;
  colors?: string[];
  hoverRing?: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Default GitHub-style contribution level colors
const DEFAULT_CONTRIBUTION_COLORS = [
  "bg-gray-100 dark:bg-gray-800", // Level 0 - No contributions
  "bg-green-100 dark:bg-green-800", // Level 1 - Light activity
  "bg-green-300 dark:bg-green-600", // Level 2 - Medium activity
  "bg-green-500 dark:bg-green-400", // Level 3 - High activity
  "bg-green-700 dark:bg-green-300", // Level 4 - Max activity
];

const CONTRIBUTION_LEVELS = [0, 1, 2, 3, 4];

export function ContributionGraph({
  data = [],
  year = new Date().getFullYear(),
  className = "",
  showLegend = true,
  showTooltips = true,
  colors = DEFAULT_CONTRIBUTION_COLORS,
  hoverRing = "hover:ring-green-500/50",
}: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate all days for the year
  const yearData = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const days: ContributionData[] = [];

    // Start from the Sunday of the first week that contains January 1st
    // This ensures December gets proper weeks before January
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    // Generate 53 weeks (GitHub shows 53 weeks)
    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(firstSunday);
        currentDate.setDate(firstSunday.getDate() + week * 7 + day);

        // Include days from the previous year's December if they're in the first week
        const isInRange = currentDate >= startDate && currentDate <= endDate;
        const isPreviousYearDecember =
          currentDate.getFullYear() === year - 1 &&
          currentDate.getMonth() === 11;
        const isNextYearJanuary =
          currentDate.getFullYear() === year + 1 &&
          currentDate.getMonth() === 0;

        if (isInRange || isPreviousYearDecember || isNextYearJanuary) {
          const dateString = currentDate.toISOString().split("T")[0];
          const existingData = data.find((d) => d.date === dateString);

          days.push({
            date: dateString,
            count: existingData?.count || 0,
            level: existingData?.level || 0,
          });
        } else {
          // Add empty day for alignment
          days.push({
            date: "",
            count: 0,
            level: 0,
          });
        }
      }
    }

    return days;
  }, [data, year]);

  // Calculate month headers with colspan
  const monthHeaders = useMemo(() => {
    const headers: { month: string; colspan: number; startWeek: number }[] = [];
    const startDate = new Date(year, 0, 1);
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    let currentMonth = -1;
    let currentYear = -1;
    let monthStartWeek = 0;
    let weekCount = 0;

    for (let week = 0; week < 53; week++) {
      const weekDate = new Date(firstSunday);
      weekDate.setDate(firstSunday.getDate() + week * 7);

      // Use a combined key for month and year to handle December from previous year
      const monthKey = weekDate.getMonth();
      const yearKey = weekDate.getFullYear();

      if (monthKey !== currentMonth || yearKey !== currentYear) {
        if (currentMonth !== -1) {
          // Only show months from the current year, and only show December from previous year
          // if it actually contains days from the current year and has enough weeks to justify a header
          const shouldShowMonth =
            currentYear === year ||
            (currentYear === year - 1 &&
              currentMonth === 11 &&
              startDate.getDay() !== 0 &&
              weekCount >= 2);

          if (shouldShowMonth) {
            headers.push({
              month: MONTHS[currentMonth],
              colspan: weekCount,
              startWeek: monthStartWeek,
            });
          }
        }
        currentMonth = monthKey;
        currentYear = yearKey;
        monthStartWeek = week;
        weekCount = 1;
      } else {
        weekCount++;
      }
    }

    // Add the last month
    if (currentMonth !== -1) {
      const shouldShowMonth =
        currentYear === year ||
        (currentYear === year - 1 &&
          currentMonth === 11 &&
          startDate.getDay() !== 0 &&
          weekCount >= 2);

      if (shouldShowMonth) {
        headers.push({
          month: MONTHS[currentMonth],
          colspan: weekCount,
          startWeek: monthStartWeek,
        });
      }
    }

    return headers;
  }, [year]);

  const handleDayHover = (day: ContributionData, event: React.MouseEvent) => {
    if (showTooltips && day.date) {
      setHoveredDay(day);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleDayLeave = () => {
    setHoveredDay(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getContributionText = (count: number) => {
    if (count === 0) return "No contributions";
    if (count === 1) return "1 contribution";
    return `${count} contributions`;
  };

  return (
    <div className={`contribution-graph ${className}`}>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1 text-xs">
          <caption className="sr-only">Contribution Graph for {year}</caption>

          {/* Month Headers */}
          <thead>
            <tr className="h-3">
              <td className="w-7 min-w-7"></td>
              {monthHeaders.map((header, index) => (
                <td
                  key={index}
                  className="text-foreground relative text-left"
                  colSpan={header.colspan}
                >
                  <span className="absolute top-0 left-1">{header.month}</span>
                </td>
              ))}
            </tr>
          </thead>

          {/* Day Grid */}
          <tbody>
            {Array.from({ length: 7 }, (_, dayIndex) => (
              <tr key={dayIndex} className="h-2.5">
                {/* Day Labels */}
                <td className="text-foreground relative w-7 min-w-7">
                  {dayIndex % 2 === 0 && (
                    <span className="absolute -bottom-0.5 left-0 text-xs">
                      {DAYS[dayIndex]}
                    </span>
                  )}
                </td>

                {/* Day Cells */}
                {Array.from({ length: 53 }, (_, weekIndex) => {
                  const dayData = yearData[weekIndex * 7 + dayIndex];
                  if (!dayData || !dayData.date) {
                    return (
                      <td key={weekIndex} className="h-2.5 w-2.5 p-0">
                        <div className="h-2.5 w-2.5"></div>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={weekIndex}
                      className="h-2.5 w-2.5 cursor-pointer p-0"
                      onMouseEnter={(e) => handleDayHover(dayData, e)}
                      onMouseLeave={handleDayLeave}
                      title={
                        showTooltips
                          ? `${formatDate(dayData.date)}: ${getContributionText(
                              dayData.count
                            )}`
                          : undefined
                      }
                    >
                      <div
                        className={`h-2.5 w-2.5 rounded-sm transition-all ${
                          colors[dayData.level]
                        } hover:ring-2 ${hoverRing} hover:scale-110`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {showTooltips && hoveredDay && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 pointer-events-none fixed z-50 rounded-lg border border-gray-700 dark:border-gray-300 px-3 py-2 text-sm shadow-xl"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
          }}
        >
          <div className="font-semibold">
            {getContributionText(hoveredDay.count)}
          </div>
          <div className="text-white/80 dark:text-gray-700">
            {formatDate(hoveredDay.date)}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="text-foreground/70 mt-4 flex items-center justify-between text-xs">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {CONTRIBUTION_LEVELS.map((level) => (
              <div
                key={level}
                className={`h-3 w-3 rounded-sm ${colors[level]}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      )}
    </div>
  );
}

export default ContributionGraph;
