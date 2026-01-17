import { Search, ChevronDown, Wifi, WifiOff, Cpu, User, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function Header() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo & Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg medical-gradient flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-lg tracking-tight">RadiantAI</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">Powered by MedGemma</span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="ml-6 flex items-center gap-2">
          <Button
            variant={isOnline ? "secondary" : "outline"}
            size="sm"
            className={`gap-2 text-xs ${isOnline ? "bg-accent/10 text-accent border-accent/20" : ""}`}
            onClick={() => setIsOnline(true)}
          >
            <Wifi className="w-3.5 h-3.5" />
            Online
          </Button>
          <Button
            variant={!isOnline ? "secondary" : "outline"}
            size="sm"
            className={`gap-2 text-xs ${!isOnline ? "bg-accent/10 text-accent border-accent/20" : ""}`}
            onClick={() => setIsOnline(false)}
          >
            <WifiOff className="w-3.5 h-3.5" />
            Offline
          </Button>
        </div>

        {/* System Status */}
        <div className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-success/10 border border-status-success/20">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse-subtle" />
          <Cpu className="w-3.5 h-3.5 text-status-success" />
          <span className="text-xs font-medium text-status-success">
            {isOnline ? "MedGemma Ready" : "Local Inference Active"}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, studies..."
            className="pl-10 bg-secondary/50 border-border/50 focus:bg-card"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-error" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Dr. Sarah Chen</span>
                <span className="text-[10px] text-muted-foreground">Radiologist</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
