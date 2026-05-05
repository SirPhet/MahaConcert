import React from 'react';

const Seat = ({ data, status, isSelected, onClick }) => {
  // Determine Tailwind classes based on status
  let baseClasses = "w-10 h-10 m-1 rounded-t-lg rounded-b-sm font-semibold text-xs flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 shadow-sm";
  let colorClasses = "";

  if (status === 'sold') {
    colorClasses = "bg-red-500 text-white cursor-not-allowed opacity-70 hover:scale-100";
  } else if (status === 'pending') {
    colorClasses = "bg-yellow-400 text-yellow-900 cursor-not-allowed opacity-80 hover:scale-100";
  } else if (isSelected) {
    colorClasses = "bg-green-500 text-white ring-2 ring-green-300 ring-offset-1";
  } else {
    // Available
    colorClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md";
  }

  return (
    <div 
      className={`${baseClasses} ${colorClasses}`}
      onClick={() => {
        if (status === 'available') {
          onClick();
        }
      }}
      title={`${data.zone} - ${data.seatNumber} | ฿${data.price}`}
    >
      {data.seatNumber.replace(/^[A-Z]/, '')} {/* Show only number part for brevity */}
    </div>
  );
};

export default Seat;
