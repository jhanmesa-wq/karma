# Merkadito Karma — Render + IA

## Desplegar
1. Sube estos archivos a un repositorio de GitHub.
2. En Render, crea **New + → Web Service** y conecta ese repositorio. También puedes usar el Blueprint `render.yaml`.
3. Build command: `npm install`; Start command: `npm start`.
4. En Render → Environment configura:
   - `AI_API_KEY`: tu token secreto del proveedor compatible con API de chat. Nunca lo pongas en `index.html` ni lo compartas.
   - `AI_MODEL`: modelo habilitado para tu cuenta (por defecto `gpt-4o-mini`).
   - `AI_BASE_URL`: `https://api.openai.com/v1` para OpenAI, o la URL base compatible del proveedor.
   - `AI_SYSTEM_PROMPT`: instrucciones que cambian la personalidad/reglas de la IA.
   - `AI_TEMPERATURE`: opcional, entre 0 y 1.5.
5. Pulsa Deploy. Render te dará una URL `https://...onrender.com`.

## Cómo funciona
- La ventana de Karma consulta `/api/chat`; el token solo vive en el entorno del servidor.
- Los botones de contacto abren el chat IA y los botones de compra/ABRIR usan los enlaces configurados en la página.
- `/health` permite comprobar el estado del servidor.
- Los enlaces se guardan en `localStorage` del navegador; no se sincronizan entre dispositivos ni visitantes.
- El login/panel admin original del HTML es solo del lado del navegador y NO es seguridad real para proteger operaciones o enlaces. No uses ese panel para secretos ni datos sensibles en producción. Para administración multiusuario real hace falta autenticar y guardar datos en backend.
- El botón “QUEMAR” apunta a un canal externo; úsalo para reportes responsables y no para publicar información personal o acusaciones sin verificar.
