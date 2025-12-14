import { AuthGuard } from '@/components/AuthGuard';

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
