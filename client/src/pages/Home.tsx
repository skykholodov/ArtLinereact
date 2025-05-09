import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import StepCard from "@/components/StepCard";
import Footer from "@/components/Footer";
import { useSteps } from "@/hooks/useSteps";

export default function Home() {
  const { currentStep, steps, completeStep, goToPreviousStep } = useSteps();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Sidebar currentStep={currentStep} steps={steps} />
          <div className="lg:col-span-4 space-y-6">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                step={step}
                index={index}
                currentStep={currentStep}
                onNext={() => completeStep(index)}
                onPrevious={() => goToPreviousStep(index)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
