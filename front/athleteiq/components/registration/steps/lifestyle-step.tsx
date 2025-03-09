"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

type LifestyleProps = {
  formData: Record<string, any>
  updateFormData: (data: Record<string, any>) => void
  validationErrors: Record<string, boolean>
  shakeError: boolean
}

export function LifestyleStep({ formData, updateFormData, validationErrors, shakeError }: LifestyleProps) {
  const [alcohol, setAlcohol] = useState(formData.alcohol || "")
  const [sleepHours, setSleepHours] = useState(formData.sleepHours || "")
  const [sleepQuality, setSleepQuality] = useState<number[]>(formData.sleepQuality ? [formData.sleepQuality] : [5])

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
          ...(validationErrors.alcohol && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-2"
      >
        <Label className={validationErrors.alcohol ? "text-destructive" : "text-pink-400"}>
          Do you consume alcohol?
        </Label>
        <RadioGroup
          value={alcohol}
          onValueChange={(value) => {
            setAlcohol(value)
            updateFormData({ alcohol: value, sleepHours, sleepQuality: sleepQuality[0] })
          }}
          className={`flex flex-col space-y-1 ${validationErrors.alcohol ? "border border-destructive rounded-md p-2" : ""}`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="alcohol-yes" className="text-pink-400 border-pink-400" />
            <Label htmlFor="alcohol-yes" className="text-pink-400">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="alcohol-no" className="text-pink-400 border-pink-400" />
            <Label htmlFor="alcohol-no" className="text-pink-400">
              No
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="occasionally" id="alcohol-occasionally" className="text-pink-400 border-pink-400" />
            <Label htmlFor="alcohol-occasionally" className="text-pink-400">
              Occasionally
            </Label>
          </div>
        </RadioGroup>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          ...(validationErrors.sleepHours && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="sleepHours" className={validationErrors.sleepHours ? "text-destructive" : "text-pink-400"}>
          How many hours daily do you sleep?
        </Label>
        <Input
          id="sleepHours"
          type="number"
          placeholder="Enter sleep hours"
          value={sleepHours}
          onChange={(e) => {
            setSleepHours(e.target.value)
            updateFormData({ alcohol, sleepHours: e.target.value, sleepQuality: sleepQuality[0] })
          }}
          className={
            validationErrors.sleepHours
              ? "border-destructive ring-destructive"
              : "border-pink-400/30 focus:border-pink-400 focus:ring-pink-400 text-pink-400 placeholder:text-pink-400/50"
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div>
          <Label className="text-pink-400">On a scale of 1 to 10, what's your sleep quality?</Label>
          <div className="pt-2">
            <Slider
              value={sleepQuality}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => {
                setSleepQuality(value)
                updateFormData({ alcohol, sleepHours, sleepQuality: value[0] })
              }}
              className="bg-pink-400/20"
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-pink-400/70">
          <span>Poor (1)</span>
          <span>Excellent (10)</span>
        </div>
        <div className="text-center font-medium text-pink-400">Selected: {sleepQuality[0]}</div>
      </motion.div>
    </div>
  )
}

