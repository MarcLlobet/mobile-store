import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Button } from "@/components/primitives/Button";

import { ErrorBoundary } from "./ErrorBoundary";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

interface ErrorBoundaryStoryArgs {
  throwing: boolean;
  errorMessage: string;
  fallbackText: string;
  showErrorMessage: boolean;
  onError: (error: Error) => void;
}

const Child = ({ throwing, errorMessage }: { throwing: boolean; errorMessage: string }) => {
  if (throwing) {
    throw new Error(errorMessage);
  }
  return <p>The child rendered without throwing.</p>;
};

const meta: Meta<ErrorBoundaryStoryArgs> = {
  title: "Shared/ErrorBoundary",
  argTypes: {
    throwing: { control: "boolean" },
    errorMessage: { control: "text" },
    fallbackText: { control: "text" },
    showErrorMessage: { control: "boolean" },
  },
  args: {
    throwing: true,
    errorMessage: "The product feed came back malformed.",
    fallbackText: "This product could not be shown.",
    showErrorMessage: false,
    onError: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<ErrorBoundaryStoryArgs>();
    return (
      <ErrorBoundary
        key={String(args.throwing)}
        onError={(error) => {
          args.onError(error);
        }}
        fallback={(error, reset) => (
          <div role="alert" style={{ display: "grid", gap: 12, justifyItems: "start" }}>
            <p>{args.fallbackText}</p>
            {args.showErrorMessage ? <code>{error.message}</code> : null}
            <Button
              variant="standard"
              onClick={() => {
                updateArgs({ throwing: false });
                reset();
              }}
            >
              Try again
            </Button>
          </div>
        )}
      >
        <Child throwing={args.throwing} errorMessage={args.errorMessage} />
      </ErrorBoundary>
    );
  },
};

export default meta;

export const Playground: StoryObj<ErrorBoundaryStoryArgs> = {};
