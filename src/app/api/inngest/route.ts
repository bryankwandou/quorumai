import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { runDeliberationFunction } from '@/inngest/functions/runDeliberation';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runDeliberationFunction,
  ],
});
