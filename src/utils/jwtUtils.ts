export interface JwtPayload {
  sub: string;
  email: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
  role?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
}

export const decodeJwtToken = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const getRolesFromToken = (token: string): string[] => {
  const payload = decodeJwtToken(token);
  if (!payload) return [];

  // ASP.NET Core Identity stores roles in this claim
  const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  
  if (roles) {
    return Array.isArray(roles) ? roles : [roles];
  }
  
  // Fallback to standard role claim
  const standardRole = payload.role;
  if (standardRole) {
    return Array.isArray(standardRole) ? standardRole : [standardRole];
  }
  
  return [];
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtToken(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}; 