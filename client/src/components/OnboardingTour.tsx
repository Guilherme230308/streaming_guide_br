import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Tv, ListVideo, Bell, BarChart3, ChevronRight, ChevronLeft, X, Sparkles, Film, SlidersHorizontal } from "lucide-react";

const TOUR_COMPLETED_KEY = "onboarding_tour_completed";

interface TourStep {
  selector: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  /** If true, only highlight the first visible child or a small portion of the element */
  highlightFirstChild?: boolean;
}

const tourSteps: TourStep[] = [
  {
    selector: "body",
    icon: <Sparkles className="h-6 w-6" />,
    title: "Bem-vindo ao Stream Radar!",
    description: "Descubra onde assistir seus filmes e séries favoritos no Brasil. Vamos te mostrar as principais funcionalidades em poucos segundos.",
    side: "bottom",
  },
  {
    selector: "[data-tour='search']",
    icon: <Search className="h-6 w-6" />,
    title: "Busca Inteligente",
    description: "Digite o nome de qualquer filme ou série. O autocomplete sugere resultados em tempo real enquanto você digita!",
    side: "bottom",
  },
  {
    selector: "[data-tour='filters']",
    icon: <SlidersHorizontal className="h-6 w-6" />,
    title: "Filtros Avançados",
    description: "Use os filtros para refinar sua busca por gênero, ano, nota e streaming. Encontre exatamente o que procura!",
    side: "bottom",
  },
  {
    selector: "[data-tour='lists']",
    icon: <ListVideo className="h-6 w-6" />,
    title: "Listas Personalizadas",
    description: "Organize filmes e séries em listas customizadas: \"Assistir Depois\", \"Favoritos\", \"Maratona de Terror\" — como preferir!",
    side: "bottom",
  },
  {
    selector: "[data-tour='alerts']",
    icon: <Bell className="h-6 w-6" />,
    title: "Alertas de Disponibilidade",
    description: "Receba notificações quando um filme ou série chegar nos streamings que você assina. Nunca mais perca um lançamento!",
    side: "bottom",
  },
  {
    selector: "[data-tour='trending-movies']",
    icon: <Film className="h-6 w-6" />,
    title: "Filmes e Séries em Alta",
    description: "Veja o que está bombando no momento! Navegue pelos filmes e séries mais populares e descubra onde assistir cada um.",
    side: "top",
    highlightFirstChild: true,
  },
  {
    selector: "[data-tour='menu']",
    icon: <Tv className="h-6 w-6" />,
    title: "Menu Completo",
    description: "Acesse todas as funcionalidades: Gêneros, Histórico, Preços dos Streamings, Análise de Assinaturas e muito mais!",
    side: "bottom",
  },
  {
    selector: "body",
    icon: <Sparkles className="h-6 w-6" />,
    title: "Tudo pronto! 🎬",
    description: "Agora você conhece o Stream Radar. Comece buscando um filme ou série e descubra onde assistir no Brasil!",
    side: "bottom",
  },
];

function getHighlightRect(el: Element, step: TourStep): DOMRect {
  // For large sections, highlight just the heading area (first ~120px) instead of the whole section
  if (step.highlightFirstChild) {
    const heading = el.querySelector("h2, h3, .flex.items-center");
    if (heading) {
      return heading.getBoundingClientRect();
    }
    // Fallback: create a virtual rect for just the top portion
    const fullRect = el.getBoundingClientRect();
    const clampedHeight = Math.min(fullRect.height, 120);
    return new DOMRect(fullRect.x, fullRect.y, fullRect.width, clampedHeight);
  }
  return el.getBoundingClientRect();
}

function TourOverlay({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onClose,
}: {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowDirection, setArrowDirection] = useState<"up" | "down">("up");
  const [isAnimating, setIsAnimating] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isCentered = step.selector === "body";
  const positionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const positionPopover = useCallback((el?: Element | null) => {
    if (isCentered || !el) {
      setHighlightStyle({ display: "none" });
      setPopoverStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      });
      setArrowStyle({ display: "none" });
      return;
    }

    const rect = getHighlightRect(el, step);
    const padding = 8;

    // Highlight around the element
    setHighlightStyle({
      position: "fixed",
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      borderRadius: "12px",
      zIndex: 10001,
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
      pointerEvents: "none",
      transition: "all 0.3s ease",
    });

    // Popover positioning
    const popoverWidth = Math.min(380, window.innerWidth - 32);
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const preferBelow = spaceBelow > 220 || spaceBelow > spaceAbove;

    let top: number;
    if (preferBelow) {
      top = rect.bottom + padding + 16;
      setArrowDirection("up");
    } else {
      top = rect.top - padding - 16;
      setArrowDirection("down");
    }

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));

    if (preferBelow) {
      setPopoverStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        zIndex: 10002,
        transition: "all 0.3s ease",
      });
    } else {
      setPopoverStyle({
        position: "fixed",
        bottom: `${viewportHeight - top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        zIndex: 10002,
        transition: "all 0.3s ease",
      });
    }

    // Arrow pointing to element
    const arrowLeft = rect.left + rect.width / 2 - left - 8;
    if (preferBelow) {
      setArrowStyle({
        position: "absolute",
        top: "-8px",
        left: `${Math.max(16, Math.min(arrowLeft, popoverWidth - 32))}px`,
      });
    } else {
      setArrowStyle({
        position: "absolute",
        bottom: "-8px",
        left: `${Math.max(16, Math.min(arrowLeft, popoverWidth - 32))}px`,
      });
    }
  }, [step, isCentered]);

  useEffect(() => {
    // Clear any pending timeout
    if (positionTimeoutRef.current) {
      clearTimeout(positionTimeoutRef.current);
    }

    if (isCentered) {
      positionPopover();
      return;
    }

    const el = document.querySelector(step.selector);
    if (!el) {
      // Element not found — show centered fallback
      positionPopover();
      return;
    }

    // Check if element is in viewport
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top >= -100 && rect.top <= window.innerHeight - 100;

    if (!isInViewport) {
      // Need to scroll — mark as scrolling to prevent accidental close
      setIsScrolling(true);
      
      // Scroll the element into view
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Wait for scroll to complete, then position the popover
      positionTimeoutRef.current = setTimeout(() => {
        positionPopover(el);
        setIsScrolling(false);
      }, 600);
    } else {
      positionPopover(el);
    }

    // Also recalculate on scroll (in case user scrolls during tour)
    const handleScroll = () => {
      const currentEl = document.querySelector(step.selector);
      if (currentEl) {
        positionPopover(currentEl);
      }
    };

    // Debounced scroll handler
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", debouncedScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      clearTimeout(scrollTimeout);
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
    };
  }, [step, isCentered, positionPopover]);

  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "Enter") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Prevent backdrop click from closing during scroll animation
  const handleBackdropClick = useCallback(() => {
    if (!isScrolling) {
      onClose();
    }
  }, [isScrolling, onClose]);

  return createPortal(
    <div className="tour-overlay-root" style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: isCentered ? "rgba(0, 0, 0, 0.85)" : "transparent",
          transition: "background 0.3s ease",
        }}
      />

      {/* Highlight cutout */}
      {!isCentered && <div style={highlightStyle} />}

      {/* Popover */}
      <div
        style={{
          ...popoverStyle,
          opacity: isAnimating || isScrolling ? 0 : 1,
          transform: isCentered
            ? `translate(-50%, -50%) scale(${isAnimating ? 0.95 : 1})`
            : `scale(${isAnimating || isScrolling ? 0.95 : 1})`,
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        {/* Arrow */}
        {!isCentered && arrowStyle.display !== "none" && (
          <div style={arrowStyle}>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                ...(arrowDirection === "up"
                  ? { borderBottom: "10px solid rgba(15, 35, 55, 0.98)" }
                  : { borderTop: "10px solid rgba(15, 35, 55, 0.98)" }),
              }}
            />
          </div>
        )}

        {/* Card */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(15, 35, 55, 0.98) 0%, rgba(10, 25, 45, 0.98) 50%, rgba(15, 30, 50, 0.98) 100%)",
            backdropFilter: "blur(24px)",
            borderRadius: "20px",
            border: "1px solid rgba(0, 200, 200, 0.2)",
            boxShadow: "0 0 60px rgba(0, 180, 200, 0.12), 0 25px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            overflow: "hidden",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          {/* Progress bar */}
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", width: "100%" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00b4d8, #0ef6cc, #00b4d8)",
                backgroundSize: "200% 100%",
                borderRadius: "0 2px 2px 0",
                transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* Content */}
          <div style={{ padding: "28px 24px 24px" }}>
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "6px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                display: "flex",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon + Title */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #00b4d8 0%, #0ef6cc 100%)",
                  borderRadius: "14px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0a1628",
                  flexShrink: 0,
                  boxShadow: "0 4px 20px rgba(0, 180, 200, 0.3)",
                }}
              >
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.title}
                </h3>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(14, 246, 204, 0.6)",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  Passo {currentStep + 1} de {totalSteps}
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                margin: "0 0 22px 0",
                fontSize: "14.5px",
                lineHeight: 1.7,
                color: "rgba(255, 255, 255, 0.72)",
                letterSpacing: "0.01em",
              }}
            >
              {step.description}
            </p>

            {/* Step dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "22px",
              }}
            >
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentStep ? "24px" : "7px",
                    height: "7px",
                    borderRadius: "4px",
                    background:
                      i === currentStep
                        ? "linear-gradient(90deg, #00b4d8, #0ef6cc)"
                        : i < currentStep
                          ? "rgba(14, 246, 204, 0.35)"
                          : "rgba(255, 255, 255, 0.12)",
                    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
              {isFirstStep ? (
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  Pular tour
                </button>
              ) : (
                <button
                  onClick={onPrev}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
              )}

              <button
                onClick={isLastStep ? onClose : onNext}
                style={{
                  flex: 1.5,
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #00b4d8 0%, #0ef6cc 100%)",
                  color: "#0a1628",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  boxShadow: "0 4px 20px rgba(0, 180, 200, 0.25)",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 180, 200, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 180, 200, 0.25)";
                }}
              >
                {isLastStep ? "Começar a explorar!" : "Próximo"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (tourCompleted === "true") return;

    const timer = setTimeout(() => {
      setShowTour(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const closeTour = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setShowTour(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      closeTour();
    }
  }, [currentStep, closeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const restartTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setCurrentStep(0);
    setShowTour(true);
  }, []);

  const TourComponent = showTour ? (
    <TourOverlay
      step={tourSteps[currentStep]}
      currentStep={currentStep}
      totalSteps={tourSteps.length}
      onNext={nextStep}
      onPrev={prevStep}
      onClose={closeTour}
    />
  ) : null;

  return { restartTour, TourComponent };
}

export function resetOnboardingTour() {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
}
