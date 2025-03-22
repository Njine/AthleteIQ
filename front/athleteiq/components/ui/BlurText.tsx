import { useRef, useEffect, useState, memo } from "react";
import { useSprings, animated, SpringValue } from "@react-spring/web";

interface BlurTextProps {
  text?: string | string[];
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Record<string, string | number>[];
  easing?: (t: number) => number | string;
  onAnimationComplete?: () => void;
}

const BlurText = memo(
  ({
    text = [],
    delay = 200,
    className = "",
    animateBy = "words",
    direction = "top",
    threshold = 0.1,
    rootMargin = "0px",
    animationFrom,
    animationTo,
    easing = "easeOutCubic",
    onAnimationComplete,
  }: BlurTextProps) => {
    const textArray = Array.isArray(text) ? text : [text];
    const processedLines = textArray.map((line) =>
      animateBy === "words" ? line.split(" ") : line.split("")
    );

    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const animatedCount = useRef(0);

    const defaultFrom = direction === "top"
      ? { filter: "blur(10px)", opacity: 0, transform: "translate3d(0,-50px,0)" }
      : { filter: "blur(10px)", opacity: 0, transform: "translate3d(0,50px,0)" };

    const defaultTo = [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        transform: direction === "top" ? "translate3d(0,5px,0)" : "translate3d(0,-5px,0)",
      },
      { filter: "blur(0px)", opacity: 1, transform: "translate3d(0,0,0)" },
    ];

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(ref.current as Element);
          }
        },
        { threshold, rootMargin }
      );

      if (ref.current) observer.observe(ref.current);

      return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const flattenedElements = processedLines.flat();

    const springs = useSprings(
      flattenedElements.length,
      flattenedElements.map((_, i) => ({
        from: animationFrom || defaultFrom,
        to: inView
          ? async (next: (step: Record<string, string | number>) => Promise<void>) => {
              for (const step of animationTo || defaultTo) {
                await next(step);
              }
              animatedCount.current += 1;
              if (animatedCount.current === flattenedElements.length && onAnimationComplete) {
                onAnimationComplete();
              }
            }
          : animationFrom || defaultFrom,
        delay: i * delay,
        config: { easing },
      }))
    );

    return (
      <div ref={ref} className={`blur-text-container ${className}`}>
        {processedLines.map((line, lineIndex) => (
          <div key={lineIndex} className="block mb-2">
            {line.map((element, elementIndex) => {
              const springIndex = processedLines
                .slice(0, lineIndex)
                .reduce((acc, curr) => acc + curr.length, 0) + elementIndex;

              return (
                <animated.span
                  key={`${lineIndex}-${elementIndex}`}
                  className="gradient-text"
                  style={{
                    ...(springs[springIndex] as Record<string, SpringValue<any>>),
                    display: "inline-block",
                    marginRight: animateBy === "words" ? "0.25rem" : "0",
                    willChange: "transform, filter, opacity",
                    fontSize: element === "Hello," ? "4rem" : undefined,
                  }}
                >
                  {element}
                </animated.span>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

BlurText.displayName = "BlurText";

export default BlurText;
