import { BrainCircuit } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Logo() {
  return (
    <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/30">
      <BrainCircuit className="h-8 w-8 text-primary-foreground" />
    </div>
  );
}
