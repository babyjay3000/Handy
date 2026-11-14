import React from "react";
import { useTranslation } from "react-i18next";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { useSettings } from "../../hooks/useSettings";

interface ChatTextOptionsProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

/** Chat-style cleanup: drop commas, shorten common phrases (tbh, LFG...). */
export const ChatTextOptions: React.FC<ChatTextOptionsProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();

    return (
      <>
        <ToggleSwitch
          checked={getSetting("remove_commas") ?? false}
          onChange={(value) => updateSetting("remove_commas", value)}
          isUpdating={isUpdating("remove_commas")}
          label={t("settings.advanced.chatText.removeCommasTitle")}
          description={t("settings.advanced.chatText.removeCommasDescription")}
          descriptionMode={descriptionMode}
          grouped={grouped}
        />
        <ToggleSwitch
          checked={getSetting("chat_abbreviations") ?? false}
          onChange={(value) => updateSetting("chat_abbreviations", value)}
          isUpdating={isUpdating("chat_abbreviations")}
          label={t("settings.advanced.chatText.abbreviationsTitle")}
          description={t("settings.advanced.chatText.abbreviationsDescription")}
          descriptionMode={descriptionMode}
          grouped={grouped}
        />
      </>
    );
  },
);
