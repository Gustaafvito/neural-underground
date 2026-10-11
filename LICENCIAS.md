# Neural Underground · licencias (11-oct-2026)

Revisado contra las fichas de Hugging Face y Civitai y los textos de licencia originales. No es asesoría legal.

Leyenda: ✅ sin problema

## Por módulo

| # | Módulo | Modelos | Licencia | Estado |
|---|---|---|---|---|
| 01 | El Escáner | Qwen3-VL 8B · DWPose / YOLOX | Apache 2.0 | ✅ |
| 02 | El Implante | Z-Image Turbo · Qwen3 4B · VAE `ae` | Apache 2.0 | ✅ |
|    |  | LoRA DetailDaemonZ (RunningHub) | Civitai: uso comercial, derivados y sin crédito permitidos | ✅ |
|    |  | LoRA cyberNoirDetective | LoRA propio del autor | ✅ |
| 03 | Los Sectores | **Qwen-Image-2512** + Lightning 4 pasos · Qwen2.5-VL 7B — 04-oct, antes Qwen Image 2.1 | Apache 2.0 | ✅ |
| 04 | La Fuga | **Qwen-Image-Edit-2511** + Lightning 4 pasos — 04-oct, antes Flux Fill OneReward (CC-BY-NC + FLUX no comercial) | Apache 2.0 | ✅ |
| 05 | El Aislante | BiRefNet | MIT | ✅ |
| 06 | La Mutación | **Qwen-Image-Edit-2511** + Lightning — 04-oct, antes Qwen Image 2.1 (Qwen Research) | Apache 2.0 | ✅ |
| 07 | El Doble | Z-Image Turbo | Apache 2.0 | ✅ |
| 08 | El Puente | Wan 2.2 I2V 14B · LoRAs lightx2v · umt5 | Apache 2.0 | ✅ |
| 09 | La Órbita | Wan 2.2 Fun Camera 14B · LoRAs lightx2v | Apache 2.0 | ✅ |
| 10 | El Cronista | FILM | Apache 2.0 | ✅ |
| 11 | El Sastre | **Qwen-Image-Edit-2511** + Lightning — 04-oct, antes Qwen Image 2.1 (Qwen Research) | Apache 2.0 | ✅ |
| 12 | El Compositor | ACE-Step 1.5 Turbo y XL · codificadores Qwen 0.6B / 4B | MIT · Apache 2.0 | ✅ |

**Por qué se cambió Qwen Image 2.1:** su licencia (*Qwen Research License*) solo permite uso «de investigación o
evaluación»; no cubre ni el uso creativo personal. Qwen-Image-Edit-2511 y Qwen-Image-2512, de la misma familia, son Apache 2.0.

Nota: el codificador `qwen3vl_8b_int8_convrot` de El Escáner se descarga del repo de Comfy-Org de Qwen Image 2.1, pero es
Qwen3-VL 8B (Apache 2.0), no el modelo de imagen.

## Audio del panel (incluido en el pack)

| Qué | Cómo se hizo | Estado |
|---|---|---|
| Tema de El Nexo, 12 canciones de portada y 12 ambientes (`web/audio`) | Generados por el autor con ACE-Step 1.5 XL (MIT / Apache 2.0) | ✅ |
| 12 voces de bienvenida (`web/audio/voz_*.mp3`) | Creadas por el autor con ElevenLabs, plan Starter (licencia comercial) | ✅ |

## Nodos

| Nodo | Licencia | Módulos |
|---|---|---|
| comfyui_controlnet_aux | Apache 2.0 | 01 |
| Todo lo demás | nodos nativos de ComfyUI (GPL-3.0) | — |

## Fuentes
- Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Qwen-Image-2512: https://huggingface.co/Qwen/Qwen-Image-2512
- Qwen Image 2.1 (licencia de investigación): https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Flux Fill OneReward (CC-BY-NC 4.0): https://huggingface.co/bytedance-research/OneReward
- DetailDaemonZ: https://civitai.com/models/2209262
- ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
