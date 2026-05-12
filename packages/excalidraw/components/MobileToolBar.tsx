import { useState, useEffect } from "react";
import clsx from "clsx";

import { KEYS, capitalizeString } from "@excalidraw/common";

import { trackEvent } from "../analytics";

import { t } from "../i18n";

import { isHandToolActive } from "../appState";

import { HandButton } from "./HandButton";
import { ToolButton } from "./ToolButton";
import { ToolPopover } from "./ToolPopover";

import {
  SelectionIcon,
  FreedrawIcon,
  EraserIcon,
  RectangleIcon,
  ArrowIcon,
  DiamondIcon,
  EllipseIcon,
  LineIcon,
  TextIcon,
  ImageIcon,
  StickerIcon,
  LassoIcon,
} from "./icons";

import "./ToolIcon.scss";
import "./MobileToolBar.scss";

import type { AppClassProperties, ToolType, UIAppState } from "../types";
import type { AppProps } from "../types";

const SHAPE_TOOLS = [
  {
    type: "rectangle",
    icon: RectangleIcon,
    title: capitalizeString(t("toolBar.rectangle")),
  },
  {
    type: "diamond",
    icon: DiamondIcon,
    title: capitalizeString(t("toolBar.diamond")),
  },
  {
    type: "ellipse",
    icon: EllipseIcon,
    title: capitalizeString(t("toolBar.ellipse")),
  },
] as const;

const SELECTION_TOOLS = [
  {
    type: "selection",
    icon: SelectionIcon,
    title: capitalizeString(t("toolBar.selection")),
  },
  {
    type: "lasso",
    icon: LassoIcon,
    title: capitalizeString(t("toolBar.lasso")),
  },
] as const;

const LINEAR_ELEMENT_TOOLS = [
  {
    type: "arrow",
    icon: ArrowIcon,
    title: capitalizeString(t("toolBar.arrow")),
  },
  { type: "line", icon: LineIcon, title: capitalizeString(t("toolBar.line")) },
] as const;

type MobileToolBarProps = {
  app: AppClassProperties;
  onHandToolToggle: () => void;
  setAppState: React.Component<any, UIAppState>["setState"];
};

export const MobileToolBar = ({
  app,
  onHandToolToggle,
  setAppState,
}: MobileToolBarProps) => {
  const activeTool = app.state.activeTool;
  const [lastActiveGenericShape, setLastActiveGenericShape] = useState<
    "rectangle" | "diamond" | "ellipse"
  >("rectangle");
  const [lastActiveLinearElement, setLastActiveLinearElement] = useState<
    "arrow" | "line"
  >("arrow");

  // keep lastActiveGenericShape in sync with active tool if user switches via other UI
  useEffect(() => {
    if (
      activeTool.type === "rectangle" ||
      activeTool.type === "diamond" ||
      activeTool.type === "ellipse"
    ) {
      setLastActiveGenericShape(activeTool.type);
    }
  }, [activeTool.type]);

  // keep lastActiveLinearElement in sync with active tool if user switches via other UI
  useEffect(() => {
    if (activeTool.type === "arrow" || activeTool.type === "line") {
      setLastActiveLinearElement(activeTool.type);
    }
  }, [activeTool.type]);

  const stickerToolSelected = activeTool.type === "sticker";

  const isToolVisible = (
    tool: keyof NonNullable<AppProps["UIOptions"]["tools"]>,
  ) => app.props.UIOptions.tools?.[tool] !== false;

  const handleToolChange = (toolType: string, pointerType?: string) => {
    if (app.state.activeTool.type !== toolType) {
      trackEvent("toolbar", toolType, "ui");
    }

    if (toolType === "selection") {
      if (app.state.activeTool.type === "selection") {
        // Toggle selection tool behavior if needed
      } else {
        app.setActiveTool({ type: "selection" });
      }
    } else {
      app.setActiveTool({ type: toolType as ToolType });
    }
  };

  const [toolbarWidth, setToolbarWidth] = useState(0);

  const WIDTH = 36;
  const GAP = 4;

  // hand, selection, freedraw, eraser, rectangle, arrow
  const MIN_TOOLS = 6;
  const MIN_WIDTH = MIN_TOOLS * WIDTH + (MIN_TOOLS - 1) * GAP;
  const ADDITIONAL_WIDTH = WIDTH + GAP;

  const showTextToolOutside = toolbarWidth >= MIN_WIDTH + 1 * ADDITIONAL_WIDTH;
  const showImageToolOutside = toolbarWidth >= MIN_WIDTH + 2 * ADDITIONAL_WIDTH;
  const showStickerToolOutside =
    toolbarWidth >= MIN_WIDTH + 3 * ADDITIONAL_WIDTH;

  return (
    <div
      className="mobile-toolbar"
      ref={(div) => {
        if (div) {
          setToolbarWidth(div.getBoundingClientRect().width);
        }
      }}
    >
      {/* Hand Tool */}
      <HandButton
        checked={isHandToolActive(app.state)}
        onChange={onHandToolToggle}
        title={t("toolBar.hand")}
        isMobile
      />

      {/* Selection Tool */}
      <ToolPopover
        app={app}
        options={SELECTION_TOOLS}
        activeTool={activeTool}
        defaultOption={app.state.preferredSelectionTool.type}
        namePrefix="selectionType"
        title={capitalizeString(t("toolBar.selection"))}
        data-testid="toolbar-selection"
        onToolChange={(type: string) => {
          if (type === "selection" || type === "lasso") {
            app.setActiveTool({ type });
            setAppState({
              preferredSelectionTool: { type, initialized: true },
            });
          }
        }}
        displayedOption={
          SELECTION_TOOLS.find(
            (tool) => tool.type === app.state.preferredSelectionTool.type,
          ) || SELECTION_TOOLS[0]
        }
      />

      {/* Free Draw */}
      <ToolButton
        className={clsx({
          active: activeTool.type === "freedraw",
        })}
        type="radio"
        icon={FreedrawIcon}
        checked={activeTool.type === "freedraw"}
        name="editor-current-shape"
        title={`${capitalizeString(t("toolBar.freedraw"))}`}
        aria-label={capitalizeString(t("toolBar.freedraw"))}
        data-testid="toolbar-freedraw"
        onChange={() => handleToolChange("freedraw")}
      />

      {/* Eraser */}
      <ToolButton
        className={clsx({
          active: activeTool.type === "eraser",
        })}
        type="radio"
        icon={EraserIcon}
        checked={activeTool.type === "eraser"}
        name="editor-current-shape"
        title={`${capitalizeString(t("toolBar.eraser"))}`}
        aria-label={capitalizeString(t("toolBar.eraser"))}
        data-testid="toolbar-eraser"
        onChange={() => handleToolChange("eraser")}
      />

      {/* Rectangle */}
      <ToolPopover
        app={app}
        options={SHAPE_TOOLS}
        activeTool={activeTool}
        defaultOption={lastActiveGenericShape}
        namePrefix="shapeType"
        title={capitalizeString(
          t(
            lastActiveGenericShape === "rectangle"
              ? "toolBar.rectangle"
              : lastActiveGenericShape === "diamond"
              ? "toolBar.diamond"
              : lastActiveGenericShape === "ellipse"
              ? "toolBar.ellipse"
              : "toolBar.rectangle",
          ),
        )}
        data-testid="toolbar-rectangle"
        onToolChange={(type: string) => {
          if (
            type === "rectangle" ||
            type === "diamond" ||
            type === "ellipse"
          ) {
            setLastActiveGenericShape(type);
            app.setActiveTool({ type });
          }
        }}
        displayedOption={
          SHAPE_TOOLS.find((tool) => tool.type === lastActiveGenericShape) ||
          SHAPE_TOOLS[0]
        }
      />

      {/* Arrow/Line */}
      <ToolPopover
        app={app}
        options={LINEAR_ELEMENT_TOOLS}
        activeTool={activeTool}
        defaultOption={lastActiveLinearElement}
        namePrefix="linearElementType"
        title={capitalizeString(
          t(
            lastActiveLinearElement === "arrow"
              ? "toolBar.arrow"
              : "toolBar.line",
          ),
        )}
        data-testid="toolbar-arrow"
        fillable={true}
        onToolChange={(type: string) => {
          if (type === "arrow" || type === "line") {
            setLastActiveLinearElement(type);
            app.setActiveTool({ type });
          }
        }}
        displayedOption={
          LINEAR_ELEMENT_TOOLS.find(
            (tool) => tool.type === lastActiveLinearElement,
          ) || LINEAR_ELEMENT_TOOLS[0]
        }
      />

      {/* Text Tool */}
      {showTextToolOutside && (
        <ToolButton
          className={clsx({
            active: activeTool.type === "text",
          })}
          type="radio"
          icon={TextIcon}
          checked={activeTool.type === "text"}
          name="editor-current-shape"
          title={`${capitalizeString(t("toolBar.text"))}`}
          aria-label={capitalizeString(t("toolBar.text"))}
          data-testid="toolbar-text"
          onChange={() => handleToolChange("text")}
        />
      )}

      {/* Image */}
      {showImageToolOutside && isToolVisible("image") && (
        <ToolButton
          className={clsx({
            active: activeTool.type === "image",
          })}
          type="radio"
          icon={ImageIcon}
          checked={activeTool.type === "image"}
          name="editor-current-shape"
          title={`${capitalizeString(t("toolBar.image"))}`}
          aria-label={capitalizeString(t("toolBar.image"))}
          data-testid="toolbar-image"
          onChange={() => handleToolChange("image")}
        />
      )}

      {/* Sticker */}
      {showStickerToolOutside && isToolVisible("sticker") && (
        <ToolButton
          className={clsx({ active: stickerToolSelected })}
          type="radio"
          icon={StickerIcon}
          checked={stickerToolSelected}
          name="editor-current-shape"
          title={`${capitalizeString(t("toolBar.sticker"))}`}
          aria-label={capitalizeString(t("toolBar.sticker"))}
          data-testid="toolbar-sticker"
          onChange={() => handleToolChange("sticker")}
        />
      )}

    </div>
  );
};
