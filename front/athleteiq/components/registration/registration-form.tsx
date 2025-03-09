"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { BasicInfoStep } from "./steps/basic-info-step";
import { ExerciseHabitsStep } from "./steps/exercise-habits-step";
import { LifestyleStep } from "./steps/lifestyle-step";
import { PerformanceStep } from "./steps/performance-step";

const steps = [
  { title: "Basic Info", component: BasicInfoStep },
  { title: "Exercise Habits", component: ExerciseHabitsStep },
  { title: "Lifestyle", component: LifestyleStep },
  { title: "Performance", component: PerformanceStep },
];

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
  const [shakeError, setShakeError] = useState(false);

  const StepComponent = steps[currentStep].component;

  const updateFormData = (data: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setValidationErrors({});
    }
  };

  const validateCurrentStep = () => {
    let isValid = true;
    const newErrors: Record<string, boolean> = {};

    // Validate based on the current step
    if (currentStep === 0) {
      // Basic Info validation
      if (!formData.age) {
        newErrors.age = true;
        isValid = false;
      }
      if (!formData.height) {
        newErrors.height = true;
        isValid = false;
      }
      if (!formData.weight) {
        newErrors.weight = true;
        isValid = false;
      }
      if (!formData.gender) {
        newErrors.gender = true;
        isValid = false;
      }
    } else if (currentStep === 1) {
      // Exercise Habits validation
      if (!formData.calories) {
        newErrors.calories = true;
        isValid = false;
      }
      if (!formData.sessionTime) {
        newErrors.sessionTime = true;
        isValid = false;
      }
      if (!formData.steps) {
        newErrors.steps = true;
        isValid = false;
      }
    } else if (currentStep === 2) {
      // Lifestyle validation
      if (!formData.alcohol) {
        newErrors.alcohol = true;
        isValid = false;
      }
      if (!formData.sleepHours) {
        newErrors.sleepHours = true;
        isValid = false;
      }
      // Sleep quality is pre-filled with a default value, so no validation needed
    } else if (currentStep === 3) {
      // Performance validation
      if (!formData.vo2max) {
        newErrors.vo2max = true;
        isValid = false;
      }
    }

    setValidationErrors(newErrors);

    if (!isValid) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }

    return isValid;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const isStepValid = validateCurrentStep();

      if (isStepValid) {
        setCurrentStep((prev) => prev + 1);
        setValidationErrors({});
      }
    }
  };

  const handleSubmit = () => {
    const isStepValid = validateCurrentStep();

    if (isStepValid) {
      console.log("Form submitted:", formData);
      // Here you would typically send the data to your backend
      alert("Registration completed successfully!");
    }
  };

  return (
    <Card className="w-full max-w-2xl backdrop-blur-md bg-white/30 border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#F1039C] to-transparent">
        <CardTitle className="text-pink-400">
          {steps[currentStep].title}
        </CardTitle>
        <Progress
          value={((currentStep + 1) / steps.length) * 100}
          className="h-2 mt-2"
          indicatorClassName="bg-gradient-to-r from-[#F1039C] to-pink-300"
        />
      </CardHeader>
      <CardContent className="text-pink-400">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepComponent
              formData={formData}
              updateFormData={updateFormData}
              validationErrors={validationErrors}
              shakeError={shakeError}
            />
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-1 bg-transparent border-pink-400 text-pink-400 hover:bg-pink-400/10"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-1 bg-[#F1039C] hover:bg-[#F1039C]/80"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            className="flex items-center gap-1 bg-[#F1039C] hover:bg-[#F1039C]/80"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
