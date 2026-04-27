/**
 * CSS Module proxy — returns the class name string as-is so JSX className
 * props still have a value (never undefined) during tests.
 */
const handler: ProxyHandler<Record<string, string>> = {
  get(_target, prop: string) {
    return prop;
  },
};

export default new Proxy({} as Record<string, string>, handler);
