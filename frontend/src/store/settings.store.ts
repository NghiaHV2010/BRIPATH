import { create } from "zustand";
import { getUserSettings, updateUserSettings } from "@/api";
import { toast } from "sonner";

interface SettingOption {
  id: number;
  setting_id: number;
  option: string;
  is_default: boolean;
}

interface Setting {
  id: number;
  key: string;
  name: string;
  type: string;
  options: SettingOption[];
  selectedOption: string;
  customValue: string | null;
  role: string | null;
}

interface SettingsState {
  settings: Setting[];
  loading: boolean;
  updating: boolean;
  coverLetters: { [key: string]: string };

  // Actions
  fetchSettings: () => Promise<void>;
  updateSetting: (settingKey: string, optionId: number, customValue?: string, silent?: boolean) => Promise<void>;
  setSelectedOption: (settingKey: string, optionName: string) => void;
  setCoverLetter: (settingKey: string, value: string) => void;
  saveCoverLetter: (settingKey: string) => Promise<void>;

  // Helpers
  getSettingByKey: (key: string) => Setting | undefined;
  getCoverLetter: (key: string) => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: [],
  loading: false,
  updating: false,
  coverLetters: {},

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await getUserSettings();
      if (response && response.success) {
        set({ settings: response.data });
        
        // Khởi tạo coverLetters từ customValue
        const initialCoverLetters: { [key: string]: string } = {};
        response.data.forEach((setting: Setting) => {
          if (setting.customValue) {
            initialCoverLetters[setting.key] = setting.customValue;
          }
        });
        set({ coverLetters: initialCoverLetters });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Không thể tải cài đặt");
    } finally {
      set({ loading: false });
    }
  },

  updateSetting: async (settingKey: string, optionId: number, customValue = "", silent = false) => {
    set({ updating: true });
    try {
      const response = await updateUserSettings({
        settingKey,
        optionId,
        customValue,
      });
      
      if (response && response.success) {
        if (!silent) toast.success("Cập nhật cài đặt thành công");
        // Refresh settings
        await get().fetchSettings();
      } else {
        if (!silent) toast.error("Không thể cập nhật cài đặt");
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      if (!silent) toast.error("Có lỗi xảy ra khi cập nhật");
    } finally {
      set({ updating: false });
    }
  },

  setCoverLetter: (settingKey: string, value: string) => {
    set((state) => ({
      coverLetters: {
        ...state.coverLetters,
        [settingKey]: value,
      },
    }));
  },

  setSelectedOption: (settingKey: string, optionName: string) => {
    set((state) => ({
      settings: state.settings.map((s) =>
        s.key === settingKey ? { ...s, selectedOption: optionName } : s
      ),
    }));
  },

  saveCoverLetter: async (settingKey: string) => {
    set({ updating: true });
    try {
      const { settings, coverLetters } = get();
      const setting = settings.find((s) => s.key === settingKey);
      if (!setting) {
        toast.error("Không tìm thấy cài đặt");
        return;
      }

      const selectedOption = setting.options.find(
        (opt) => opt.option === setting.selectedOption
      );
      if (!selectedOption) {
        toast.error("Không tìm thấy option");
        return;
      }

      const response = await updateUserSettings({
        settingKey,
        optionId: selectedOption.id,
        customValue: coverLetters[settingKey] || "",
      });

      if (response && response.success) {
        toast.success("Lưu cover letter thành công");
        await get().fetchSettings();
      } else {
        toast.error("Không thể lưu cover letter");
      }
    } catch (error) {
      console.error("Error saving cover letter:", error);
      toast.error("Có lỗi xảy ra khi lưu cover letter");
    } finally {
      set({ updating: false });
    }
  },

  getSettingByKey: (key: string) => {
    const { settings } = get();
    return settings.find((s) => s.key === key);
  },

  getCoverLetter: (key: string) => {
    const { coverLetters } = get();
    return coverLetters[key] || "";
  },
}));
