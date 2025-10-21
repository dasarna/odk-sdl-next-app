import { ReactNode } from 'react';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';


export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header: Full width */}
      <Header />

      {/* Content: Sidebar + Main */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar: Fixed, full height below header */}
        <Sidebar />

        {/* Main content: Offset by sidebar width */}
        <main className="flex-1 ml-16">{children}</main>
      </div>
    </div>
  );
}
