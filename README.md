# 🎮 10 JUGADORES, 10 DESAFÍOS

Juego web multijugador (hasta 10 personas) con salas privadas. GitHub Pages aloja la página; Firebase sincroniza salas, rondas y puntos.

Archivos: `index.html`, `style.css`, `script.js`, `firebase-config.js`, `database.rules.json`, `README.md`.

## 1. Descargar los archivos
Guarda los 6 archivos juntos en una carpeta (por ejemplo `juego`).

## 2. Crear el proyecto en Firebase
1. Entra a https://console.firebase.google.com e inicia sesión con tu cuenta de Google.
2. **Crear un proyecto** → ponle un nombre → puedes desactivar Google Analytics → **Crear**.

## 3. Configurar Realtime Database
1. Menú **Compilación → Realtime Database → Crear base de datos**.
2. Elige la ubicación y **Iniciar en modo bloqueado**.
3. Pestaña **Reglas**: borra todo, pega el contenido de `database.rules.json` y pulsa **Publicar**.

## 4. Activar la autenticación anónima
**Compilación → Authentication → Comenzar → Método de acceso → Anónimo → Habilitar → Guardar**.

## 5. Poner tus credenciales
1. **Configuración del proyecto** (engranaje) → **Tus apps** → icono web `</>` → registra la app (no necesitas Hosting).
2. Copia los valores de `firebaseConfig` en `firebase-config.js`.
3. Comprueba que `databaseURL` sea la que aparece en Realtime Database (arriba de los datos).

## 6. Subir a GitHub
1. Crea un repositorio público en https://github.com/new.
2. **Add file → Upload files**, sube los archivos (no la carpeta) y pulsa **Commit changes**.

## 7. Activar GitHub Pages
**Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `/ (root)` → Save**.

## 8. Obtener el enlace público
Tras 1–2 minutos aparece arriba en Pages: `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

## 9. Autorizar tu dominio en Firebase
**Authentication → Configuración → Dominios autorizados → Agregar dominio** → `TU_USUARIO.github.io`.

## 10. Jugar con otras 9 personas
1. Abre el enlace, escribe tu nombre, elige personaje y pulsa **CREAR SALA**.
2. Pulsa **Copiar código** y envíaselo (WhatsApp, etc.) junto con el enlace.
3. Los demás abren el enlace, ponen su nombre y el código, y pulsan **ENTRAR**.
4. Con 2 o más jugadores, el anfitrión (👑) pulsa **COMENZAR PARTIDA**.

## Cómo funciona
- Las rondas se calculan con la hora del servidor de Firebase, así que todos ven el mismo desafío y el mismo cronómetro.
- Si pierdes conexión y vuelves, reingresas automáticamente a tu sala.
- Cada ronda dura 18 s + 6 s de clasificación. Puntos: 100 por acierto + hasta 100 por rapidez (el desafío final vale doble).

## Seguridad y límites
- Solo entra a una sala quien conoce su código; no se pueden listar salas.
- Cada jugador solo puede escribir sus propios datos; solo el anfitrión crea rondas; las respuestas no se pueden reescribir; los puntos solo suben y con tope por jugada.
- Al ser un juego sin servidor propio, un jugador técnico podría leer las respuestas desde la base de datos. Para torneos serios habría que calcular puntos con Cloud Functions.
