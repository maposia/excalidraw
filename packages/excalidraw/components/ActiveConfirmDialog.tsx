import { atom, useAtom } from "jotai";
import { actionClearCanvas } from "../actions";
import { t } from "../i18n";
import { jotaiScope } from "../jotai";
import { useExcalidrawActionManager } from "./App";
import ConfirmDialog from "./ConfirmDialog";

export const activeConfirmDialogAtom = atom<"clearCanvas" | null>(null);

export const ActiveConfirmDialog = ({setOpenConfirmDialog, actionManager}) => {
  // const [activeConfirmDialog, setActiveConfirmDialog] = useAtom(
  //   activeConfirmDialogAtom,
  //   jotaiScope,
  // );
  // const actionManager = useExcalidrawActionManager();

  // if (!activeConfirmDialog) {
  //   return null;
  // }

  // if (activeConfirmDialog === "clearCanvas") {
    return (
      <ConfirmDialog
        onConfirm={() => {
          actionManager.executeAction(actionClearCanvas);
            setOpenConfirmDialog(false);
        }}
        onCancel={() => setOpenConfirmDialog(false)}
        title={t("clearCanvasDialog.title")}
      >
        <p className="clear-canvas__content"> {t("alerts.clearReset")}</p>
      </ConfirmDialog>
    );

};
