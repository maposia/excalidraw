import type { ExcalidrawElement } from "@excalidraw/element/types";

import type { ExcalidrawProps } from "./types";

type ElementPermissionProps = Pick<
  ExcalidrawProps,
  "authorId" | "canOnlyEditOwnElement" | "isAdmin"
>;

export const canEditElement = (
  element: ExcalidrawElement,
  appProps: ElementPermissionProps,
) => {
  if (appProps.isAdmin || !appProps.canOnlyEditOwnElement) {
    return true;
  }

  return (
    element.authorId !== undefined && element.authorId === appProps.authorId
  );
};
