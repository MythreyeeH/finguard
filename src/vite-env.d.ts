/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  // add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
