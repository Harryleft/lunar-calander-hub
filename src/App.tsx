import React, { useState, useEffect } from 'react';
import { Lunar, Solar } from 'lunar-typescript';

interface DayInfo {
  solarDay: number;
  lunarDay: string;
  isHoliday?: boolean;
  holidayName?: string;
  isWeekend?: boolean;
  isCurrentMonth: boolean;
  lunar?: Lunar;
  month: number;
  year: number;
}

function App() {
  const [currentDate, setCurrentDate] = useState(Solar.fromDate(new Date()));
  const [selectedDate, setSelectedDate] = useState<Solar>(currentDate);
  const [calendarData, setCalendarData] = useState<DayInfo[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  useEffect(() => {
    const generateCalendarData = () => {
      const firstDayOfMonth = Solar.fromYmd(currentDate.getYear(), currentDate.getMonth(), 1);
      let nextMonthYear = currentDate.getYear();
      let nextMonth = currentDate.getMonth() + 1;
      
      if (nextMonth > 12) {
        nextMonth = 1;
        nextMonthYear++;
      }
      
      const nextMonthFirstDay = Solar.fromYmd(nextMonthYear, nextMonth, 1);
      const daysInMonth = nextMonthFirstDay.getJulianDay() - firstDayOfMonth.getJulianDay();
      
      const firstDayToShow = Solar.fromJulianDay(firstDayOfMonth.getJulianDay() - firstDayOfMonth.getWeek());
      
      const days: DayInfo[] = [];
      let currentDay = firstDayToShow;
      
      for (let i = 0; i < 42; i++) {
        const lunar = currentDay.getLunar();
        const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();
        const isWeekend = currentDay.getWeek() === 0 || currentDay.getWeek() === 6;
        
        const dayInfo: DayInfo = {
          solarDay: currentDay.getDay(),
          lunarDay: lunar.getDayInChinese(),
          isWeekend,
          isCurrentMonth,
          lunar,
          isHoliday: lunar.getFestivals().length > 0 || lunar.getJieQi() !== '',
          holidayName: lunar.getFestivals()[0] || lunar.getJieQi(),
          month: currentDay.getMonth(),
          year: currentDay.getYear()
        };
        
        days.push(dayInfo);
        currentDay = Solar.fromJulianDay(currentDay.getJulianDay() + 1);
      }
      
      setCalendarData(days);
    };

    generateCalendarData();
  }, [currentDate]);

  const selectedLunar = selectedDate.getLunar();

  const handlePrevMonth = () => {
    setCurrentDate(Solar.fromYmd(
      currentDate.getMonth() === 1 ? currentDate.getYear() - 1 : currentDate.getYear(),
      currentDate.getMonth() === 1 ? 12 : currentDate.getMonth() - 1,
      1
    ));
  };

  const handleNextMonth = () => {
    setCurrentDate(Solar.fromYmd(
      currentDate.getMonth() === 12 ? currentDate.getYear() + 1 : currentDate.getYear(),
      currentDate.getMonth() === 12 ? 1 : currentDate.getMonth() + 1,
      1
    ));
  };

  const handleDayClick = (day: DayInfo) => {
    setSelectedDate(Solar.fromYmd(
      day.year,
      day.month,
      day.solarDay
    ));
    setIsDetailsOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 flex justify-center items-center sticky top-0 z-20">
        <div className="text-xl font-semibold flex items-center justify-center gap-4">
          <button 
            onClick={handlePrevMonth}
            className="hover:bg-red-500 p-2 rounded-full transition-colors"
          >
            &lt;
          </button>
          <span className="min-w-[120px]">{currentDate.getYear()}年{currentDate.getMonth()}月</span>
          <button 
            onClick={handleNextMonth}
            className="hover:bg-red-500 p-2 rounded-full transition-colors"
          >
            &gt;
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 px-4 py-2 overflow-auto">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 py-2 sticky  bg-white z-10 border-b border-gray-200">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm md:text-base ${
                index === 0 || index === 6 ? 'text-red-600' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {calendarData.map((day, index) => {
            const isSelected = selectedDate.getYear() === day.year &&
                             selectedDate.getMonth() === day.month &&
                             selectedDate.getDay() === day.solarDay;
            
            return (
              <div
                key={index}
                className={`aspect-square p-1 md:p-2 text-center cursor-pointer hover:bg-red-50 transition-colors
                  ${isSelected ? 'bg-red-600 text-white hover:bg-red-500 rounded-lg' : ''}
                  ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                  relative group flex flex-col justify-between`}
                onClick={() => handleDayClick(day)}
              >
                <div className={`text-base md:text-lg font-medium mb-0.5
                  ${day.isWeekend && day.isCurrentMonth ? 'text-red-600' : ''}
                  ${isSelected ? 'text-white' : ''}`}
                >
                  {day.solarDay}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className={`text-[10px] md:text-xs
                    ${isSelected ? 'text-white' : ''}`}>
                    {day.lunarDay}
                  </div>
                  {day.holidayName && (
                    <div className={`text-[8px] md:text-xs mt-0.5
                      ${isSelected ? 'text-white' : 'text-red-600'}`}>
                      {day.holidayName}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details - Bottom Sheet on Mobile */}
      <div className={`fixed inset-x-0 bottom-0 bg-white transform transition-transform duration-300 ease-in-out
        ${isDetailsOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        md:relative md:transform-none
        shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
        md:shadow-none
        rounded-t-3xl md:rounded-none
        z-20`}
      >
        <div className="md:hidden">
          <div 
            className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3 cursor-pointer"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          />
        </div>
        
        <div className="px-4 pb-safe pt-2 md:py-4 space-y-3">
          <div className="text-2xl md:text-3xl text-gray-700 text-center">
            {selectedLunar.getMonthInChinese()}月{selectedLunar.getDayInChinese()}
          </div>
          <div className="text-sm text-gray-500 text-center">
            {selectedLunar.getJieQi() ? selectedLunar.getJieQi() : `${selectedLunar.getYearInGanZhi()}年`}
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              {selectedLunar.getYearInGanZhi()}年 
              {selectedLunar.getMonthInGanZhi()}月 
              {selectedLunar.getDayInGanZhi()}日 
              [属{selectedLunar.getYearShengXiao()}]
            </p>
            <p>
              第{Math.ceil(selectedDate.getDay() / 7)}周 
              周{weekDays[selectedDate.getWeek()]}
            </p>
            <p>
              {selectedLunar.getDayYi().length > 0 && (
                <span className="text-green-600">宜 {selectedLunar.getDayYi().join(' ')}</span>
              )}
            </p>
            <p>
              {selectedLunar.getDayJi().length > 0 && (
                <span className="text-red-600">忌 {selectedLunar.getDayJi().join(' ')}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;