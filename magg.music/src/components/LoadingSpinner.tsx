// LoadingSpinner.tsx
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#D9D9D9] border-t-[#7443FF]"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-2 w-2 bg-[#7443FF] rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);