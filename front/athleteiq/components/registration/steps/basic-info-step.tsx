"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BasicInfoProps = {
  formData: Record<string, any>
  updateFormData: (data: Record<string, any>) => void
  validationErrors: Record<string, boolean>
  shakeError: boolean
}

export function BasicInfoStep({ formData, updateFormData, validationErrors, shakeError }: BasicInfoProps) {
  const [age, setAge] = useState(formData.age || "")
  const [height, setHeight] = useState(formData.height || "")
  const [weight, setWeight] = useState(formData.weight || "")
  const [gender, setGender] = useState(formData.gender || "")

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
          ...(validationErrors.age && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="age" className={validationErrors.age ? "text-destructive" : "text-pink-400"}>
          What's your age?
        </Label>
        <Input
          id="age"
          type="number"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => {
            setAge(e.target.value)
            updateFormData({ age: e.target.value, height, weight, gender })
          }}
          className={
            validationErrors.age
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
          ...(validationErrors.height && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="height" className={validationErrors.height ? "text-destructive" : "text-pink-400"}>
          What's your height? (cm)
        </Label>
        <Input
          id="height"
          type="number"
          placeholder="Enter your height in cm"
          value={height}
          onChange={(e) => {
            setHeight(e.target.value)
            updateFormData({ age, height: e.target.value, weight, gender })
          }}
          className={
            validationErrors.height
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
          ...(validationErrors.weight && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="weight" className={validationErrors.weight ? "text-destructive" : "text-pink-400"}>
          What's your weight? (kg)
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter your weight in kg"
          value={weight}
          onChange={(e) => {
            setWeight(e.target.value)
            updateFormData({ age, height, weight: e.target.value, gender })
          }}
          className={
            validationErrors.weight
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
          ...(validationErrors.gender && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="space-y-2"
      >
        <Label htmlFor="gender" className={validationErrors.gender ? "text-destructive" : "text-pink-400"}>
          What's your gender?
        </Label>
        <Select
          value={gender}
          onValueChange={(value) => {
            setGender(value)
            updateFormData({ age, height, weight, gender: value })
          }}
        >
          <SelectTrigger
            id="gender"
            className={
              validationErrors.gender
                ? "border-destructive ring-destructive"
                : "border-pink-400/30 focus:border-pink-400 focus:ring-pink-400 text-pink-400"
            }
          >
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="non-binary">Non-binary</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
    </div>
  )
}

