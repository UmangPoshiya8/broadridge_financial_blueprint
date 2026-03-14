'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Institution {
  id: string;
  name: string;
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('institutions').select('id,name').order('name');
      setInstitutions((data ?? []) as Institution[]);
      if (data?.[0]?.id) setInstitutionId(data[0].id);
    };

    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'investor',
          institution_id: institutionId
        }
      }
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess('Signup successful. Check your email if confirmation is enabled.');
    setTimeout(() => router.push('/auth/login'), 1000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">Investor Signup</h2>
      <Input placeholder="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm" value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
        {institutions.map((inst) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}
      <Button type="submit" className="w-full">Create investor account</Button>
    </form>
  );
}

