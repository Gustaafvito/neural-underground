"""Neural Underground: visual workbench and a text result sink.
No model downloads, package installation, or network calls at import time.
"""
import json
import os
import re
import struct


class NUTextResult:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {"text": ("STRING", {"forceInput": True})}}
    RETURN_TYPES = ()
    FUNCTION = "show"
    CATEGORY = "Neural Underground"
    OUTPUT_NODE = True

    def show(self, text):
        return {"ui": {"text": [str(text)]}}


# ── LoRAs de Z-Image: el panel de El Implante solo enseña estos, con su palabra clave si la traen ──
_CACHE = {}


def _cabecera(path):
    with open(path, "rb") as f:
        n = struct.unpack("<Q", f.read(8))[0]
        if n > 50_000_000:
            raise ValueError("cabecera demasiado grande")
        return json.loads(f.read(n))


def _info_lora(path):
    """{'zimage': bool, 'trigger': str|None} leyendo solo la cabecera del .safetensors."""
    clave = (path, os.path.getmtime(path))
    if clave in _CACHE:
        return _CACHE[clave]
    h = _cabecera(path)
    meta = h.pop("__metadata__", None) or {}
    texto = (str(meta.get("ss_base_model_version", "")) + " " + str(meta.get("modelspec.architecture", ""))).lower()
    zimage = "zimage" in texto.replace("-", "").replace("_", "")
    if not zimage:
        # huella de capas: atención de 3840 de ancho en bloques "layers.N" (Z-Image, sin metadatos)
        for k, v in h.items():
            if re.search(r"layers[._]\d+[._]attention[._]to_[kqv]", k) and ("lora_down" in k or "lora_A" in k):
                zimage = (v.get("shape") or [0, 0])[-1] == 3840
                break
    trigger = None
    try:
        tags = json.loads(meta.get("ss_tag_frequency", "{}"))
        todos = [t for d in tags.values() for t in d]
        if len(todos) == 1:            # un único «tag» = la palabra clave con la que se entrenó
            trigger = todos[0].strip()
    except Exception:
        pass
    info = {"zimage": zimage, "trigger": trigger}
    _CACHE[clave] = info
    return info


try:
    import folder_paths
    from aiohttp import web
    from server import PromptServer

    @PromptServer.instance.routes.get("/neural_underground/loras_zimage")
    async def _loras_zimage(request):
        out = {}
        for name in folder_paths.get_filename_list("loras"):
            if not name.lower().endswith(".safetensors"):
                continue
            path = folder_paths.get_full_path("loras", name)
            try:
                info = _info_lora(path)
            except Exception:
                continue
            if info["zimage"]:
                out[name] = {"trigger": info["trigger"]}
        return web.json_response(out)
except Exception:  # sin servidor (p. ej. al importar en pruebas): solo el nodo
    pass


NODE_CLASS_MAPPINGS = {"NUTextResult": NUTextResult}
NODE_DISPLAY_NAME_MAPPINGS = {"NUTextResult": "Neural · Resultado de texto"}
WEB_DIRECTORY = "./web"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
