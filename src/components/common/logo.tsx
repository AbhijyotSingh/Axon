import { BrainCircuit } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Logo() {
  return (
    <div className="p-2 bg-primary rounded-lg shadow-md">
      <BrainCircuit className="h-8 w-8 text-primary-foreground" />
    </div>
  );
}
