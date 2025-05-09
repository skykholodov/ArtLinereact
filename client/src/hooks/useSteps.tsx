import { useState } from "react";

export interface Terminal {
  commands: string[];
  output: string[];
  copyButtonText?: string;
  altTitle?: string;
  altCommand?: string;
}

export interface InfoBox {
  title: string;
  content: string;
}

export interface DirectoryExplanation {
  directories: { name: string; description: string }[];
  files: { name: string; description: string }[];
}

export interface Step {
  title: string;
  description: string;
  terminals?: Terminal[];
  infoBox?: InfoBox;
  warningBox?: InfoBox;
  checklist?: string[];
  projectStructure?: string;
  directoryExplanation?: DirectoryExplanation;
}

export function useSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "Clone the ArtLineReact Repository",
      description: "First, clone the repository from GitHub to your local machine using the git command:",
      terminals: [
        {
          commands: ["git clone https://github.com/username/ArtLinereact.git"],
          output: [
            "Cloning into 'ArtLinereact'...",
            "remote: Enumerating objects: 1234, done.",
            "remote: Counting objects: 100% (1234/1234), done.",
            "remote: Compressing objects: 100% (789/789), done.",
            "Receiving objects: 100% (1234/1234), 42.5 MiB | 8.2 MiB/s, done.",
            "Successfully cloned repository"
          ],
          copyButtonText: "Copy Command"
        }
      ],
      infoBox: {
        title: "Note",
        content: "Make sure to replace username with the actual GitHub username that hosts the repository."
      }
    },
    {
      title: "Install Dependencies",
      description: "Navigate to the project directory and install all required dependencies:",
      terminals: [
        {
          commands: ["cd ArtLinereact", "npm install"],
          output: [
            "[.................]",
            "Installing dependencies..."
          ],
          copyButtonText: "Copy cd Command",
          altTitle: "Copy npm Command",
          altCommand: "npm install"
        }
      ],
      warningBox: {
        title: "This may take a while",
        content: "Depending on your internet connection, the installation might take several minutes to complete."
      }
    },
    {
      title: "Start the Development Server",
      description: "Launch the development server to run the ArtLineReact application locally:",
      terminals: [
        {
          commands: ["npm start"],
          output: [
            "Starting the development server...",
            "Compiled successfully!",
            "You can now view ArtLineReact in the browser.",
            "Local:            http://localhost:3000",
            "On Your Network:  http://192.168.1.x:3000"
          ],
          copyButtonText: "Copy Command"
        }
      ]
    },
    {
      title: "Verify Application Functionality",
      description: "After starting the development server, the application should automatically open in your browser. If not, you can navigate to http://localhost:3000.",
      checklist: [
        "Navigation works between different sections",
        "User interface renders correctly without visual glitches",
        "All interactive elements (buttons, forms, etc.) respond to user input",
        "No console errors appear in the browser developer tools"
      ]
    },
    {
      title: "Explore Project Structure",
      description: "Familiarize yourself with the main structure of the ArtLineReact project:",
      projectStructure: `ArtLinereact/
├── README.md
├── node_modules/
├── package.json
├── package-lock.json
├── .gitignore
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src/
    ├── App.js
    ├── App.css
    ├── App.test.js
    ├── index.js
    ├── index.css
    ├── setupTests.js
    ├── reportWebVitals.js
    ├── assets/
    ├── components/
    │   └── [component files]
    ├── pages/
    │   └── [page components]
    └── utils/
        └── [utility functions]`,
      directoryExplanation: {
        directories: [
          {
            name: "src/components",
            description: "Reusable UI components"
          },
          {
            name: "src/pages",
            description: "Main page components of the application"
          },
          {
            name: "src/assets",
            description: "Static assets like images and fonts"
          },
          {
            name: "src/utils",
            description: "Utility and helper functions"
          }
        ],
        files: [
          {
            name: "package.json",
            description: "Project dependencies and scripts"
          },
          {
            name: "src/App.js",
            description: "Main application component"
          },
          {
            name: "src/index.js",
            description: "Entry point of the React application"
          },
          {
            name: "public/index.html",
            description: "HTML template for the application"
          }
        ]
      }
    }
  ];

  const completeStep = (index: number) => {
    if (index === currentStep) {
      setCurrentStep(index + 1);
    }
  };

  const goToPreviousStep = (index: number) => {
    if (index > 0 && index <= currentStep) {
      setCurrentStep(index - 1);
    }
  };

  return {
    currentStep,
    steps,
    completeStep,
    goToPreviousStep
  };
}
