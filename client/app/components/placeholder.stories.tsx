import type { Meta, StoryObj } from "@storybook/react";

function Placeholder() {
  return (
    <div className="p-8 text-center text-gray-500">
      <p>Add components to see stories here.</p>
    </div>
  );
}

const meta = {
  title: "Placeholder",
  component: Placeholder,
} satisfies Meta<typeof Placeholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
