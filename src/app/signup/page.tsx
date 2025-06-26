import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/icons';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="mb-4 h-12 w-12 text-primary" />
          <h1 className="font-headline text-3xl font-bold">Join EchoFlow</h1>
          <p className="text-muted-foreground">Start your intelligent chat experience today</p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
