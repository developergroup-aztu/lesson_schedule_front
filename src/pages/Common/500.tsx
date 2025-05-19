import React from 'react';

const ServerError = () => {
  return (
    <div className=" flex flex-col items-center justify-center  h-[80vh] ">
      <h1 className="text-7xl font-bold text-red-600">500</h1>
      <p className="text-2xl font-semibold text-gray-800 mt-4">Server Error</p>
    </div>
    );
}

export default ServerError;