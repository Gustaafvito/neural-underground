# ◈ Neural Underground

**12 workflows de ComfyUI en un solo panel de estilo cyberpunk.** Imagen, edición, vídeo, interpolación y música: eliges un
módulo, rellenas cuatro controles claros y ejecutas, sin tocar un nodo. Y cuando quieras trastear, el workflow completo
está debajo.

*English version: [README_EN.md](README_EN.md)*

![Los doce módulos](docs/los_doce_modulos.jpg)

## Los módulos

| # | Módulo | Qué hace | Motor |
|---|---|---|---|
| 01 | **El Escáner** | Describe una imagen (para usarla como prompt) y saca el esqueleto de la pose | Qwen3-VL 8B · DWPose |
| 02 | **El Implante** | Texto → imagen mezclando hasta dos LoRAs de estilo | Z-Image Turbo |
| 03 | **Los Sectores** | Compone la imagen por mitades: qué va a la izquierda y qué a la derecha | Qwen-Image-2512 |
| 04 | **La Fuga** | Amplía la imagen por los bordes (outpainting) sin tocar el original | Qwen-Image-Edit-2511 |
| 05 | **El Aislante** | Quita el fondo y guarda un PNG transparente | BiRefNet |
| 06 | **La Mutación** | Edita una imagen con órdenes: «que sea de noche», «ponle un abrigo rojo» | Qwen-Image-Edit-2511 |
| 07 | **El Doble** | Cuatro variantes con la misma semilla y distinto sampler, para compararlos | Z-Image Turbo |
| 08 | **El Puente** | Vídeo entre dos imágenes (primer y último fotograma) | Wan 2.2 |
| 09 | **La Órbita** | Imagen → vídeo dirigiendo la cámara: zoom, giros, paneos | Wan 2.2 Fun Camera |
| 10 | **El Cronista** | Añade fotogramas para subir los FPS o hacer cámara lenta | FILM |
| 11 | **El Sastre** | Junta dos imágenes: una persona con la ropa, el objeto o el fondo de otra | Qwen-Image-Edit-2511 |
| 12 | **El Compositor** | Canciones completas con voz a partir de un estilo y una letra | ACE-Step 1.5 |

Los resultados se pasan de un módulo a otro con **«Enviar a…»**: describe una foto con El Escáner y mándala como prompt a
El Implante, edita con La Mutación y anímala con La Órbita… sin descargar ni volver a subir nada.

## Requisitos

- **ComfyUI 0.37 o más reciente.**
- **Gráfica de 16 GB de VRAM** y **32 GB de RAM**. Probado en una RTX 5070 Ti.
- **Disco:** unos 180 GB para los 12 módulos. Puedes instalar solo los que quieras.

## Instalación

1. **Copia Neural** dentro de `ComfyUI/custom_nodes`:
   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/Gustaafvito/neural-underground neural_underground
   ```
2. **Nodos:** casi todo es nativo de ComfyUI. Solo El Escáner (01) necesita
   [comfyui_controlnet_aux](https://github.com/Fannovel16/comfyui_controlnet_aux) (se instala con *ComfyUI-Manager →
   Install Missing Custom Nodes*).
3. **Descarga los modelos** de los módulos que quieras: lista con carpetas, tamaños y enlaces en **[MODELOS.md](MODELOS.md)**.
4. **Reinicia ComfyUI** y recarga el navegador (Ctrl+F5).

## Cómo se usa

- Pulsa el botón **◈ NEURAL** para abrir **El Nexo**, la pantalla con los 12 módulos.
- Elige un módulo, sube tu imagen o tu vídeo y ajusta sus controles (los prompts funcionan mejor en inglés).
- Ejecuta. Los resultados aparecen en el panel con su botón **«Enviar a…»**.
- **⌬ Ver nodos** muestra el workflow de ComfyUI que hay debajo; **⇩ Exportar JSON** lo guarda.

Los workflows también aparecen en el navegador de plantillas de ComfyUI, en la sección *neural_underground*.

## Licencias

- **Código, workflows e imágenes del panel:** [GPL-3.0](LICENSE), la misma que ComfyUI.
- **Modelos:** cada uno tiene la suya; todos los que usa Neural permiten uso libre (Apache 2.0 / MIT). Los descargas tú desde
  su página oficial. Detalle en [LICENCIAS.md](LICENCIAS.md).
- Las portadas de los módulos se han **generado con IA**.

## Créditos

- Modelos: Alibaba Qwen (Qwen3-VL, Qwen-Image), Tongyi-MAI (Z-Image), Wan-AI (Wan 2.2), lightx2v (Lightning), ZhengPeng7
  (BiRefNet), Google Research (FILM), ACE-Step, y RunningHub (LoRA DetailDaemonZ).
- Nodos: Fannovel16 (controlnet_aux) y el equipo de ComfyUI.

Hecho por **gustaafvito.creador.ia** · también de él: [La Casa Maldita](https://github.com/Gustaafvito/la-casa-maldita).
