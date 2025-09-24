/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCESS_TOKEN_EXPIRE_MINUTES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}