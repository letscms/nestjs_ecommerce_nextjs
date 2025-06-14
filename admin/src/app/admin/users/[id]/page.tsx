import UserDetails from '@/components/admin/UserDetails';

interface UserDetailsPageProps {
  params: { id: string };
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  return <UserDetails userId={params.id} />;
}