declare global {
  interface Window {
    /** Set by the navigation spec to prove the header node survives a route change. */
    __header?: Element | null;
    /** Filled by an init script to record what took part in each view transition. */
    __transitions?: { named: string[] }[];
  }
}

export {};
