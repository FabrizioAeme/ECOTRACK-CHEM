export function crearJwtPrueba(datos: Record<string, unknown>, segundosDeVida = 3600): string {
  const codificar = (objeto: object) =>
    btoa(JSON.stringify(objeto)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const ahora = Math.floor(Date.now() / 1000);
  const payload = { iat: ahora, exp: ahora + segundosDeVida, ...datos };
  return `${codificar({ alg: 'HS256', typ: 'JWT' })}.${codificar(payload)}.firma`;
}

export function limpiarCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const nombre = cookie.split('=')[0].trim();
    if (nombre) {
      document.cookie = `${nombre}=; path=/; max-age=0`;
    }
  });
}
