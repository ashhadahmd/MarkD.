declare module 'murmurhash3js' {
  export const x64: {
    hash128: (val: string, seed?: number) => string;
  };
}
