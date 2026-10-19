import { customFetch } from './api';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * Executes a GraphQL query or mutation against the backend /graphql endpoint.
 */
export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const result = await customFetch<GraphQLResponse<T>>('/graphql', {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  });

  if (result.errors && result.errors.length > 0) {
    const errorMsg = result.errors.map(e => e.message).join(', ');
    const lower = errorMsg.toLowerCase();
    if (
      lower.includes('deactivat') ||
      lower.includes('authentication required') ||
      lower.includes('session expired') ||
      lower.includes('unauthorized')
    ) {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/app')) {
        window.location.href = '/login';
      }
    }
    throw new Error(errorMsg || 'GraphQL operation failed');
  }

  if (!result.data) {
    throw new Error('No data received from GraphQL server');
  }

  return result.data;
}
