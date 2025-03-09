"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shield, Zap } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { BasicInfoStep } from "./steps/basic-info-step";
import { ExerciseHabitsStep } from "./steps/exercise-habits-step";
import { LifestyleStep } from "./steps/lifestyle-step";
import { PerformanceStep } from "./steps/performance-step";

const steps = [
  { title: "Basic Info", component: BasicInfoStep, icon: Shield },
  { title: "Exercise Habits", component: ExerciseHabitsStep, icon: Zap },
  { title: "Lifestyle", component: LifestyleStep, icon: Shield },
  { title: "Performance", component: PerformanceStep, icon: Zap },
];

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
  const [shakeError, setShakeError] = useState(false);

  const StepComponent = steps[currentStep].component;
  const CurrentIcon = steps[currentStep].icon;

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
    <Card className="w-full max-w-2xl rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-sm shadow-lg shadow-purple-500/10 overflow-hidden">
      <CardHeader className="relative p-6 border-b border-purple-500/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F1039C] via-purple-500 to-transparent"></div>
        
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-pink-500/20 p-2">
            <CurrentIcon className="h-5 w-5 text-pink-400" />
          </div>
          <CardTitle className="text-white text-xl">{steps[currentStep].title}</CardTitle>
        </div>
        
        <div className="mt-4 flex items-center">
          <div className="w-full bg-gray-700/30 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#F1039C] to-purple-500"
              initial={{ width: `${((currentStep) / steps.length) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="ml-3 text-sm text-gray-400">
            {currentStep + 1}/{steps.length}
          </div>
        </div>
        
        <div className="mt-4 flex">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex-1 text-center text-xs ${
                index === currentStep 
                  ? 'text-pink-400' 
                  : index < currentStep 
                    ? 'text-green-400' 
                    : 'text-gray-500'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-white"
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
      
      <CardFooter className="flex justify-between p-6 border-t border-purple-500/30 bg-black/20">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 border-purple-500/50 text-white hover:bg-purple-500/10 ${
              currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0"
              style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
            >
              Complete Registration <Zap className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2 bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0"
              style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </CardFooter>
    </Card>
  );
}
