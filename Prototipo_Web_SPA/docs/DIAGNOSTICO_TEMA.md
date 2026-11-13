# Diagnóstico del modo oscuro

Si el modo oscuro "no se pone", abrí la consola (F12 > Console), pegá esto y apretá Enter **después** de tocar el interruptor:

```js
[
  'versión cargada: ' + window.APP_BUILD,
  'clase dark en <html>: ' + document.documentElement.classList.contains('dark'),
  'fondo del body: ' + getComputedStyle(document.body).backgroundColor,
  'clave de tema guardada: ' + localStorage.getItem('callejeros_theme'),
  'reglas .dark cargadas desde style.css: ' + [...document.styleSheets].reduce((n, s) => { try { return n + [...s.cssRules].filter(r => r.selectorText && r.selectorText.includes('.dark')).length } catch (e) { return n } }, 0)
].join('\n')
```

Cómo leer el resultado (con el modo oscuro activado):

| Resultado | Qué significa |
|---|---|
| `versión cargada: undefined` | El navegador sirve un `index.html` viejo (caché). Usá `python3 serve.py` y Ctrl+Shift+R. |
| `clase dark: false` | El interruptor no llegó a cambiar el tema: hay un error de JavaScript (mirá la pestaña Console en rojo). |
| `clase dark: true`, `fondo del body: rgb(235, 235, 235)` y `reglas .dark` de **0 o 1** | `style.css` está cacheado (versión vieja) o no cargó. Ctrl+Shift+R y servir con `serve.py`. |
| `clase dark: true`, `fondo del body: rgb(30, 30, 30)` y `reglas .dark` alrededor de **54** | El tema SÍ está aplicado. |
