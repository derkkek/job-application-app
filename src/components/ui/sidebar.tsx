"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-auth";
import { 
  Briefcase, 
  FileText, 
  Settings, 
  Users, 
  Building2,
  LogOut 
} from "lucide-react";

interface SidebarProps {
  userType: 'employer' | 'applicant';
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userType, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const signOutMutation = useSignOut();

  const employerLinks = [
    {
      href: "/employer/jobs",
      label: "My job postings",
      icon: Building2,
    },
    {
      href: "/employer/applicants",
      label: "Applicants",
      icon: Users,
    },
    {
      href: "/employer/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const applicantLinks = [
    {
      href: "/applicant/jobs",
      label: "Available jobs",
      icon: Briefcase,
    },
    {
      href: "/applicant/applications",
      label: "Applied jobs",
      icon: FileText,
    },
    {
      href: "/applicant/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const links = userType === 'employer' ? employerLinks : applicantLinks;

  const handleLogout = () => {
    signOutMutation.mutate();
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Job Application Platform
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {userType === 'employer' ? 'Employer Dashboard' : 'Applicant Dashboard'}
        </p>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {userName || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || 
              (link.href !== '/employer/settings' && link.href !== '/applicant/settings' && 
               pathname.startsWith(link.href));

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full justify-start space-x-3"
          onClick={handleLogout}
          disabled={signOutMutation.isPending}
        >
          <LogOut className="w-5 h-5" />
          <span>{signOutMutation.isPending ? 'Signing out...' : 'Logout'}</span>
        </Button>
      </div>
    </div>
  );
} 