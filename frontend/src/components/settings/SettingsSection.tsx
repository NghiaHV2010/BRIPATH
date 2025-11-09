import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, Palette, Globe } from "lucide-react";
import { useSettingsStore } from "@/store/settings.store";
import { useAuthStore } from "@/store/auth";

export function SettingsSection() {
  const { isCompany, isUser } = useAuthStore();
  const {
    settings,
    loading,
    updating,
    coverLetters,
    fetchSettings,
    updateSetting,
    setSelectedOption,
    setCoverLetter,
    saveCoverLetter,
  } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleOptionChange = async (
    settingKey: string,
    optionId: number,
    optionName: string,
    silent = false
  ) => {
    if (optionName === "Mặc định") {
      setCoverLetter(settingKey, "");
      await updateSetting(settingKey, optionId, "", silent);
    } else if (optionName === "Tự động") {
      setSelectedOption(settingKey, optionName);
    } else {
      await updateSetting(
        settingKey,
        optionId,
        coverLetters[settingKey] || "",
        silent
      );
    }
  };

  const handleSaveCoverLetter = async (settingKey: string) => {
    await saveCoverLetter(settingKey);
  };

  // Filter settings based on role
  const generalSettings = settings.filter(
    s => s.key === "theme_mode" || s.key === "language"
  );

  const autoResponseSettings = settings.filter(
    s => s.key === "auto_response_accept" || s.key === "auto_response_reject"
  );

  const coverLetterSetting = settings.filter(s => s.key === "cover_letter");

  const hasGeneralSettings = generalSettings.length > 0;
  const hasAutoResponse = isCompany() && autoResponseSettings.length > 0;
  const hasCoverLetter = isUser() && coverLetterSetting.length > 0;

  if (!hasGeneralSettings && !hasAutoResponse && !hasCoverLetter) {
    return null;
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold">Cài đặt</h2>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header outside card */}
      <div className="flex items-center gap-3 mb-4">
        <Settings className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-bold">Cài đặt</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* General Settings: Theme & Language */}
            {hasGeneralSettings && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 divide-y lg:divide-y-0 lg:divide-x">
                {/* Theme - SWITCH */}
                {generalSettings.find(s => s.key === "theme_mode") &&
                  (() => {
                    const setting = generalSettings.find(
                      s => s.key === "theme_mode"
                    )!;
                    const darkOption = setting.options.find(
                      o => o.option === "Tối"
                    );
                    const lightOption = setting.options.find(
                      o => o.option === "Sáng"
                    );
                    const isDark = setting.selectedOption === "Tối";
                    const onToggle = async () => {
                      const target = isDark ? lightOption : darkOption;
                      if (!target) return;
                      await updateSetting(setting.key, target.id, "", true);
                    };

                    return (
                      <div
                        key={setting.key}
                        className="space-y-3 pt-0 pb-6 lg:pb-0 lg:pr-6"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-muted-foreground" />
                          <Label className="text-base font-semibold">
                            {setting.name}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3 ml-7">
                          <Switch
                            id="theme-toggle"
                            checked={isDark}
                            onCheckedChange={onToggle}
                            disabled={updating}
                          />
                          <span className="text-sm text-muted-foreground">
                            {isDark ? "Tối" : "Sáng"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                {/* Language */}
                {generalSettings.find(s => s.key === "language") &&
                  (() => {
                    const setting = generalSettings.find(
                      s => s.key === "language"
                    )!;
                    return (
                      <div
                        key={setting.key}
                        className="space-y-3 pt-6 lg:pt-0 lg:pl-6"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-muted-foreground" />
                          <Label className="text-base font-semibold">
                            {setting.name}
                          </Label>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-7">
                          {setting.options.map(opt => (
                            <Button
                              key={opt.id}
                              variant={
                                opt.option === setting.selectedOption
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleOptionChange(
                                  setting.key,
                                  opt.id,
                                  opt.option,
                                  true
                                )
                              }
                              disabled={updating}
                              className="min-w-[100px]"
                            >
                              {opt.option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}

            {/* Company: Auto Response Settings */}
            {hasAutoResponse && (
              <div className="space-y-6 pt-2 border-t">
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
                  Phản hồi tự động
                </h3>
                <div className="space-y-6">
                  {autoResponseSettings.map(setting => (
                    <div key={setting.key} className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Label className="text-base font-semibold">
                          {setting.name}
                        </Label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {setting.options.map(opt => (
                          <Button
                            key={opt.id}
                            variant={
                              opt.option === setting.selectedOption
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleOptionChange(
                                setting.key,
                                opt.id,
                                opt.option
                              )
                            }
                            disabled={updating}
                          >
                            {opt.option}
                            {opt.is_default && (
                              <span className="ml-1 text-xs opacity-70">
                                (mặc định)
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                      {/* Textarea for auto response */}
                      {(() => {
                        const selectedOpt = setting.options.find(
                          o => o.option === setting.selectedOption
                        );
                        if (!selectedOpt || selectedOpt.option !== "Tự động")
                          return null;

                        return (
                          <div className="space-y-2 pl-0 sm:pl-4">
                            <Label
                              htmlFor={`auto-response-${setting.key}`}
                              className="text-sm"
                            >
                              Lời nhắn:
                            </Label>
                            <Textarea
                              id={`auto-response-${setting.key}`}
                              placeholder="Nhập nội dung phản hồi tự động..."
                              value={coverLetters[setting.key] || ""}
                              onChange={e =>
                                setCoverLetter(setting.key, e.target.value)
                              }
                              disabled={updating}
                              className="min-h-[100px] resize-y"
                            />
                            <div className="flex justify-end pt-1">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveCoverLetter(setting.key)
                                }
                                disabled={updating}
                              >
                                {updating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                  </>
                                ) : (
                                  "Lưu mô tả"
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User: Cover Letter Setting */}
            {hasCoverLetter && (
              <div className="space-y-6 pt-2 border-t">
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
                  Cover Letter
                </h3>
                <div className="space-y-6">
                  {coverLetterSetting.map(setting => (
                    <div key={setting.key} className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {setting.options.map(opt => (
                          <Button
                            key={opt.id}
                            variant={
                              opt.option === setting.selectedOption
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleOptionChange(
                                setting.key,
                                opt.id,
                                opt.option
                              )
                            }
                            disabled={updating}
                          >
                            {opt.option}
                            {opt.is_default && (
                              <span className="ml-1 text-xs opacity-70">
                                (mặc định)
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                      {/* Textarea for cover letter */}
                      {(() => {
                        const selectedOpt = setting.options.find(
                          o => o.option === setting.selectedOption
                        );
                        if (!selectedOpt || selectedOpt.option !== "Tự động")
                          return null;

                        return (
                          <div className="space-y-2 pl-0 sm:pl-4">
                            <Label
                              htmlFor={`cover-letter-${setting.key}`}
                              className="text-sm"
                            >
                              Nội dung:
                            </Label>
                            <Textarea
                              id={`cover-letter-${setting.key}`}
                              placeholder="Nhập nội dung cover letter của bạn..."
                              value={coverLetters[setting.key] || ""}
                              onChange={e =>
                                setCoverLetter(setting.key, e.target.value)
                              }
                              disabled={updating}
                              className="min-h-[150px] resize-y"
                            />
                            <div className="flex justify-end pt-1">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveCoverLetter(setting.key)
                                }
                                disabled={updating}
                              >
                                {updating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                  </>
                                ) : (
                                  "Lưu cover letter"
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
