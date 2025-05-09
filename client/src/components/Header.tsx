import { MoonIcon } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="ri-reactjs-line text-blue-500 text-2xl"></i>
            <h1 className="text-xl font-semibold">ArtLineReact Setup Guide</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/username/ArtLinereact"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <i className="ri-github-fill text-lg"></i>
              <span className="hidden sm:inline text-sm">GitHub Repo</span>
            </a>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoonIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
