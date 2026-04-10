import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense, useMemo } from "react";
import { graphql, useLazyLoadQuery, RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { LibraryGrid } from "./LibraryGrid.js";
import type { LibraryGridStoryQuery } from "../relay/__generated__/LibraryGridStoryQuery.graphql.js";

const STORY_QUERY = graphql`
  query LibraryGridStoryQuery($libraryId: ID!) {
    node(id: $libraryId) {
      ... on Library {
        ...LibraryGrid_library
      }
    }
  }
`;

interface StoryArgs {
  videoCount: number;
}

function LibraryGridLoader() {
  const data = useLazyLoadQuery<LibraryGridStoryQuery>(STORY_QUERY, { libraryId: "Library:mock" });
  if (!data.node) return null;
  return <LibraryGrid library={data.node} />;
}

function LibraryGridStory({ videoCount }: StoryArgs) {
  const env = useMemo(() => {
    const e = createMockEnvironment();
    e.mock.queueOperationResolver((op) =>
      MockPayloadGenerator.generate(op, {
        Library() {
          return {
            videos: {
              edges: Array.from({ length: videoCount }, (_, i) => ({
                node: {
                  id: `Video:mock-${i}`,
                  title: `Video Title ${i + 1}`,
                  durationSeconds: 3600 + i * 300,
                  videoStream: { height: i % 3 === 0 ? 2160 : 1080 },
                },
              })),
            },
          };
        },
      })
    );
    return e;
  }, [videoCount]);

  return (
    <RelayEnvironmentProvider environment={env}>
      <Suspense fallback={null}>
        <LibraryGridLoader />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

const meta: Meta<StoryArgs> = {
  title: "Components/LibraryGrid",
  component: LibraryGridStory as never,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  args: { videoCount: 12 },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {};
export const SingleVideo: Story = { args: { videoCount: 1 } };
export const ManyVideos: Story = { args: { videoCount: 48 } };
export const Empty: Story = { args: { videoCount: 0 } };
