/**
 * Standard server response type for Next.js server actions
 * @template T The expected return data type
 */
export interface ServerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Standard structure for Next.js server actions
 * 
 * @template T The expected return data type
 * @param {any} params The parameters required for the server action
 * @returns {Promise<ServerResponse<T>>} A standardized server response
 */
export async function createServerAction<T>(
  actionFn: () => Promise<T>
): Promise<ServerResponse<T>> {
  try {
    // 1. Input validation handled by caller
    
    // 2. Business logic
    const result = await actionFn();
    
    // 3. Return successful response
    return {
      success: true,
      data: result,
      status: 200
    };
  } catch (error: any) {
    // 4. Error handling
    console.error('Server action failed:', error);
    
    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      // Map specific Prisma errors to appropriate responses
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Resource not found',
          status: 404
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: error.message || 'Operation failed',
      status: 500
    };
  }
}
