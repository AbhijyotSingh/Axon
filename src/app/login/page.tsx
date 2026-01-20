import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/common/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
            <Logo />
            <h1 className="text-3xl font-bold mt-4">Welcome to AI Study Buddy</h1>
            <p className="text-muted-foreground">Log in or create an account to save your chats</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
