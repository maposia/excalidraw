import { fireEvent, render } from "@excalidraw/excalidraw/tests/test-utils";

import ExcalidrawApp from "../App";

describe("Test LanguageList", () => {
  it("does not render the language selector in the app main menu", async () => {
    await render(<ExcalidrawApp />);

    fireEvent.click(document.querySelector(".dropdown-menu-button")!);

    expect(document.querySelector(".dropdown-select__language")).toBeNull();
  });
});
