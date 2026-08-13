// Service Worker do RTM Limp — PWA V1 (só "app shell" estático, sem dado offline).
//
// Segurança multi-tenant: só cacheia GET pra assets estáticos com nome versionado
// por hash (lista de prefixos abaixo). Tudo o mais — páginas, Server Actions,
// /api/* — nunca é interceptado, então nunca é cacheado. Isso elimina por
// construção o risco de a Empresa B herdar dado cacheado da Empresa A no mesmo
// aparelho: nenhuma resposta com dado de negócio passa por este arquivo.
//
// Versionamento: mude CACHE_NAME (ex: -v2) quando alterar a LÓGICA deste arquivo
// (não quando só o conteúdo dos assets muda — isso já é resolvido pelo hash no
// nome do arquivo). O activate() abaixo apaga qualquer cache com nome diferente
// do atual, limpando versões antigas automaticamente.
const CACHE_NAME = "rtm-limp-static-v1";

const STATIC_PATH_PREFIXES = ["/_next/static/", "/icons/"];

function isCacheableStaticAsset(url) {
  return STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só GET pode ser cacheado — Server Actions e mutations são sempre POST e
  // nunca chegam aqui, mas a checagem fica explícita por segurança.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Nunca mexe em requisições de outra origem.
  if (url.origin !== self.location.origin) return;

  // Fora da lista de prefixos = network only (páginas, /api/*, tudo que não
  // seja explicitamente um asset estático versionado).
  if (!isCacheableStaticAsset(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }),
  );
});
