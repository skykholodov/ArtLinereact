import Terminal from "@/components/Terminal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckIcon, InfoIcon, TimerIcon } from "lucide-react";
import { Step } from "@/hooks/useSteps";

interface StepCardProps {
  step: Step;
  index: number;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function StepCard({ step, index, currentStep, onNext, onPrevious }: StepCardProps) {
  const isActive = index <= currentStep;
  const isCompleted = index < currentStep;
  const isLast = index === 4; // Last step index

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
        isActive ? "" : "opacity-60"
      }`}
    >
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="text-lg font-medium flex items-center">
          <span
            className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-sm mr-3 ${
              isActive ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            {index + 1}
          </span>
          {step.title}
        </h2>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{step.description}</p>

        {/* Terminal component */}
        {step.terminals && step.terminals.map((terminal, terminalIndex) => (
          <Terminal
            key={terminalIndex}
            commands={terminal.commands}
            output={terminal.output}
            altTitle={terminal.altTitle}
            altCommand={terminal.altCommand}
            copyButtonText={terminal.copyButtonText}
          />
        ))}

        {/* Info box */}
        {step.infoBox && (
          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <InfoIcon className="text-blue-500 h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">{step.infoBox.title}</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>{step.infoBox.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning box */}
        {step.warningBox && (
          <div className="bg-yellow-50 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <TimerIcon className="text-yellow-500 h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">{step.warningBox.title}</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>{step.warningBox.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Functionality checklist */}
        {step.checklist && (
          <div className="bg-gray-50 rounded-md p-5 mb-6">
            <h3 className="text-base font-medium mb-3">Functionality Checklist</h3>
            <ul className="space-y-3">
              {step.checklist.map((item, i) => (
                <li key={i} className="flex items-start">
                  <input
                    type="checkbox"
                    disabled={!isActive}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project structure */}
        {step.projectStructure && (
          <div className="rounded-md overflow-hidden border border-gray-200 mb-6">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
              <h3 className="text-sm font-medium">Project Directory Structure</h3>
            </div>
            <div className="bg-white p-4 font-mono text-sm overflow-x-auto text-gray-800">
              <pre>{step.projectStructure}</pre>
            </div>
          </div>
        )}

        {/* Directory and files explanation */}
        {step.directoryExplanation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-md">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-sm font-medium">Key Directories</h3>
              </div>
              <div className="p-4">
                <ul className="text-sm space-y-3">
                  {step.directoryExplanation.directories.map((dir, i) => (
                    <li key={i} className="flex items-start">
                      <i className="ri-folder-line text-yellow-500 mt-0.5 mr-2"></i>
                      <div>
                        <span className="font-medium">{dir.name}</span>
                        <p className="text-gray-600 text-xs mt-1">{dir.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-sm font-medium">Key Files</h3>
              </div>
              <div className="p-4">
                <ul className="text-sm space-y-3">
                  {step.directoryExplanation.files.map((file, i) => (
                    <li key={i} className="flex items-start">
                      <i className="ri-file-code-line text-blue-500 mt-0.5 mr-2"></i>
                      <div>
                        <span className="font-medium">{file.name}</span>
                        <p className="text-gray-600 text-xs mt-1">{file.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {index > 0 ? (
            <Button
              variant="ghost"
              onClick={onPrevious}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              disabled={!isActive}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous Step</span>
            </Button>
          ) : (
            <div></div>
          )}
          
          {isLast ? (
            <Button
              className={`flex items-center space-x-2 ${
                isCompleted ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed"
              } text-white`}
              disabled={!isCompleted}
            >
              <span>Complete Setup</span>
              <CheckIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className={`flex items-center space-x-2 ${
                isActive && !isCompleted
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : isCompleted
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
              disabled={!isActive}
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
