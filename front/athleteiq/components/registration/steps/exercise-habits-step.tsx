"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type ExerciseHabitsProps = {
  formData: Record<string, any>
  updateFormData: (data: Record<string, any>) => void
  validationErrors: Record<string, boolean>
  shakeError: boolean
}

export function ExerciseHabitsStep({ formData, updateFormData, validationErrors, shakeError }: ExerciseHabitsProps) {
  const [calories, setCalories] = useState(formData.calories || "")
  const [sessionTime, setSessionTime] = useState(formData.sessionTime || "")
  const [steps, setSteps] = useState(formData.steps || "")

  const shakeAnimation: Variants = {
    shake: {
      x: [0, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          ...(validationErrors.calories && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="calories" className={validationErrors.calories ? "text-destructive" : "text-pink-400"}>
          How many calories do you burn per exercise session?
        </Label>
        <Input
          id="calories"
          type="number"
          placeholder="Enter calories burned"
          value={calories}
          onChange={(e) => {
            setCalories(e.target.value)
            updateFormData({ calories: e.target.value, sessionTime, steps })
          }}
          className={
            validationErrors.calories
              ? "border-destructive ring-destructive"
              : "border-pink-400/30 focus:border-pink-400 focus:ring-pink-400 text-pink-400 placeholder:text-pink-400/50"
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          ...(validationErrors.sessionTime && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="sessionTime" className={validationErrors.sessionTime ? "text-destructive" : "text-pink-400"}>
          What's your exercise session time? (minutes)
        </Label>
        <Input
          id="sessionTime"
          type="number"
          placeholder="Enter session time in minutes"
          value={sessionTime}
          onChange={(e) => {
            setSessionTime(e.target.value)
            updateFormData({ calories, sessionTime: e.target.value, steps })
          }}
          className={
            validationErrors.sessionTime
              ? "border-destructive ring-destructive"
              : "border-pink-400/30 focus:border-pink-400 focus:ring-pink-400 text-pink-400 placeholder:text-pink-400/50"
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          ...(validationErrors.steps && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="steps" className={validationErrors.steps ? "text-destructive" : "text-pink-400"}>
          How many steps do you achieve on exercise days?
        </Label>
        <Input
          id="steps"
          type="number"
          placeholder="Enter steps count"
          value={steps}
          onChange={(e) => {
            setSteps(e.target.value)
            updateFormData({ calories, sessionTime, steps: e.target.value })
          }}
          className={
            validationErrors.steps
              ? "border-destructive ring-destructive"
              : "border-pink-400/30 focus:border-pink-400 focus:ring-pink-400 text-pink-400 placeholder:text-pink-400/50"
          }
        />
      </motion.div>
    </div>
  )
}

