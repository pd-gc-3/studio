import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/icons';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="mb-4 h-12 w-12 text-primary" />
          <h1 className="font-headline text-3xl font-bold">Welcome back to EchoFlow</h1>
          <p className="text-muted-foreground">Sign in to continue your conversations</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
