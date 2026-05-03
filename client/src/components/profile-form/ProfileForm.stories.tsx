import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { withLayout } from "~/storybook/withLayout.js";
import { withRelay } from "~/storybook/withRelay.js";

import { ProfileForm, type ProfileFormValues } from "./ProfileForm.js";

interface WrapperProps {
  mode: "create" | "edit";
  initial: ProfileFormValues;
  title: string;
  eyebrow: string;
  submitLabel: string;
  subtitle?: string;
}

const ProfileFormWrapper = ({
  mode,
  initial,
  title,
  eyebrow,
  submitLabel,
  subtitle,
}: WrapperProps): JSX.Element => (
  <ProfileForm
    mode={mode}
    initial={initial}
    crumbs={[mode === "create" ? "new profile" : "edit profile"]}
    title={title}
    eyebrow={eyebrow}
    subtitle={subtitle}
    submitLabel={submitLabel}
    onSubmit={(values) => {
      // eslint-disable-next-line no-console
      console.log("submit", values);
    }}
    onDelete={
      mode === "edit"
        ? () => {
            // eslint-disable-next-line no-console
            console.log("delete");
          }
        : undefined
    }
  />
);

const meta: Meta<WrapperProps> = {
  title: "Components/ProfileForm",
  component: ProfileFormWrapper,
  decorators: [withRelay, withLayout({ width: "100vw", height: "100vh" })],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<WrapperProps>;

export const CreateMode: Story = {
  args: {
    mode: "create",
    initial: {
      name: "",
      path: "",
      mediaType: "MOVIES",
      extensions: [".mkv", ".mp4", ".avi", ".mov", ".m4v"],
    },
    title: "New library",
    eyebrow: "create",
    submitLabel: "Create",
  },
};

export const EditMode: Story = {
  args: {
    mode: "edit",
    initial: {
      name: "Films / 4K UHD",
      path: "/media/films/4k",
      mediaType: "MOVIES",
      extensions: [".mkv", ".mp4"],
    },
    title: "Edit library",
    eyebrow: "edit",
    submitLabel: "Save",
    subtitle: "Update library settings or remove it from your shelf.",
  },
};
