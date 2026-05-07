import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";

export const AppMainMenu = React.memo(() => {
  return (
    <MainMenu>
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
});
