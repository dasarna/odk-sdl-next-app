'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useAuthStore((state) => state.setToken);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/auth', { email, password });
      setToken(response.data.token);
      router.push('/projects');
    } catch (err: any) {
      console.error('Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(`Login failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <Card className="w-[400px] mx-auto mt-20">
      <CardHeader>
        <CardTitle>ODK Central Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="email" className='pb-2'>Email</Label>
        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br/>
        <Label htmlFor="password" className='pt-6 pb-2'>Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-red-500">{error}</p>}
        <Button onClick={handleLogin} className="mt-4">Login</Button>
      </CardContent>
    </Card>
  );
}
