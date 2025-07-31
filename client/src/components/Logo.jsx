import React from "react";
import { useNavigate } from "react-router-dom";

function Logo() {
  const navigate = useNavigate();

  return (
    <span
      className="flex items-center space-x-1 w-32 sm:w-44 cursor-pointer"
      onClick={() => navigate("/")}
      aria-label="Creavo Logo"
    >
      <img
        src="/favicon.svg"
        alt="Creavo Logo"
        className="h-8 w-8"
      />
      <span className="text-3xl font-bold relative top-[-2px] text-[rgb(68,80,229)] leading-none">
        Creavo.ai
      </span>
    </span>
  );
}

export default Logo;
