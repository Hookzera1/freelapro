export function clearStorage() {
  // Limpar token do localStorage e cookies
  localStorage.removeItem('authToken');
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Limpar outros dados específicos de autenticação se necessário
  const authKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('firebase:') || 
    key.includes('auth') || 
    key.includes('user')
  );
  
  authKeys.forEach(key => localStorage.removeItem(key));
  
  // Não limpar todo o sessionStorage, apenas dados específicos
  const sessionAuthKeys = Object.keys(sessionStorage).filter(key =>
    key.startsWith('firebase:') || 
    key.includes('auth') || 
    key.includes('user')
  );
  
  sessionAuthKeys.forEach(key => sessionStorage.removeItem(key));
} 