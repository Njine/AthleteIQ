"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

type PerformanceProps = {
  formData: Record<string, any>
  updateFormData: (data: Record<string, any>) => void
  validationErrors: Record<string, boolean>
  shakeError: boolean
}

export function PerformanceStep({ formData, updateFormData, validationErrors, shakeError }: PerformanceProps) {
  const [vo2max, setVo2max] = useState(formData.vo2max || "")

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
          ...(validationErrors.vo2max && shakeError ? shakeAnimation.shake : {}),
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <Label htmlFor="vo2max" className={validationErrors.vo2max ? "text-destructive" : "text-pink-400"}>
            What's your maximum VO2?
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-pink-400" />
              </TooltipTrigger>
              <TooltipContent className="bg-[#F1039C]/90 text-white border-none">
                <p className="max-w-xs">
                  VO2 max is the maximum amount of oxygen your body can utilize during exercise. It's measured in
                  milliliters of oxygen per kilogram of body weight per minute (ml/kg/min).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="vo2max"
          type="number"
          placeholder="Enter your VO2 max (ml/kg/min)"
          value={vo2max}
          onChange={(e) => {
            setVo2max(e.target.value)
            updateFormData({ vo2max: e.target.value })
          }}
          className={
            validationErrors.vo2max
              ? "border-destructive ring-destructive"
              : "border-pink-400/30 focus:border-pink-400 focus:ring-pink-400 text-pink-400 placeholder:text-pink-400/50"
          }
        />
        <p className="text-sm text-pink-400/70 mt-1">
          If you don't know your VO2 max, you can leave this field blank and complete it later.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-pink-400/30 p-4 bg-gradient-to-r from-[#F1039C]/10 to-transparent"
      >
        <h3 className="font-medium mb-2 text-pink-400">Almost done!</h3>
        <p className="text-sm text-pink-400/80">
          Thank you for providing your performance metrics. This information will help us create a personalized training
          plan tailored to your specific needs and goals.
        </p>
      </motion.div>
    </div>
  )
}

