'use client';

import { FolderTree, HelpCircle, Github } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 bg-gray-100 border-r border-border z-50 flex flex-col">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-none border-b border-border hover:bg-accent",
                "flex items-center justify-center"
              )}
            >
              <Link href='/projects'>
              <FolderTree className="h-5 w-5" />
              <span className="sr-only">Projects</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-50">
            <p>Projects</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex-1" />
        <div className="flex flex-col space-y-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-none border-t border-border hover:bg-accent",
                  "flex items-center justify-center"
                )}
                asChild
              >
                <a href="https://docs.getodk.org/central-intro/" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Help</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="z-50">
              <p>Help</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-none border-t border-border hover:bg-accent",
                  "flex items-center justify-center"
                )}
                asChild
              >
                <a href="https://github.com/dasarna" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="z-50">
              <p>GitHub</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
