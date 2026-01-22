'use client';
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/common/logo";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
            <Logo />
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mt-4">
                AI Study Buddy
            </h1>
            <p className="text-muted-foreground mt-2">Login or create an account to get started.</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
