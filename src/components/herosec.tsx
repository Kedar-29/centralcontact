"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { InteractiveHoverButton } from "./ui/interactive-hover-button";
import React, { useMemo } from "react";

// Dynamically import WorldMap named export, disable SSR
const WorldMap = dynamic(
  () => import("@/app/components/ui/world-map").then((mod) => mod.WorldMap),
  { ssr: false }
);

export function HomeSection() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const animatedLetters = useMemo(() => {
    const letters = "Contact Plus".split("");
    return letters.map((letter, idx) => (
      <motion.span
        key={idx}
        className="inline-block"
        initial={prefersReducedMotion ? {} : { x: -10, opacity: 0 }}
        animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: idx * 0.04 }}
      >
        {letter}
      </motion.span>
    ));
  }, [prefersReducedMotion]);

  return (
    <div className="py-40 w-full bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <p className="font-bold text-xl md:text-4xl text-black dark:text-white">
          Central{" "}
          <span className="text-neutral-500 dark:text-neutral-400">
            {animatedLetters}
          </span>
        </p>

        <p className="mt-4 text-sm md:text-lg max-w-2xl mx-auto text-neutral-700 dark:text-neutral-400">
          CentralContact helps you manage applications, dynamic forms, and user
          interactions with ease. Deploy globally distributed contact forms and
          monitor them in real time from a unified dashboard.
        </p>

        <div className="mt-6">
          <InteractiveHoverButton
            onClick={() => router.push("/dashboard")}
            className="text-base px-6 py-2"
            text="Go to Dashboard"
          />
        </div>
      </div>

      <WorldMap
        dots={[
          {
            start: { lat: 64.2008, lng: -149.4937 },
            end: { lat: 34.0522, lng: -118.2437 },
          },
          {
            start: { lat: 64.2008, lng: -149.4937 },
            end: { lat: -15.7975, lng: -47.8919 },
          },
          {
            start: { lat: -15.7975, lng: -47.8919 },
            end: { lat: 38.7223, lng: -9.1393 },
          },
          {
            start: { lat: 51.5074, lng: -0.1278 },
            end: { lat: 28.6139, lng: 77.209 },
          },
          {
            start: { lat: 28.6139, lng: 77.209 },
            end: { lat: 43.1332, lng: 131.9113 },
          },
          {
            start: { lat: 28.6139, lng: 77.209 },
            end: { lat: -1.2921, lng: 36.8219 },
          },
          {
            start: { lat: 34.0522, lng: -118.2437 },
            end: { lat: 37.7749, lng: -122.4194 },
          },
          {
            start: { lat: 37.7749, lng: -122.4194 },
            end: { lat: 51.5074, lng: -0.1278 },
          },
          {
            start: { lat: 35.6895, lng: 139.6917 },
            end: { lat: -33.8688, lng: 151.2093 },
          },
        ]}
      />
    </div>
  );
}
