import { useEffect, useState } from "react";

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelative(date) {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  const ranges = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let value = seconds;
  for (const [limit, unit] of ranges) {
    if (Math.abs(value) < limit) return formatter.format(Math.round(value), unit);
    value /= limit;
  }
  return "";
}

export default function RelativeTime({ date }) {
  const [label, setLabel] = useState(() => formatRelative(date));

  useEffect(() => {
    setLabel(formatRelative(date));
    const timer = setInterval(() => setLabel(formatRelative(date)), 60000);
    return () => clearInterval(timer);
  }, [date]);

  return <time dateTime={new Date(date).toISOString()}>{label}</time>;
}
