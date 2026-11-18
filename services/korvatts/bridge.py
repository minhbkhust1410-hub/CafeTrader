"""Loopback-only KorvaTTS bridge for CafeTrader.

Start this process on the same machine as the CafeTrader Node server. It does
not expose CORS and intentionally does not accept reference audio or cloning.
"""

from io import BytesIO
from threading import Lock

import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from korvatts import TTS

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
engine = TTS()
engine_lock = Lock()

ALLOWED_VOICES = {
    "bao_kim", "gia_bao", "khanh_vy", "hoang_nam", "ngoc_huyen",
    "huu_dat", "phuong_linh", "quang_huy", "quynh_nhu", "thanh_phong",
}


class SynthesisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    voice: str = Field(default="khanh_vy")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


@app.get("/health")
def health():
    return {"ok": True, "engine": "KorvaTTS", "voices": sorted(ALLOWED_VOICES)}


@app.post("/synthesize")
def synthesize(payload: SynthesisRequest):
    if payload.voice not in ALLOWED_VOICES:
        raise HTTPException(status_code=400, detail="Unknown Korva voice")
    with engine_lock:
        waveform, _ = engine.synthesize(
            payload.text, voice=payload.voice, lang="vi", total_steps=32, speed=payload.speed
        )
    output = BytesIO()
    # KorvaTTS outputs 44.1 kHz audio; retain its native sampling rate.
    sf.write(output, waveform, 44_100, format="WAV", subtype="PCM_16")
    return Response(content=output.getvalue(), media_type="audio/wav")
