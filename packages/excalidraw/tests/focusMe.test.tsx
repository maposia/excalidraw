import { vi } from "vitest";

import { Excalidraw } from "../index";

import { UI } from "./helpers/ui";
import { render, unmountComponent } from "./test-utils";

unmountComponent();

describe("focus me", () => {
  it("renders admin-only focus button and calls callbacks", async () => {
    const onFocusMe = vi.fn();
    const onFocusMeFromAPI = vi.fn();

    await render(
      <Excalidraw
        isAdmin={true}
        onFocusMe={onFocusMe}
        onExcalidrawAPI={(api) => {
          api?.onFocusMe(onFocusMeFromAPI);
        }}
      />,
    );

    UI.clickOnTestId("toolbar-focus-me");

    expect(onFocusMe).toHaveBeenCalledTimes(1);
    expect(onFocusMeFromAPI).toHaveBeenCalledTimes(1);
  });

  it("does not render focus button for non-admin users", async () => {
    await render(<Excalidraw />);

    expect(document.querySelector("[data-testid='toolbar-focus-me']")).toBeNull();
  });
});
