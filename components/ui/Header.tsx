'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [username, setUsername] = useState('Guest');
  const [isClient, setIsClient] = useState(false);
 
  // Defer rendering until client-side hydration
  useEffect(() => {
    setIsClient(true); // Mark as client-side
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await fetch('/api/auth/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUsername(data.username || 'Guest');
          } else {
            setUsername('Guest');
            if (res.status === 401) {
              logout();
              router.push('/');
            }
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setUsername('Guest');
        }
      };
      fetchUser();
    } else {
      setUsername('Guest');
      router.push('/');
    }
  }, [token, logout, router]);

  // Avoid rendering until client-side to prevent mismatch
  if (!isClient) {
    return null; // Or a minimal placeholder
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-black text-white p-4 flex items-center justify-between">
      <Link href="/projects" className="flex items-center space-x-2">
        <Image
          src="/sdl_dark.png"
          alt="Company Logo"
          width={32}
          height={32}
          priority
          className="object-contain"
          onError={() => console.error('Logo not found')}
        />
        <span className="text-xl font-bold">SurveyDigital</span>
      </Link>
      <div className="flex items-center space-x-4">
        
        <div className="flex items-center space-x-2">
          <span>{username}</span>
          {token && (
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="hover:text-gray-300 focus:outline-none"
            >
              <LogOut/>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
