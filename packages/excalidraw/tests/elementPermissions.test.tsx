import { actionSelectAll } from "../actions";
import { getElementsWithinSelection } from "../scene";
import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { act, render, unmountComponent } from "./test-utils";

unmountComponent();

const h = window.h;

const filledElementProps = {
  backgroundColor: "red",
  fillStyle: "solid",
} as const;

const renderWithOwnElementPermissions = async (isAdmin = false) => {
  await render(
    <Excalidraw
      authorId="current-user"
      canOnlyEditOwnElement={true}
      isAdmin={isAdmin}
    />,
  );
  API.setElements([]);
};

describe("element permissions", () => {
  it("selectAll selects only editable own elements", async () => {
    await renderWithOwnElementPermissions();

    const ownElement = API.createElement({
      type: "rectangle",
      authorId: "current-user",
      ...filledElementProps,
    });
    const foreignElement = API.createElement({
      type: "rectangle",
      authorId: "other-user",
      ...filledElementProps,
    });
    const elementWithoutAuthor = API.createElement({ type: "rectangle" });

    API.setElements([ownElement, foreignElement, elementWithoutAuthor]);
    API.executeAction(actionSelectAll);

    expect(API.getSelectedElements().map((element) => element.id)).toEqual([
      ownElement.id,
    ]);
  });

  it("selectAll lets admins select all unlocked elements", async () => {
    await renderWithOwnElementPermissions(true);

    const ownElement = API.createElement({
      type: "rectangle",
      authorId: "current-user",
    });
    const foreignElement = API.createElement({
      type: "rectangle",
      authorId: "other-user",
    });
    const elementWithoutAuthor = API.createElement({ type: "rectangle" });

    API.setElements([ownElement, foreignElement, elementWithoutAuthor]);
    API.executeAction(actionSelectAll);

    expect(API.getSelectedElements().map((element) => element.id)).toEqual([
      ownElement.id,
      foreignElement.id,
      elementWithoutAuthor.id,
    ]);
  });

  it("hit-testing ignores foreign elements when only own elements are editable", async () => {
    await renderWithOwnElementPermissions();

    const ownElement = API.createElement({
      type: "rectangle",
      authorId: "current-user",
    });
    const foreignElement = API.createElement({
      type: "rectangle",
      authorId: "other-user",
    });

    API.setElements([ownElement, foreignElement]);
    const originalHitElement = (h.app as any).hitElement;
    (h.app as any).hitElement = () => true;

    const hitElements = (h.app as any).getElementsAtPosition(50, 50);

    (h.app as any).hitElement = originalHitElement;

    expect(hitElements.map((element: typeof ownElement) => element.id)).toEqual(
      [ownElement.id],
    );
  });

  it("box-selection excludes foreign elements unless the user is an admin", async () => {
    await renderWithOwnElementPermissions();

    const selectionElement = API.createElement({
      type: "rectangle",
      x: -50,
      y: -50,
      width: 350,
      height: 350,
    });
    const ownElement = API.createElement({
      type: "rectangle",
      x: 0,
      y: 0,
      authorId: "current-user",
    });
    const foreignElement = API.createElement({
      type: "rectangle",
      x: 150,
      y: 150,
      authorId: "other-user",
    });

    API.setElements([ownElement, foreignElement]);

    expect(
      getElementsWithinSelection(
        h.app.scene.getNonDeletedElements(),
        selectionElement,
        h.app.scene.getNonDeletedElementsMap(),
        false,
        h.state.boxSelectionMode,
        {
          canSelectElement: (element) =>
            element.authorId !== undefined &&
            element.authorId === h.app.props.authorId,
        },
      ).map((element) => element.id),
    ).toEqual([ownElement.id]);

    await renderWithOwnElementPermissions(true);
    API.setElements([ownElement, foreignElement]);

    expect(
      getElementsWithinSelection(
        h.app.scene.getNonDeletedElements(),
        selectionElement,
        h.app.scene.getNonDeletedElementsMap(),
        false,
        h.state.boxSelectionMode,
        {
          canSelectElement: () => true,
        },
      ).map((element) => element.id),
    ).toEqual([ownElement.id, foreignElement.id]);
  });

  it("eraser deletes only editable own elements unless the user is an admin", async () => {
    await renderWithOwnElementPermissions();

    const ownElement = API.createElement({
      type: "rectangle",
      authorId: "current-user",
      ...filledElementProps,
    });
    const foreignElement = API.createElement({
      type: "rectangle",
      x: 150,
      y: 150,
      authorId: "other-user",
      ...filledElementProps,
    });

    API.setElements([ownElement, foreignElement]);
    h.app.visibleElements = h.app.scene.getNonDeletedElements();
    h.app.eraserTrail.startPath(0, 0);

    expect(h.app.eraserTrail.addPointToPath(100, 100)).toEqual([
      ownElement.id,
    ]);

    act(() => {
      (h.app as any).elementsPendingErasure = new Set([
        ownElement.id,
        foreignElement.id,
      ]);
      (h.app as any).eraseElements();
    });

    expect(h.app.scene.getElement(ownElement.id)?.isDeleted).toBe(true);
    expect(h.app.scene.getElement(foreignElement.id)?.isDeleted).toBe(false);

    await renderWithOwnElementPermissions(true);
    API.setElements([ownElement, foreignElement]);
    h.app.visibleElements = h.app.scene.getNonDeletedElements();
    h.app.eraserTrail.startPath(150, 150);

    expect(h.app.eraserTrail.addPointToPath(250, 250)).toContain(
      foreignElement.id,
    );

    act(() => {
      (h.app as any).elementsPendingErasure = new Set([foreignElement.id]);
      (h.app as any).eraseElements();
    });

    expect(h.app.scene.getElement(foreignElement.id)?.isDeleted).toBe(true);
  });
});
