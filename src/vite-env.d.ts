/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VIET_TTS_ENGINE?: 'korva';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
