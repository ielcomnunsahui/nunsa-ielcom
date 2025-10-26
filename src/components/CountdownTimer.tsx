import { useEffect, useState, useCallback } from "react";
import { Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
// FIX 1: Import the real Button component (assuming a path like shadcn/ui)
import { Button } from "@/components/ui/button";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  title: string;
  stageName: string;
  stageColor: string; // The color class (e.g., text-blue-600)
  linkToId?: string; // Optional prop for anchor link ID
  linkText?: string; // Optional prop for link text
}

const CountdownTimer = ({
  targetDate,
  title,
  stageName,
  stageColor,
  linkToId,
  linkText,
}: CountdownTimerProps) => {
  const calculateTimeLeft = useCallback((): TimeLeft => {
    // Using actual current time for a live countdown
    const difference = +targetDate - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    // Set the initial time immediately
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const isTimeUp =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0; // Derive the background color class from the passed stageColor (e.g., 'text-blue-600' -> 'bg-blue-600')

  const baseColorClass = stageColor.replace("text-", "bg-");
  const finalColorClass = baseColorClass.startsWith("bg-")
    ? baseColorClass
    : "bg-blue-600"; // Status determination

  const StatusIcon = isTimeUp ? CheckCircle : Clock;
  const statusText = isTimeUp ? "Complete" : "Time Remaining";

  const handleLinkClick = () => {
    if (linkToId) {
      document.getElementById(linkToId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in px-2">
      {" "}
      <p className="text-lg sm:text-xl font-medium text-center mb-4 text-muted-foreground px-2">
        {title}{" "}
      </p>
       {/* Main Countdown Card - Uses dynamic color (e.g., Blue) */}{" "}
      <div
        className={`${
          isTimeUp ? "bg-green-600 shadow-green-500/50" : finalColorClass
        } text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-2xl transition-shadow duration-300 hover:shadow-primary/50`}
      >
        {" "}
        <div className="relative z-10">
          {" "}
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-col sm:flex-row gap-4">
             {/* Current Stage Display (Left Side) */}
            {" "}
            <div className="flex items-center space-x-3 sm:space-x-4 text-center sm:text-left">
              {" "}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                {" "}
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                {" "}
              </div>
              {" "}
              <div>
                {" "}
                <h2 className="text-xl sm:text-2xl font-bold mb-1">
                  {isTimeUp ? "Stage Complete" : "Current Stage"}
                </h2>
                {" "}
                <p className="text-base sm:text-lg opacity-90">{stageName}</p>{" "}
              </div>
              {" "}
            </div>
             {/* Countdown or Action Display (Right Side) */}
            {" "}
            <div className="text-center sm:text-right w-full sm:w-auto" aria-live="polite">
             {" "}
              {isTimeUp ? (
                // *** New content when time is up ***
                <div className="flex flex-col items-center sm:items-end">
                  {" "}
                  <p className="text-2xl sm:text-3xl font-bold mb-2">Stage Finished!</p>
                  {" "}
                  {linkToId && linkText && (
                    <Button
                      onClick={handleLinkClick}
                      className={`${
                        isTimeUp
                          ? "bg-white text-green-600 hover:bg-gray-100"
                          : "bg-white text-primary hover:bg-gray-100"
                      } shadow-md gap-2 w-full sm:w-auto`}
                    >
                       {linkText}{" "}
                      <ArrowRight className="w-4 h-4" />{" "}
                    </Button>
                  )}
                  {" "}
                </div>
              ) : (
                // Original Countdown Display
                <>
                {" "}
                  <div className="flex items-center justify-center sm:justify-end space-x-2 mb-2">
                   {" "}
                    <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                   {" "}
                    <span className="font-semibold text-sm sm:text-base">
                      {statusText}{" "}
                    </span>
                   {" "}
                  </div>
                 {" "}
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tabular-nums">
                   {" "}
                    <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center sm:text-left">
                      <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl lg:text-3xl">
                          {String(timeLeft.days).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-75">days</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl lg:text-3xl">
                          {String(timeLeft.hours).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-75">hrs</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl lg:text-3xl">
                          {String(timeLeft.minutes).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-75">min</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl lg:text-3xl">
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-75">sec</span>
                      </div>
                    </div>
                  </div>
                  {" "}
                </>
              )}
              {" "}
            </div>
            {" "}
          </div>
           {/* Status Bar at the bottom */}{" "}
          <div className="flex items-center justify-center sm:justify-start space-x-2 border-t border-white/20 pt-3 sm:pt-4 mt-3 sm:mt-4">
            <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            {" "}
            <span className="font-semibold text-sm sm:text-base text-center sm:text-left">
              {isTimeUp
                ? "Stage Complete"
                : `Ends: ${targetDate.toLocaleDateString()}`}
            </span>
            {" "}
          </div>
          {" "}
        </div>
        {/* Decorative background circles */}{" "}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 opacity-10">
          {" "}
          <div className="w-full h-full bg-white rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 lg:-translate-y-16 lg:translate-x-16" />
        {" "}
        </div>
        {" "}
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 opacity-10">
          {" "}
          <div className="w-full h-full bg-white rounded-full translate-y-4 -translate-x-4 sm:translate-y-6 sm:-translate-x-6 lg:translate-y-8 lg:-translate-x-8" />
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </div>
  );
};

export default CountdownTimer;