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
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {" "}
      <p className="text-xl font-medium text-center mb-4 text-muted-foreground">
        {title}{" "}
      </p>
       {/* Main Countdown Card - Uses dynamic color (e.g., Blue) */}{" "}
      <div
        className={`${
          isTimeUp ? "bg-green-600 shadow-green-500/50" : finalColorClass
        } text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl transition-shadow duration-300 hover:shadow-primary/50`}
      >
        {" "}
        <div className="relative z-10">
          {" "}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
             {/* Current Stage Display (Left Side) */}
            {" "}
            <div className="flex items-center space-x-4">
              {" "}
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                {" "}
                <Clock className="h-6 w-6 text-white" aria-hidden="true" />
                {" "}
              </div>
              {" "}
              <div>
                {" "}
                <h2 className="text-2xl font-bold mb-1">
                  {isTimeUp ? "Stage Complete" : "Current Stage"}
                </h2>
                {" "}
                <p className="text-lg opacity-90">{stageName}</p>{" "}
              </div>
              {" "}
            </div>
             {/* Countdown or Action Display (Right Side) */}
            {" "}
            <div className="text-right" aria-live="polite">
             {" "}
              {isTimeUp ? (
                // *** New content when time is up ***
                <div className="flex flex-col items-end">
                  {" "}
                  <p className="text-3xl font-bold mb-2">Stage Finished!</p>
                  {" "}
                  {linkToId && linkText && (
                    <Button
                      onClick={handleLinkClick}
                      className={`${
                        isTimeUp
                          ? "bg-white text-green-600 hover:bg-gray-100"
                          : "bg-white text-primary hover:bg-gray-100"
                      } shadow-md gap-2`}
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
                  <div className="flex items-center space-x-2 mb-2 justify-end">
                   {" "}
                    <StatusIcon className="h-5 w-5" aria-hidden="true" />
                   {" "}
                    <span className="font-semibold">
                      {statusText}{" "}
                    </span>
                   {" "}
                  </div>
                 {" "}
                  <div className="text-3xl font-bold tabular-nums sm:text-4xl">
                   {" "}
                    <span className="inline-block w-[3.2rem] text-left">
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                    d {" "}
                    <span className="inline-block w-[3.2rem] text-left">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    h {" "}
                    <span className="inline-block w-[3.2rem] text-left">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    m {" "}
                    <span className="inline-block w-[3.2rem] text-left">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    s {" "}
                  </div>
                  {" "}
                </>
              )}
              {" "}
            </div>
            {" "}
          </div>
           {/* Status Bar at the bottom */}{" "}
          <div className="flex items-center space-x-2 border-t border-white/20 pt-4 mt-4">
            <StatusIcon className="h-5 w-5" aria-hidden="true" />
            {" "}
            <span className="font-semibold">
              {isTimeUp
                ? "Stage Complete"
                : `Ends: ${targetDate.toLocaleString()}`}
            </span>
            {" "}
          </div>
          {" "}
        </div>
        {/* Decorative background circles */}{" "}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          {" "}
          <div className="w-full h-full bg-white rounded-full -translate-y-16 translate-x-16" />
        {" "}
        </div>
        {" "}
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
          {" "}
          <div className="w-full h-full bg-white rounded-full translate-y-8 -translate-x-8" />
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </div>
  );
};

export default CountdownTimer;
