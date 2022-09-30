const defaultPollIntervalSeconds = 3;

export async function poll<T>(
  fetchFn: () => Promise<T>,
  conditionFn: (response: T) => boolean,
  intervalSeconds: number = defaultPollIntervalSeconds
): Promise<T> {
  let result = await fetchFn();
  while (conditionFn(result)) {
    await wait(intervalSeconds * 1000);
    result = await fetchFn();
  }
  return result;
}

export const wait = function (ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
