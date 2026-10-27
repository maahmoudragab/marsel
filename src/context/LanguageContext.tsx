"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  type SupportedLanguage,
  type TranslationKey,
  type TranslatedProduct,
  UI_TRANSLATIONS,
  translateProduct as translateProductHelper,
  translateTitle as translateTitleHelper,
  translateColor as translateColorHelper,
} from "@/lib/translations";
import type { Product } from "@/lib/product";

const STORAGE_KEY = "marsel_lang";
const DEFAULT_LANGUAGE: SupportedLanguage = "en";

interface LanguageContextType {
  language: SupportedLanguage;
  dir: "ltr" | "rtl";
  isArabic: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  translateProduct: (product: Product) => TranslatedProduct;
  translateTitle: (title: string, slug?: string, styling_notes?: string | null) => string;
  translateColor: (color?: string | null) => string;
  formatPrice: (amount: number | null | undefined) => string;
  hydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const AR_FORMATTER = new Intl.NumberFormat("ar-EG");
const EN_FORMATTER = new Intl.NumberFormat("en-US");

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);
  const [hydrated, setHydrated] = useState(false);

  // Synchronize document attributes (lang and dir)
  const applyAttributes = useCallback((lang: SupportedLanguage) => {
    if (typeof document === "undefined") return;
    const isAr = lang === "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
  }, []);

  // Initialize and synchronize with cookie & localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (stored === "ar" || stored === "en") {
        if (stored !== language) {
          setLanguageState(stored);
          applyAttributes(stored);
        }
        document.cookie = `marsel_lang=${stored}; path=/; max-age=31536000; SameSite=Lax`;
      } else if (initialLanguage) {
        localStorage.setItem(STORAGE_KEY, initialLanguage);
        document.cookie = `marsel_lang=${initialLanguage}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch (err) {
      console.warn("Could not sync language storage:", err);
    }
    setHydrated(true);

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "ar" || e.newValue === "en")) {
        const nextLang = e.newValue as SupportedLanguage;
        setLanguageState(nextLang);
        applyAttributes(nextLang);
        document.cookie = `marsel_lang=${nextLang}; path=/; max-age=31536000; SameSite=Lax`;
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [applyAttributes, language, initialLanguage]);

  const setLanguage = useCallback(
    (newLang: SupportedLanguage) => {
      setLanguageState(newLang);
      applyAttributes(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
        document.cookie = `marsel_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (err) {
        console.warn("Could not write language to localStorage/cookie:", err);
      }
    },
    [applyAttributes]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "ar" : "en");
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
      return dict[key] ?? UI_TRANSLATIONS.en[key] ?? String(key);
    },
    [language]
  );

  const translateProduct = useCallback(
    (product: Product): TranslatedProduct => {
      return translateProductHelper(product, language);
    },
    [language]
  );

  const translateTitle = useCallback(
    (title: string, slug?: string, styling_notes?: string | null): string => {
      return translateTitleHelper(title, slug, language, styling_notes);
    },
    [language]
  );

  const translateColor = useCallback(
    (color?: string | null): string => {
      return translateColorHelper(color, language);
    },
    [language]
  );

  const formatPrice = useCallback(
    (amount: number | null | undefined): string => {
      if (amount == null) return "";
      const formatted = language === "ar" ? AR_FORMATTER.format(amount) : EN_FORMATTER.format(amount);
      const currency = language === "ar" ? "ج.م" : "EGP";
      return `${formatted} ${currency}`;
    },
    [language]
  );

  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const contextValue = useMemo<LanguageContextType>(
    () => ({
      language,
      dir,
      isArabic,
      setLanguage,
      toggleLanguage,
      t,
      translateProduct,
      translateTitle,
      translateColor,
      formatPrice,
      hydrated,
    }),
    [
      language,
      dir,
      isArabic,
      setLanguage,
      toggleLanguage,
      t,
      translateProduct,
      translateTitle,
      translateColor,
      formatPrice,
      hydrated,
    ]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
