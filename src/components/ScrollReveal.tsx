"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade";
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  distance?: number; // pixels
  className?: string;
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 32,
  className = "",
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  // Compute translation transform
  const getTransform = () => {
    if (isVisible) return "none";
    switch (direction) {
      case "up":
        return `translateY(${distance}px)`;
      case "down":
        return `translateY(-${distance}px)`;
      case "left":
        return `translateX(${distance}px)`;
      case "right":
        return `translateX(-${distance}px)`;
      case "fade":
      default:
        return "none";
    }
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: isVisible ? "blur(0px)" : "blur(4px)",
        transitionProperty: "opacity, transform, filter",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // smooth spring ease
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}
