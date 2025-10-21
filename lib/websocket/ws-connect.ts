const getConnectionMemo = () => {
  const cache: Record<string, WebSocket> = {};
  return (url: string) => {
    if (cache[url]) {
      return cache[url];
    } else {
      const connection = new WebSocket(url);
      cache[url] = connection;
      return connection;
    }
  };
};

export const WSConnect = getConnectionMemo();
