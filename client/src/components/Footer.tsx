export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ArtLineReact Setup Guide
          </div>
          <div className="flex space-x-6">
            <a href="https://github.com" className="text-gray-500 hover:text-gray-700">
              <i className="ri-github-fill"></i>
            </a>
            <a href="https://reactjs.org" className="text-gray-500 hover:text-gray-700">
              <i className="ri-reactjs-line"></i>
            </a>
            <a href="https://npmjs.com" className="text-gray-500 hover:text-gray-700">
              <i className="ri-npm-fill"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
