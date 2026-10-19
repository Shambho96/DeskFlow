import { customFetch, tryRefreshToken } from './api';

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
 * Seamlessly handles silent session refreshes for expired access tokens.
 */
export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>,
  isRetry: boolean = false
): Promise<T> {
  const result = await customFetch<GraphQLResponse<T>>('/graphql', {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  });

  if (result.errors && result.errors.length > 0) {
    const errorMsg = result.errors.map(e => e.message).join(', ');
    const lower = errorMsg.toLowerCase();

    // 1. If account was explicitly deactivated, notify app cleanly
    if (lower.includes('deactivat')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired', { detail: { message: errorMsg } }));
      }
      throw new Error(errorMsg);
    }

    // 2. If token expired, attempt silent token refresh and retry the query once
    if (
      !isRetry &&
      (lower.includes('authentication required') || lower.includes('session expired') || lower.includes('unauthorized'))
    ) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return graphqlRequest<T>(query, variables, true);
      } else {
        // Refresh token failed or is expired: notify app cleanly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-expired', { detail: { message: errorMsg } }));
        }
      }
    }

    throw new Error(errorMsg || 'GraphQL operation failed');
  }

  if (!result.data) {
    throw new Error('No data received from GraphQL server');
  }

  return result.data;
}
