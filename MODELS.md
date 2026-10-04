# Neural Underground models

Total without duplicates: **~182 GB**. You don't need everything: download only the models for the modules you want to use.

Subfolders don't matter: if a model lives in `models/loras/ZImage/…`, the panel finds it by file name.

**El Implante (02)** blends two Z-Image LoRAs: the ones below are the defaults, but you can pick any Z-Image LoRA you
have from the panel itself.

Each model's license is listed in [LICENCIAS.md](LICENCIAS.md) (Spanish).

### 01 · The Scanner

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `yolox_l.onnx` | `(automatic)` | 0.2 GB | downloads automatically |
| `dw-ll_ucoco_384.onnx` | `(automatic)` | 0.1 GB | downloads automatically |
| `qwen3vl_8b_int8_convrot.safetensors` | `text_encoders` | 9.4 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image-2.1/resolve/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors) |

### 02 · The Implant

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `z_image_turbo_bf16.safetensors` | `diffusion_models` | 12.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors) |
| `cyberNoirDetective.safetensors` | `loras` | 0.1 GB | author's own LoRA · optional, use any Z-Image LoRA |
| `REDZ15_DetailDaemonZ_lora_v1.1.safetensors` | `loras` | 0.1 GB | [⬇](https://huggingface.co/RunningHubAI/rh-detaildeamonz-sliderlora-for-zimageturbo-redz1.5-lora/resolve/main/REDZ15_DetailDaemonZ_lora_v1.1.safetensors) |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors) |
| `ae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors) |

### 03 · The Sectors

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `qwen_image_2512_fp8_e4m3fn.safetensors` | `diffusion_models` | 20.4 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_2512_fp8_e4m3fn.safetensors) |
| `Qwen-Image-2512-Lightning-8steps-V1.0-bf16.safetensors` | `loras` | 0.8 GB | [⬇](https://huggingface.co/lightx2v/Qwen-Image-2512-Lightning/resolve/main/Qwen-Image-2512-Lightning-8steps-V1.0-bf16.safetensors) |
| `qwen_2.5_vl_7b_fp8_scaled.safetensors` | `text_encoders` | 9.4 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors) |
| `qwen_image_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors) |

### 04 · The Escape

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `qwen_image_edit_2511_int8_convrot.safetensors` | `diffusion_models` | 20.5 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors) |
| `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors` | `loras` | 0.8 GB | [⬇](https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning/resolve/main/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors) |
| `qwen_2.5_vl_7b_fp8_scaled.safetensors` | `text_encoders` | 9.4 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors) |
| `qwen_image_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors) |

### 05 · The Isolator

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `birefnet.safetensors` | `background_removal` | 0.4 GB | [⬇](https://huggingface.co/Comfy-Org/BiRefNet/resolve/main/background_removal/birefnet.safetensors) |

### 06 · The Mutation

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `qwen_image_edit_2511_int8_convrot.safetensors` | `diffusion_models` | 20.5 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors) |
| `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors` | `loras` | 0.8 GB | [⬇](https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning/resolve/main/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors) |
| `qwen_2.5_vl_7b_fp8_scaled.safetensors` | `text_encoders` | 9.4 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors) |
| `qwen_image_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors) |

### 07 · The Double

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `z_image_turbo_bf16.safetensors` | `diffusion_models` | 12.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors) |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors) |
| `ae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors) |

### 08 · The Bridge

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `wan2.2_i2v_high_noise_14B_fp8_scaled.safetensors` | `diffusion_models` | 14.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/diffusion_models/wan2.2_i2v_high_noise_14B_fp8_scaled.safetensors) |
| `wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors` | `diffusion_models` | 14.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/diffusion_models/wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors) |
| `wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors` | `loras` | 1.2 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/loras/wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors) |
| `wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors` | `loras` | 1.2 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/loras/wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors) |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `text_encoders` | 6.7 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors) |
| `wan_2.1_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors) |

### 09 · The Orbit

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `wan2.2_fun_camera_high_noise_14B_fp8_scaled.safetensors` | `diffusion_models` | 15.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/diffusion_models/wan2.2_fun_camera_high_noise_14B_fp8_scaled.safetensors) |
| `wan2.2_fun_camera_low_noise_14B_fp8_scaled.safetensors` | `diffusion_models` | 15.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/diffusion_models/wan2.2_fun_camera_low_noise_14B_fp8_scaled.safetensors) |
| `wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors` | `loras` | 1.2 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/loras/wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors) |
| `wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors` | `loras` | 1.2 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/loras/wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors) |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `text_encoders` | 6.7 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors) |
| `wan_2.1_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors) |

### 10 · The Chronicler

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `film_net_fp16.safetensors` | `frame_interpolation` | 0.1 GB | [⬇](https://huggingface.co/Comfy-Org/frame_interpolation/resolve/main/frame_interpolation/film_net_fp16.safetensors) |

### 11 · The Tailor

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `qwen_image_edit_2511_int8_convrot.safetensors` | `diffusion_models` | 20.5 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_edit_2511_int8_convrot.safetensors) |
| `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors` | `loras` | 0.8 GB | [⬇](https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning/resolve/main/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors) |
| `qwen_2.5_vl_7b_fp8_scaled.safetensors` | `text_encoders` | 9.4 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors) |
| `qwen_image_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors) |

### 12 · The Composer

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `ace_step_1.5_turbo_aio.safetensors` | `checkpoints` | 10.0 GB | [⬇](https://huggingface.co/Comfy-Org/ace_step_1.5_ComfyUI_files/resolve/main/checkpoints/ace_step_1.5_turbo_aio.safetensors) |
| `acestep_v1.5_xl_sft_bf16.safetensors` | `diffusion_models` | 10.0 GB | [⬇](https://huggingface.co/Comfy-Org/ace_step_1.5_ComfyUI_files/resolve/main/split_files/diffusion_models/acestep_v1.5_xl_sft_bf16.safetensors) |
| `qwen_0.6b_ace15.safetensors` | `text_encoders` | 1.2 GB | [⬇](https://huggingface.co/Comfy-Org/ace_step_1.5_ComfyUI_files/resolve/main/split_files/text_encoders/qwen_0.6b_ace15.safetensors) |
| `qwen_4b_ace15.safetensors` | `text_encoders` | 8.4 GB | [⬇](https://huggingface.co/Comfy-Org/ace_step_1.5_ComfyUI_files/resolve/main/split_files/text_encoders/qwen_4b_ace15.safetensors) |
| `ace_1.5_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/ace_step_1.5_ComfyUI_files/resolve/main/split_files/vae/ace_1.5_vae.safetensors) |
