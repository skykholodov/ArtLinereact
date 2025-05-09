import { Step } from "@/hooks/useSteps";

interface SidebarProps {
  currentStep: number;
  steps: Step[];
}

export default function Sidebar({ currentStep, steps }: SidebarProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
        <h2 className="font-medium text-lg mb-4">Setup Steps</h2>
        <ol className="space-y-2 text-sm">
          {steps.map((step, index) => {
            let stepClass = "flex items-center space-x-3 p-2 rounded-md";
            let numberClass = "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs";

            if (index < currentStep) {
              // Completed step
              stepClass += " hover:bg-gray-50";
              numberClass += " bg-green-500 text-white";
            } else if (index === currentStep) {
              // Current step
              stepClass += " bg-blue-50 text-blue-700";
              numberClass += " bg-blue-500 text-white";
            } else {
              // Future step
              stepClass += " hover:bg-gray-50";
              numberClass += " bg-gray-200 text-gray-700";
            }

            return (
              <li key={index} className={stepClass}>
                <span className={numberClass}>{index + 1}</span>
                <span className={index === currentStep ? "font-medium" : ""}>{step.title}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 p-3 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Prerequisites</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-center space-x-2">
              <i className="ri-checkbox-circle-fill"></i>
              <span>Node.js (v14 or higher)</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="ri-checkbox-circle-fill"></i>
              <span>npm or yarn</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="ri-checkbox-circle-fill"></i>
              <span>Git</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
