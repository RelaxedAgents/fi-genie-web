import { getCurrentUser } from '@/lib/auth';

interface SSEMessage {
  type: 'stream_start' | 'progress_update' | 'agent_response' | 'final_analysis' | 'stream_complete';
  content?: string;
  data?: any;
}

interface AgentQueryOptions {
  query: string;
  variables?: Record<string, any>;
  onStreamStart?: () => void;
  onProgressUpdate?: (message: string) => void;
  onAgentResponse?: (response: string) => void;
  onFinalAnalysis?: (analysis: string) => void;
  onStreamComplete?: () => void;
  onError?: (error: Error) => void;
}

export async function queryAgent({
  query,
  variables = {},
  onStreamStart,
  onProgressUpdate,
  onAgentResponse,
  onFinalAnalysis,
  onStreamComplete,
  onError,
}: AgentQueryOptions): Promise<void> {
  try {
    // Get current user's phone number
    const currentUser = getCurrentUser();
    if (!currentUser?.phone) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(process.env.NEXT_PUBLIC_AGENT_QUERY_API!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Phone-Number': currentUser.phone,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            handleSSEMessage(data, {
              onStreamStart,
              onProgressUpdate,
              onAgentResponse,
              onFinalAnalysis,
              onStreamComplete,
            });
          } catch (e) {
            console.error('Failed to parse SSE message:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Agent query error:', error);
    onError?.(error as Error);
  }
}

function handleSSEMessage(
  message: SSEMessage,
  callbacks: {
    onStreamStart?: () => void;
    onProgressUpdate?: (message: string) => void;
    onAgentResponse?: (response: string) => void;
    onFinalAnalysis?: (analysis: string) => void;
    onStreamComplete?: () => void;
  }
) {
  switch (message.type) {
    case 'stream_start':
      callbacks.onStreamStart?.();
      break;
    
    case 'progress_update':
      if (message.content) {
        callbacks.onProgressUpdate?.(message.content);
      }
      break;
    
    case 'agent_response':
      if (message.content) {
        callbacks.onAgentResponse?.(message.content);
      }
      break;
    
    case 'final_analysis':
      if (message.content) {
        callbacks.onFinalAnalysis?.(message.content);
      }
      break;
    
    case 'stream_complete':
      callbacks.onStreamComplete?.();
      break;
  }
}

// Simple non-streaming version for testing
export async function queryAgentSimple(query: string): Promise<string> {
  const currentUser = getCurrentUser();
  if (!currentUser?.phone) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(process.env.NEXT_PUBLIC_AGENT_QUERY_API!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Phone-Number': currentUser.phone,
    },
    body: JSON.stringify({
      query,
      variables: {},
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || 'No response received';
}
