import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TutorialStep[];
  language?: 'en' | 'af';
}

export function TutorialGuide({ isOpen, onClose, onComplete, steps, language = 'en' }: TutorialGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const labels = language === 'af' ? {
    skip: 'Slaan oor',
    next: 'Volgende',
    previous: 'Vorige', 
    finish: 'Voltooi',
    stepOf: 'Stap {current} van {total}',
    welcome: 'Welkom by Storm POS!',
    getStarted: 'Kom ons begin jou reis met ons kragtige POS-stelsel.',
  } : {
    skip: 'Skip',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    stepOf: 'Step {current} of {total}',
    welcome: 'Welcome to Storm POS!',
    getStarted: 'Let\'s start your journey with our powerful POS system.',
  };

  // Calculate tooltip position based on highlighted element
  const calculateTooltipPosition = (element: Element) => {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const tooltipWidth = tooltipRect?.width || 320;
    const tooltipHeight = tooltipRect?.height || 200;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768; // Mobile breakpoint
    
    let top = 0;
    let left = 0;
    
    // Default position preference based on step configuration
    const position = currentStep.position || 'bottom';
    
    if (isMobile) {
      // Mobile-specific positioning to avoid covering highlighted elements
      const elementCenter = rect.top + (rect.height / 2);
      const elementBottom = rect.bottom;
      const elementTop = rect.top;
      
      // Check if there's enough space below the element
      const spaceBelow = viewportHeight - elementBottom;
      const spaceAbove = elementTop;
      
      if (spaceBelow >= tooltipHeight + 40) {
        // Position below with some margin
        top = elementBottom + 20;
        left = 20; // Always use left margin on mobile for consistency
      } else if (spaceAbove >= tooltipHeight + 40) {
        // Position above with some margin
        top = elementTop - tooltipHeight - 20;
        left = 20;
      } else {
        // Not enough space above or below, use side positioning
        if (elementCenter > viewportHeight / 2) {
          // Element in lower half, position tooltip in upper area
          top = 20;
        } else {
          // Element in upper half, position tooltip in lower area
          top = viewportHeight - tooltipHeight - 20;
        }
        left = 20;
      }
    } else {
      // Desktop positioning (original logic)
      switch (position) {
        case 'top':
          top = rect.top - tooltipHeight - 20;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left - tooltipWidth - 20;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + 20;
          break;
        case 'center':
          top = viewportHeight / 2 - tooltipHeight / 2;
          left = viewportWidth / 2 - tooltipWidth / 2;
          break;
      }
    }
    
    // Final viewport boundary checks
    if (left < 20) left = 20;
    if (left + tooltipWidth > viewportWidth - 20) left = viewportWidth - tooltipWidth - 20;
    if (top < 20) top = 20;
    if (top + tooltipHeight > viewportHeight - 20) top = viewportHeight - tooltipHeight - 20;
    
    return { top, left };
  };

  // Update highlighted element and tooltip position
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const element = document.querySelector(currentStep.target);
    if (element) {
      setHighlightedElement(element);
      
      // Wait for tooltip to render, then calculate position
      setTimeout(() => {
        const position = calculateTooltipPosition(element);
        setTooltipPosition(position);
      }, 50);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStepIndex, isOpen, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={handleSkip}
      />
      
      {/* Highlight spotlight */}
      <AnimatePresence>
        {highlightedElement && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              top: highlightedElement.getBoundingClientRect().top - 8,
              left: highlightedElement.getBoundingClientRect().left - 8,
              width: highlightedElement.getBoundingClientRect().width + 16,
              height: highlightedElement.getBoundingClientRect().height + 16,
              borderRadius: '12px',
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
              border: '2px solid #3b82f6',
            }}
          />
        )}
      </AnimatePresence>

      {/* Tutorial tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep?.id}
          ref={tooltipRef}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", damping: 20 }}
          className="absolute z-[10000]"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: '90vw',
            width: '320px',
          }}
        >
          <Card className="shadow-2xl border-2 border-[hsl(217,90%,40%)] bg-white/95 backdrop-blur-md">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-5 h-5 text-white" />
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {labels.stepOf.replace('{current}', (currentStepIndex + 1).toString()).replace('{total}', steps.length.toString())}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-white hover:bg-white/20 p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight">
                  {currentStep?.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {currentStep?.description}
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {!isFirstStep && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {labels.previous}
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {labels.skip}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white flex items-center gap-1"
                    >
                      {isLastStep ? labels.finish : labels.next}
                      {!isLastStep && <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-6 pb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}