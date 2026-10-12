import { cookies } from 'next/headers';
import LandingView from '@/components/landing/landing-view';

export default async function LandingPage() {
  const cookieStore = await cookies();
  const initialSeen = cookieStore.get('aksantara_intro_seen')?.value === 'true';

  return <LandingView initialSeen={initialSeen} />;
}


