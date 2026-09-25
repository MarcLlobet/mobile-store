import {
  type DehydratedState,
  type QueryExecuteOptions,
  type QueryKey,
  dehydrate,
} from "@tanstack/react-query";

import { makeQueryClient } from "./queryClient";

export const fetchAndDehydrate = async <
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: QueryExecuteOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
): Promise<{ readonly data: TData; readonly state: DehydratedState }> => {
  const queryClient = makeQueryClient();
  const data = await queryClient.query(options);
  return { data, state: dehydrate(queryClient) };
};
