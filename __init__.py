"""Neural Underground: visual workbench and a text result sink.
No model downloads, package installation, or network calls at import time.
"""

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

NODE_CLASS_MAPPINGS = {"NUTextResult": NUTextResult}
NODE_DISPLAY_NAME_MAPPINGS = {"NUTextResult": "Neural · Resultado de texto"}
WEB_DIRECTORY = "./web"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
