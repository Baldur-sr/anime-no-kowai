# ANIME NO KOWAI — Git + GitHub + GitHub Pages desde VS Code

## 1. Instalar Git

Descarga Git: https://git-scm.com/

En Visual Studio Code, abre la carpeta `anime-no-kowai` y abre **Terminal > New Terminal**.

Comprueba:

```bash
git --version
```

Configura tu nombre y correo una sola vez:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@example.com"
```

## 2. Crear el repositorio en GitHub

En GitHub crea un repositorio llamado `anime-no-kowai`.

Copia la URL HTTPS, que tendrá una forma parecida a:

```text
https://github.com/TU-USUARIO/anime-no-kowai.git
```

## 3. Subir el proyecto desde VS Code

En la terminal, estando dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primer commit: ANIME NO KOWAI"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/anime-no-kowai.git
git push -u origin main
```

Después entra a GitHub y verifica que aparezcan `index.html`, `styles.css`, `script.js`, `admin.html`, `README.md` y la carpeta `assets`.

## 4. Publicar en GitHub Pages

En el repositorio de GitHub:

1. Abre **Settings**.
2. En la barra lateral entra a **Pages**.
3. En **Build and deployment** selecciona **Deploy from a branch**.
4. En **Branch** selecciona `main` y la carpeta `/(root)`.
5. Pulsa **Save**.
6. Espera a que termine la publicación y entra al enlace que GitHub muestre.

GitHub documenta actualmente este flujo para publicar desde una rama. También puedes consultar la sección de GitHub Pages de su documentación oficial.

## 5. Cada vez que hagas cambios

```bash
git add .
git commit -m "Actualiza diseño y contenido"
git push
```

## 6. Comprobaciones antes de entregar

- Abre `index.html` y prueba el menú.
- Comprueba que cargue el catálogo.
- Prueba el buscador.
- Abre una ficha.
- Prueba el formulario.
- Abre `admin.html`.
- Comprueba la versión móvil.
- En GitHub verifica el repositorio y Pages.
- Sustituye en el informe la URL pendiente por la URL real.

## Login de demostración

Usuario: `admin`

Contraseña: `Anime2026!`

> Es solo una demostración académica en el navegador. No es una autenticación real de servidor.
