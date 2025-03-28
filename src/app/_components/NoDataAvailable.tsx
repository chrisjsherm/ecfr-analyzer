export default function NoDataAvailable() {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75h4.5m-4.5 4.5h4.5m-7.5 6.75h10.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
      <p className="text-gray-600 text-lg font-medium">No Data Available</p>
      <p className="text-gray-500 mt-1">
        Please adjust your parameters or try again later.
      </p>
    </div>
  );
}
