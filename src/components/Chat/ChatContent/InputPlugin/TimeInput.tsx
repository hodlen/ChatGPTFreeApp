import styled from "@emotion/styled";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";

const loadTimeFromSessionStorage = () => {
  const item = sessionStorage.getItem("input-time");
  return item ? new Date(parseInt(item)) : undefined;
};
const saveTimeToSessionStorage = (time: Date) =>
  sessionStorage.setItem("input-time", time.valueOf().toString());

export const useTimeInputPlugin = () => {
  const timeRef = useRef(loadTimeFromSessionStorage() ?? new Date());
  const DateTimeInput = useCallback(() => {
    const hours = timeRef.current.getHours();
    const minutes = timeRef.current.getMinutes();
    const onUpdate = (updatedTime: { hours: number; minutes: number }) => {
      timeRef.current.setHours(updatedTime.hours);
      timeRef.current.setMinutes(updatedTime.minutes);
      saveTimeToSessionStorage(timeRef.current);
    };
    return (
      <TimeInput initMinutes={minutes} initHours={hours} onUpdate={onUpdate} />
    );
  }, []);
  return {
    TimeInput: DateTimeInput,
    formatTime: () => formatTimeInDay(timeRef.current),
  };
};

const TimeInput: React.FC<{
  initHours?: number;
  initMinutes?: number;
  onUpdate: (time: { hours: number; minutes: number }) => void;
}> = ({ initHours, initMinutes, onUpdate }) => {
  const [hours, setHoursImpl] = useState(initHours ?? 0);
  const [minutes, setMinutesImpl] = useState(initMinutes ?? 0);
  const setHours = (hours: number) => {
    setHoursImpl(hours);
    onUpdate({ hours, minutes });
  };
  const setMinutes = (minutes: number) => {
    setMinutesImpl(minutes);
    onUpdate({ hours, minutes });
  };

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newHours = parseInt(event.target.value, 10);
    if (isNaN(newHours) || newHours < 0 || newHours > 23) {
      return;
    }
    setHours(newHours);
  };

  const handleMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(event.target.value, 10);
    if (isNaN(newMinutes) || newMinutes < 0 || newMinutes > 59) {
      return;
    }
    setMinutes(newMinutes);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowUp": {
        event.preventDefault();
        if (event.currentTarget.name === "hours") {
          const newHours = (hours + 1) % 24;
          setHours(newHours);
        } else {
          const newMinutes = (minutes + 1) % 60;
          setMinutes(newMinutes);
        }
        break;
      }
      case "ArrowDown": {
        event.preventDefault();
        if (event.currentTarget.name === "hours") {
          const newHours = (hours + 23) % 24;
          setHours(newHours);
        } else {
          const newMinutes = (minutes + 59) % 60;
          setMinutes(newMinutes);
        }
        break;
      }
    }
  };

  return (
    <div className="flex mx-1">
      <ClearNumberInput
        type="number"
        name="hours"
        min="0"
        max="23"
        value={hours.toString().padStart(2, "0")}
        onChange={handleHoursChange}
        onKeyDown={handleKeyDown}
      />
      <span className="mx-1">:</span>
      <ClearNumberInput
        type="number"
        name="minutes"
        min="0"
        max="59"
        value={minutes.toString().padStart(2, "0")}
        onChange={handleMinutesChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

const ClearNumberInput = styled.input`
  background: transparent;
  text-align: right;
  & {
    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

const formatTimeInDay = (time: Date) =>
  Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(time);
