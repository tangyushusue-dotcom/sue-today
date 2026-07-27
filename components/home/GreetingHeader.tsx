"use client";

import { useEffect, useState } from "react";
import { DAILY_QUOTES } from "@/lib/quotes";
import { formatDateLabel, getGreeting } from "@/lib/time";

export function GreetingHeader() {
  const [dateLabel, setDateLabel] = useState("");
  const [greeting, setGreeting] = useState("你好");
  const [quote, setQuote] = useState(DAILY_QUOTES[0]);
  const [qi, setQi] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const now = new Date();
    setDateLabel(formatDateLabel(now));
    setGreeting(getGreeting(now.getHours()));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQi((p) => (p + 1) % DAILY_QUOTES.length);
        setQuote(DAILY_QUOTES[(qi + 1) % DAILY_QUOTES.length]);
        setFade(true);
      }, 600);
    }, 6000);
    return () => clearInterval(id);
  }, [qi]);

  return (
    <section className="mt-10 sm:mt-14">
      <p className="text-sm tracking-wide text-muted">{dateLabel || "今天"}</p>
      <h1 className="mt-2 font-serif text-3xl font-medium leading-snug sm:text-4xl">
        {greeting}，今天也想好好照顾自己呀
      </h1>
      <p
        className="quote-fade mt-4 max-w-xl font-serif text-base italic leading-relaxed text-terracotta"
        style={{ opacity: fade ? 1 : 0 }}
      >
        “{quote}”
      </p>
    </section>
  );
}
