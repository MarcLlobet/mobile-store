export const normalizeImageUrl = (url: string): string => {
  const urlObject = new URL(url);
  if (urlObject.protocol === "https:") {
    return url;
  }
  // eslint-disable-next-line functional/immutable-data
  urlObject.protocol = "https:";
  return urlObject.href;
};
