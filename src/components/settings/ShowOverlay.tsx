import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../ui/Dropdown";
import { SettingContainer } from "../ui/SettingContainer";
import { Button } from "../ui/Button";
import { commands } from "@/bindings";
import { useSettings } from "../../hooks/useSettings";
import type { OverlayPosition, OverlayStyle, OverlayTheme } from "@/bindings";

interface ShowOverlayProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const ShowOverlay: React.FC<ShowOverlayProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating, refreshSettings } =
      useSettings();
    const [moving, setMoving] = useState(false);
    const hasCustomPosition = getSetting("overlay_custom_position") != null;

    const startMoving = async () => {
      await commands.startOverlayPositioning();
      setMoving(true);
    };
    const finishMoving = async () => {
      await commands.finishOverlayPositioning();
      setMoving(false);
      await refreshSettings();
    };
    const resetPosition = async () => {
      await commands.resetOverlayPosition();
      await refreshSettings();
    };

    const styleOptions = [
      {
        value: "none",
        label: t("settings.advanced.overlay.style.options.none"),
      },
      {
        value: "minimal",
        label: t("settings.advanced.overlay.style.options.minimal"),
      },
      {
        value: "live",
        label: t("settings.advanced.overlay.style.options.live"),
      },
    ];

    const positionOptions = [
      {
        value: "bottom",
        label: t("settings.advanced.overlay.position.options.bottom"),
      },
      {
        value: "top",
        label: t("settings.advanced.overlay.position.options.top"),
      },
    ];

    const themeOptions = [
      {
        value: "default",
        label: t("settings.advanced.overlay.theme.options.default"),
      },
      {
        value: "classic",
        label: t("settings.advanced.overlay.theme.options.classic"),
      },
    ];
    const selectedTheme = (getSetting("overlay_theme") ||
      "default") as OverlayTheme;

    const selectedStyle = (getSetting("overlay_style") ||
      "live") as OverlayStyle;
    // Only "top" and "bottom" are selectable; anything else (empty, or a legacy
    // "none" from before the position was retired) falls back to "bottom".
    const selectedPosition: OverlayPosition =
      getSetting("overlay_position") === "top" ? "top" : "bottom";

    return (
      <>
        <SettingContainer
          title={t("settings.advanced.overlay.style.title")}
          description={t("settings.advanced.overlay.style.description")}
          descriptionMode={descriptionMode}
          grouped={grouped}
        >
          <Dropdown
            options={styleOptions}
            selectedValue={selectedStyle}
            onSelect={(value) =>
              updateSetting("overlay_style", value as OverlayStyle)
            }
            disabled={isUpdating("overlay_style")}
          />
        </SettingContainer>

        {selectedStyle !== "none" && (
          <SettingContainer
            title={t("settings.advanced.overlay.position.title")}
            description={t("settings.advanced.overlay.position.description")}
            descriptionMode={descriptionMode}
            grouped={grouped}
          >
            <Dropdown
              options={positionOptions}
              selectedValue={selectedPosition}
              onSelect={(value) =>
                updateSetting("overlay_position", value as OverlayPosition)
              }
              disabled={isUpdating("overlay_position")}
            />
          </SettingContainer>
        )}

        {selectedStyle !== "none" && (
          <SettingContainer
            title={t("settings.advanced.overlay.theme.title")}
            description={t("settings.advanced.overlay.theme.description")}
            descriptionMode={descriptionMode}
            grouped={grouped}
          >
            <Dropdown
              options={themeOptions}
              selectedValue={selectedTheme}
              onSelect={(value) =>
                updateSetting("overlay_theme", value as OverlayTheme)
              }
              disabled={isUpdating("overlay_theme")}
            />
          </SettingContainer>
        )}

        {selectedStyle !== "none" && (
          <SettingContainer
            title={t("settings.advanced.overlay.move.title")}
            description={t("settings.advanced.overlay.move.description")}
            descriptionMode={descriptionMode}
            grouped={grouped}
          >
            <div className="flex gap-2">
              {moving ? (
                <Button size="sm" onClick={finishMoving}>
                  {t("settings.advanced.overlay.move.done")}
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={startMoving}>
                  {t("settings.advanced.overlay.move.start")}
                </Button>
              )}
              {hasCustomPosition && !moving && (
                <Button size="sm" variant="ghost" onClick={resetPosition}>
                  {t("settings.advanced.overlay.move.reset")}
                </Button>
              )}
            </div>
          </SettingContainer>
        )}
      </>
    );
  },
);
