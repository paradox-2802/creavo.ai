import React, { useState } from "react";
import Logo from "../components/Logo";
import {useUser, SignIn} from "@clerk/clerk-react";
import { MenuIcon, XIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const { user } = useUser();
  const [sidebar, setSidebar] = useState(false);

  return user ? (
    <div className="flex flex-col items-start justify-start h-screen">
      <div className="w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200">
        <Logo></Logo>
        {sidebar ? (
          <XIcon
            className="w-6 h-6 text-gray-600 sm:hidden"
            onClick={() => setSidebar(false)}
          ></XIcon>
        ) : (
          <MenuIcon
            className="w-6 h-6 text-gray-600 sm:hidden"
            onClick={() => setSidebar(true)}
          ></MenuIcon>
        )}
      </div>
      <div className="flex-1 w-full flex h-[calc(100vh-64px)]">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar}></Sidebar>
        <div className="flex-1 bg-[#F4F7FB]">
          <Outlet></Outlet>
        </div>
      </div>
    </div>
  ) :
    <div className="flex items-center justify-center min-h-screen">
      <SignIn></SignIn>
    </div>
};

export default Layout;
