const revoked = new Set<string>();

export function revokeToken(tokenId: string): void {
  revoked.add(tokenId);
}

export function isTokenRevoked(tokenId: string): boolean {
  return revoked.has(tokenId);
}
