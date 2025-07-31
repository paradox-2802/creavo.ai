import React from "react";
import Logo from "./Logo";
import { ArrowRight } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const NavBar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  return (
    <div className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 cursor-pointer">
      <Logo></Logo>

      {user ? (
        <UserButton></UserButton>
      ) : (
          <button onClick={() => openSignIn()}
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5">
          Get stated
          <ArrowRight className="w-4 h-4"></ArrowRight>
        </button>
      )}
    </div>
  );
};

export default NavBar;
