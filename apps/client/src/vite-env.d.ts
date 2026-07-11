/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_Backend_Base_url: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
