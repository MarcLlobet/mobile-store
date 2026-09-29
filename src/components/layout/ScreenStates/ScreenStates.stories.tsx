import { fn } from "storybook/test";

import ErrorScreen from "@/app/error";
import ListingLoading from "@/app/loading";
import NotFound from "@/app/not-found";
import DetailLoading from "@/app/phones/[id]/loading";
import { ApiError } from "@/lib/api/api";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta = {
  title: "Screens/States",
  parameters: { layout: "fullscreen" },
};

export default meta;

export const ListingSkeleton: StoryObj = { render: () => <ListingLoading /> };

export const DetailSkeleton: StoryObj = { render: () => <DetailLoading /> };

export const NotFoundScreen: StoryObj = { render: () => <NotFound /> };

export const GenericError: StoryObj = {
  render: () => <ErrorScreen error={new Error("boom")} reset={fn()} />,
};

export const ApiUnreachable: StoryObj = {
  render: () => <ErrorScreen error={new ApiError("fetchProducts failed", 503)} reset={fn()} />,
};

export const ProductGone: StoryObj = {
  render: () => <ErrorScreen error={new ApiError("fetchProductById failed", 404)} reset={fn()} />,
};
