import { copyToClipboard } from "@/lib/copyToClipboard";
import { useState } from "react";

interface TerminalProps {
  commands: string[];
  output: string[];
  copyButtonText?: string;
  altTitle?: string;
  altCommand?: string;
}

export default function Terminal({
  commands,
  output,
  copyButtonText = "Copy Command",
  altTitle,
  altCommand,
}: TerminalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (command: string) => {
    copyToClipboard(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md overflow-hidden border border-gray-200 mb-6">
      <div className="bg-terminal-bg text-white font-mono text-sm p-4 overflow-x-auto">
        {commands.map((command, index) => (
          <div key={index} className="flex">
            <span className="text-green-500 mr-2">$</span>
            <span className="text-blue-400">{command}</span>
          </div>
        ))}
        {output.map((line, index) => (
          <div key={`output-${index}`} className={line.startsWith("Successfully") ? "text-green-500" : "text-gray-400 mt-1"}>
            {line}
          </div>
        ))}
      </div>
      <div className={`flex border-t border-gray-200 bg-gray-50 ${altTitle ? "divide-x divide-gray-200" : ""}`}>
        <button
          onClick={() => handleCopy(commands[0])}
          className="copy-btn flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors w-full"
        >
          <i className={`${copied ? "ri-check-line" : "ri-clipboard-line"}`}></i>
          <span>{copied ? "Copied!" : copyButtonText}</span>
        </button>
        {altTitle && altCommand && (
          <button
            onClick={() => handleCopy(altCommand)}
            className="copy-btn flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors w-full"
          >
            <i className="ri-clipboard-line"></i>
            <span>{altTitle}</span>
          </button>
        )}
      </div>
    </div>
  );
}
